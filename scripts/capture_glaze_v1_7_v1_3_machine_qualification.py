#!/usr/bin/env python3
"""Capture exact-source Glaze V1.7 v1.3 machine qualification evidence."""
from __future__ import annotations

import argparse
import hashlib
import json
import shlex
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

SOURCE_REVISION="4b9d085a5177b96cc31d4270b38d792a59872e37"
MODEL_VERSION="1.7.0-dev.47"

class QualificationError(RuntimeError):
    pass

def require(condition: bool, message: str) -> None:
    if not condition:
        raise QualificationError(message)

def load_json(path: Path) -> dict[str, Any]:
    require(path.is_file(), f"missing JSON file: {path}")
    value=json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(value,dict), f"JSON root must be an object: {path}")
    return value

def git_revision(root: Path) -> str:
    try:
        return subprocess.check_output(
            ["git","rev-parse","HEAD"],cwd=root,text=True,stderr=subprocess.STDOUT
        ).strip()
    except Exception as error:
        raise QualificationError(f"could not resolve git revision for {root}: {error}") from error

def git_clean(root: Path) -> bool:
    result=subprocess.run(
        ["git","status","--porcelain","--untracked-files=no"],
        cwd=root,text=True,capture_output=True,check=False
    )
    require(result.returncode==0,f"could not inspect git status for {root}: {result.stderr}")
    return result.stdout.strip()==""

def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def safe_command(command: str) -> list[str]:
    require(command.startswith("node scripts/validate_glaze_v1_7_"),f"unsupported machine evidence command: {command}")
    for token in (";","&&","||","|",">","<","$("):
        require(token not in command,f"machine evidence command contains shell syntax: {command}")
    argv=shlex.split(command)
    require(len(argv)==2 and argv[0]=="node" and argv[1].startswith("scripts/validate_glaze_v1_7_"),f"invalid machine evidence command: {command}")
    return argv

