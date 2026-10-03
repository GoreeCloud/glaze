#!/usr/bin/env python3
"""Compare Glaze V1.7 retained-v1.2 rendered evidence for exact-source regression qualification."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from pathlib import Path
from typing import Any

SOURCE="4b9d085a5177b96cc31d4270b38d792a59872e37"
SOURCE_MODEL="1.7.0-dev.47"
ACCEPTANCE_MODEL="1.7.0-dev.39"
STABLE_BASELINE="1.6.0"
PRIOR_RUN_ID=37144536213
PRIOR_ARTIFACT_ID=11281038583
PRIOR_ARTIFACT_DIGEST="sha256:9b862d7da7d5aaf389507f9005edcdf141095593c8c4b30c26ff354e46da5018"
SCENE_COUNT=22

class QualificationError(RuntimeError):
    pass

def require(condition: bool, message: str) -> None:
    if not condition:
        raise QualificationError(message)

def read_json(path: Path) -> dict[str, Any]:
    require(path.is_file(), f"missing JSON file: {path}")
    value=json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(value,dict), f"JSON root must be object: {path}")
    return value

def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def verify_manifest(manifest: dict[str,Any], label: str) -> dict[str,dict[str,Any]]:
    require(manifest.get("recordType")=="glaze-v1.7-v1.2-rendered-browser-capture", f"{label} record type drifted")
    require(manifest.get("sourceRevision")==SOURCE, f"{label} source revision mismatch")
    require(manifest.get("sourceModelVersion")==SOURCE_MODEL, f"{label} source model mismatch")
    require(manifest.get("acceptanceModelVersion")==ACCEPTANCE_MODEL, f"{label} acceptance model mismatch")
    require(manifest.get("stableBaseline")==STABLE_BASELINE, f"{label} stable baseline mismatch")
    require(manifest.get("sceneCount")==SCENE_COUNT, f"{label} scene count mismatch")
    require(manifest.get("passed") is True, f"{label} manifest did not pass")
    authority=manifest.get("authority") or {}
    require(authority.get("renderedBrowserOnly") is True, f"{label} rendered-browser boundary drifted")
    require(authority.get("regressionBaselineClaimed") is False, f"{label} unexpectedly claims regression baseline authority")
    scenes=manifest.get("scenes")
    require(isinstance(scenes,list) and len(scenes)==SCENE_COUNT, f"{label} scenes missing")
    mapped={}
    for scene in scenes:
        require(isinstance(scene,dict), f"{label} scene must be object")
        scene_id=str(scene.get("id","")).strip()
        require(scene_id and scene_id not in mapped, f"{label} duplicate/empty scene id")
        require(scene.get("passed") is True, f"{label} scene failed: {scene_id}")
        for key in ("evidenceSha256","screenshotSha256","pixelSha256"):
            require(isinstance(scene.get(key),str) and len(scene[key])==64, f"{label} missing {key}: {scene_id}")
        mapped[scene_id]=scene
    return mapped

def compare(prior: Path, fresh_a: Path, fresh_b: Path, output: Path, plan: Path) -> dict[str,Any]:
    plan_data=read_json(plan)
    require(plan_data.get("sourceRevision")==SOURCE, "regression plan source revision drifted")
    require(plan_data.get("sourceModelVersion")==SOURCE_MODEL, "regression plan source model drifted")
    require(plan_data.get("acceptanceModelVersion")==ACCEPTANCE_MODEL, "regression plan acceptance model drifted")
    require(plan_data.get("laneId")=="regression", "regression plan lane drifted")
    prior_meta=plan_data.get("priorRenderedEvidence") or {}
    require(prior_meta.get("runId")==PRIOR_RUN_ID, "prior run id drifted")
    require(prior_meta.get("artifactId")==PRIOR_ARTIFACT_ID, "prior artifact id drifted")
    require(prior_meta.get("artifactDigest")==PRIOR_ARTIFACT_DIGEST, "prior artifact digest drifted")
    require(prior_meta.get("pixelBaselineClaimed") is False, "prior artifact must not be reclassified as pixel baseline")
    comparison=plan_data.get("comparison") or {}
    require(comparison.get("kind")=="semantic-baseline-plus-double-render-pixel-sha256-exact", "comparison kind drifted")
    require(comparison.get("pixelTolerance")==0, "pixel tolerance must remain zero")

    prior_manifest=read_json(prior/"manifest.json")
    a_manifest=read_json(fresh_a/"manifest.json")
    b_manifest=read_json(fresh_b/"manifest.json")
    old=verify_manifest(prior_manifest,"prior")
    first=verify_manifest(a_manifest,"fresh-a")
    second=verify_manifest(b_manifest,"fresh-b")
    scene_ids=sorted(old)
    require(scene_ids==sorted(first)==sorted(second), "scene sets differ")
    expected=sorted(str(value) for value in plan_data.get("sceneIds",[]))
    require(scene_ids==expected, "scene set does not match regression plan")

    semantic_mismatches=[]
    fresh_visual_mismatches=[]
    prior_pixel_drift=[]
    prior_png_drift=[]
    for scene_id in scene_ids:
        o=old[scene_id]
        a=first[scene_id]
        b=second[scene_id]
        if o["evidenceSha256"]!=a["evidenceSha256"] or a["evidenceSha256"]!=b["evidenceSha256"]:
            semantic_mismatches.append({
                "id":scene_id,
                "prior":o["evidenceSha256"],
                "freshA":a["evidenceSha256"],
                "freshB":b["evidenceSha256"],
            })
        if a["pixelSha256"]!=b["pixelSha256"]:
            fresh_visual_mismatches.append({
                "id":scene_id,
                "freshA":a["pixelSha256"],
                "freshB":b["pixelSha256"],
            })
        if o["pixelSha256"]!=a["pixelSha256"]:
            prior_pixel_drift.append(scene_id)
        if o["screenshotSha256"]!=a["screenshotSha256"]:
            prior_png_drift.append(scene_id)

    passed=not semantic_mismatches and not fresh_visual_mismatches
    output.mkdir(parents=True,exist_ok=True)
    result={
        "schemaVersion":1,
        "recordType":"glaze-v1.7-v1.2-rendered-regression-comparison",
        "lifecycle":"DevelopmentQualification",
        "sourceRevision":SOURCE,
        "sourceModelVersion":SOURCE_MODEL,
        "acceptanceModelVersion":ACCEPTANCE_MODEL,
        "stableBaseline":STABLE_BASELINE,
        "laneId":"regression",
        "toolingRevision":os.environ.get("GITHUB_SHA"),
        "workflowRunId":os.environ.get("GITHUB_RUN_ID"),
        "priorRenderedEvidence":{
            "runId":PRIOR_RUN_ID,
            "artifactId":PRIOR_ARTIFACT_ID,
            "artifactDigest":PRIOR_ARTIFACT_DIGEST,
            "pixelBaselineClaimed":False,
        },
        "comparisonKind":"semantic-baseline-plus-double-render-pixel-sha256-exact",
        "pixelTolerance":0,
        "sceneCount":SCENE_COUNT,
        "semanticMismatches":semantic_mismatches,
        "freshVisualMismatches":fresh_visual_mismatches,
        "priorPixelDriftSceneIdsInformationalOnly":prior_pixel_drift,
        "priorPngDriftSceneIdsInformationalOnly":prior_png_drift,
        "semanticBaselineMatched":not semantic_mismatches,
        "freshVisualRepeatabilityMatched":not fresh_visual_mismatches,
        "freshCaptureCount":2,
        "passed":passed,
        "authority":{
            "renderedRegressionOnly":True,
            "priorArtifactReclassifiedAsPixelBaseline":False,
            "humanEvidenceClaimed":False,
            "assistiveTechnologyEvidenceClaimed":False,
            "physicalDeviceEvidenceClaimed":False,
            "nativePlatformEvidenceClaimed":False,
            "representativePerformanceEvidenceClaimed":False,
            "energyEvidenceClaimed":False,
            "governedReviewAcceptanceClaimed":False,
            "section46CompleteClaimed":False,
            "v17AcceptanceClaimed":False,
            "anchorStatusGranted":False,
            "consumerEligibilityGranted":False,
            "deploymentAcceptanceGranted":False,
            "productionAcceptanceGranted":False,
            "lifecyclePromotionAutomatic":False,
        },
    }
    result_path=output/"regression-result.json"
    result_path.write_text(json.dumps(result,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    result_digest=sha256(result_path)
    evidence=[{
        "id":"regression",
        "verified":True,
        "revision":SOURCE,
        "evidenceType":"rendered",
        "reference":f"evidence+sha256:{result_digest}:v1.7/v1.2-regression/regression-result.json",
    }] if passed else []
    evidence_path=output/"regression-evidence.json"
    evidence_path.write_text(json.dumps(evidence,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    manifest={
        "schemaVersion":1,
        "recordType":"glaze-v1.7-v1.2-rendered-regression-qualification",
        "lifecycle":"DevelopmentQualification",
        "sourceRevision":SOURCE,
        "sourceModelVersion":SOURCE_MODEL,
        "acceptanceModelVersion":ACCEPTANCE_MODEL,
        "stableBaseline":STABLE_BASELINE,
        "priorRunId":PRIOR_RUN_ID,
        "priorArtifactId":PRIOR_ARTIFACT_ID,
        "priorArtifactDigest":PRIOR_ARTIFACT_DIGEST,
        "sceneCount":SCENE_COUNT,
        "pixelTolerance":0,
        "regressionResultSha256":result_digest,
        "regressionEvidenceSha256":sha256(evidence_path),
        "passed":passed,
        "authority":result["authority"],
    }
    (output/"manifest.json").write_text(json.dumps(manifest,indent=2,sort_keys=True)+"\n",encoding="utf-8")

    require(passed, "rendered regression comparison failed")
    return manifest

def main() -> None:
    parser=argparse.ArgumentParser()
    parser.add_argument("--prior",required=True)
    parser.add_argument("--fresh-a",required=True)
    parser.add_argument("--fresh-b",required=True)
    parser.add_argument("--plan",default="contracts/v1.7/qualification.v1.2.regression.plan.json")
    parser.add_argument("--out",default="artifacts/v1.7-v1.2-regression")
    args=parser.parse_args()
    manifest=compare(Path(args.prior),Path(args.fresh_a),Path(args.fresh_b),Path(args.out),Path(args.plan))
    print("Glaze V1.7 retained-v1.2 rendered regression qualification: PASS")
    print(f"Semantic scenes matched prior exact-source evidence: {manifest['sceneCount']}")
    print(f"Fresh normalized decoded pixels matched exactly: {manifest['sceneCount']}")
    print("Pixel tolerance: 0")
    print("Boundary: rendered Regression group only; no human/device/AT/performance/energy/release authority is granted.")

if __name__=="__main__":
    try:
        main()
    except QualificationError as error:
        print(f"Glaze V1.7 rendered regression qualification FAILED: {error}",file=sys.stderr)
        raise SystemExit(1)