def capture(source_root: Path, tooling_root: Path, plan_path: Path, output: Path) -> dict[str,Any]:
    plan=load_json(plan_path)
    require(plan.get("sourceRevision")==SOURCE_REVISION,"machine plan source revision drifted")
    require(plan.get("acceptanceModelVersion")==MODEL_VERSION,"machine plan model version drifted")
    require(plan.get("networkPolicy")=="repository-local-only","machine plan network policy drifted")
    require(plan.get("evidenceType")=="machine","machine plan evidence type drifted")
    checks=plan.get("checks")
    require(isinstance(checks,list) and len(checks)>=1,"machine plan must define checks")
    expected=plan.get("expectedMachineLaneIds")
    expected_section48=plan.get("expectedSection48MachineLaneIds")
    expected_coverage=plan.get("expectedCoverageMachineLaneIds")
    require(isinstance(expected,list) and len(expected)>=1,"machine plan expected lane list missing")
    require(isinstance(expected_section48,list) and len(expected_section48)>=1,"machine plan Section 48 lane list missing")
    require(isinstance(expected_coverage,list) and len(expected_coverage)>=1,"machine plan coverage lane list missing")

    actual_source=git_revision(source_root)
    require(actual_source==SOURCE_REVISION,f"frozen source mismatch: expected {SOURCE_REVISION}, got {actual_source}")
    require(git_clean(source_root),"frozen source has tracked modifications")
    tooling_revision=git_revision(tooling_root)

    output.mkdir(parents=True,exist_ok=True)
    logs_dir=output/"logs"
    logs_dir.mkdir(parents=True,exist_ok=True)

    evidence=[]
    check_records=[]
    seen_lanes=set()
    for check in checks:
        require(isinstance(check,dict),"machine check must be an object")
        check_id=str(check.get("id","")).strip()
        require(check_id and all(ch.isalnum() or ch in "-_" for ch in check_id),f"invalid machine check id: {check_id}")
        argv=safe_command(str(check.get("command","")).strip())
        lane_ids=check.get("laneIds")
        require(isinstance(lane_ids,list),"machine check laneIds must be an array: "+check_id)

        result=subprocess.run(
            argv,cwd=source_root,text=True,capture_output=True,check=False
        )
        log_path=logs_dir/f"{check_id}.log"
        log_text=(
            f"check={check_id}\n"
            f"sourceRevision={SOURCE_REVISION}\n"
            f"command={' '.join(argv)}\n"
            f"returnCode={result.returncode}\n"
            "--- stdout ---\n"+result.stdout+
            "\n--- stderr ---\n"+result.stderr
        )
        log_path.write_text(log_text,encoding="utf-8")
        digest=sha256(log_path)
        require(result.returncode==0,f"machine evidence check failed: {check_id}\n{result.stdout}\n{result.stderr}")

        check_records.append({
            "id":check_id,
            "command":" ".join(argv),
            "returnCode":result.returncode,
            "log":str(log_path.relative_to(output)),
            "logSha256":digest,
            "laneIds":list(lane_ids),
            "passed":True
        })
        for lane_id in lane_ids:
            lane_id=str(lane_id)
            require(lane_id not in seen_lanes,f"machine lane mapped by multiple checks: {lane_id}")
            seen_lanes.add(lane_id)
            evidence.append({
                "id":lane_id,
                "verified":True,
                "revision":SOURCE_REVISION,
                "evidenceType":"machine",
                "reference":f"evidence+sha256:{digest}:v1.7/v1.3-machine/{check_id}.log"
            })

    require(sorted(seen_lanes)==sorted(str(value) for value in expected),"machine evidence lane coverage does not match plan")
    require(git_clean(source_root),"machine validators mutated frozen tracked source")

    section48_evidence=[item for item in evidence if item["id"] in set(str(value) for value in expected_section48)]
    coverage_evidence=[item for item in evidence if item["id"] in set(str(value) for value in expected_coverage)]
    require(len(section48_evidence)==len(expected_section48),"Section 48 machine evidence partition mismatch")
    require(len(coverage_evidence)==len(expected_coverage),"coverage machine evidence partition mismatch")

    evidence_path=output/"section48-machine-evidence.json"
    evidence_path.write_text(json.dumps(section48_evidence,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    coverage_path=output/"coverage-machine-evidence.json"
    coverage_path.write_text(json.dumps(coverage_evidence,indent=2,sort_keys=True)+"\n",encoding="utf-8")

    manifest={
        "schemaVersion":1,
        "recordType":"glaze-v1.7-v1.3-machine-capture",
        "lifecycle":"DevelopmentQualification",
        "sourceRevision":SOURCE_REVISION,
        "toolingRevision":tooling_revision,
        "acceptanceModelVersion":MODEL_VERSION,
        "stableBaseline":"1.6.0",
        "observedAt":datetime.now(timezone.utc).isoformat().replace("+00:00","Z"),
        "plan":str(plan_path.relative_to(tooling_root)),
        "planSha256":sha256(plan_path),
        "networkPolicy":plan["networkPolicy"],
        "checkCount":len(check_records),
        "checks":check_records,
        "machineEvidenceLaneIds":sorted(seen_lanes),
        "section48MachineEvidenceLaneIds":sorted(str(value) for value in expected_section48),
        "coverageMachineEvidenceLaneIds":sorted(str(value) for value in expected_coverage),
        "evidenceRecord":str(evidence_path.relative_to(output)),
        "evidenceRecordSha256":sha256(evidence_path),
        "coverageEvidenceRecord":str(coverage_path.relative_to(output)),
        "coverageEvidenceRecordSha256":sha256(coverage_path),
        "passed":all(record["passed"] for record in check_records),
        "authority":dict(plan["authority"])
    }
    manifest_path=output/"manifest.json"
    manifest_path.write_text(json.dumps(manifest,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    require(manifest["passed"] is True,"machine evidence manifest did not pass")
    return manifest

def parse_args() -> argparse.Namespace:
    parser=argparse.ArgumentParser()
    parser.add_argument("--source-root",required=True)
    parser.add_argument("--tooling-root",default=".")
    parser.add_argument("--plan",default="contracts/v1.7/qualification.v1.3.machine.plan.json")
    parser.add_argument("--out",default="artifacts/v1.7-v1.3-machine")
    return parser.parse_args()

def main() -> None:
    args=parse_args()
    tooling_root=Path(args.tooling_root).resolve()
    source_root=Path(args.source_root).resolve()
    plan_path=(tooling_root/args.plan).resolve()
    output=(tooling_root/args.out).resolve()
    manifest=capture(source_root,tooling_root,plan_path,output)
    print(
        f"Glaze V1.7 v1.3 machine evidence capture: PASS "
        f"({len(manifest['machineEvidenceLaneIds'])} lanes, source {manifest['sourceRevision']})"
    )
    print("Boundary: machine evidence only; all rendered/human/AT/device/provider/privacy-security/performance/energy/provenance and lifecycle claims remain external.")

if __name__=="__main__":
    try:
        main()
    except QualificationError as error:
        print(f"Glaze V1.7 v1.3 machine evidence capture FAILED: {error}",file=sys.stderr)
        raise SystemExit(1)
