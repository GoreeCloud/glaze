#!/usr/bin/env python3
"""Build deterministic, non-publishing Glaze V1.7 dev.47 provenance evidence."""
from __future__ import annotations

import argparse
import gzip
import hashlib
import json
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Any

SOURCE_REVISION="4b9d085a5177b96cc31d4270b38d792a59872e37"
MODEL_VERSION="1.7.0-dev.47"
ARCHIVE_NAME="glaze-v1.7.0-dev.47-source-qualification.tar.gz"

class QualificationError(RuntimeError):
    pass

def require(condition: bool, message: str) -> None:
    if not condition:
        raise QualificationError(message)

def load_json(path: Path) -> dict[str,Any]:
    require(path.is_file(),f"missing JSON file: {path}")
    value=json.loads(path.read_text(encoding="utf-8"))
    require(isinstance(value,dict),f"JSON root must be object: {path}")
    return value

def git(root: Path,*args: str,binary: bool=False):
    result=subprocess.run(
        ["git",*args],cwd=root,capture_output=True,text=not binary,check=False
    )
    if result.returncode!=0:
        stderr=result.stderr.decode(errors="replace") if binary else result.stderr
        raise QualificationError("git "+" ".join(args)+" failed: "+stderr.strip())
    return result.stdout

def sha256(path: Path) -> str:
    digest=hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda:handle.read(1024*1024),b""):
            digest.update(chunk)
    return digest.hexdigest()

def build_archive(source_root: Path,output: Path,paths: list[str]) -> Path:
    output.mkdir(parents=True,exist_ok=True)
    archive=output/ARCHIVE_NAME
    with tempfile.TemporaryDirectory(prefix="glaze-v17-provenance-") as tmp:
        tar_path=Path(tmp)/"source.tar"
        with tar_path.open("wb") as handle:
            result=subprocess.run(
                ["git","archive","--format=tar","--prefix=glaze-v1.7.0-dev.47/","HEAD","--",*paths],
                cwd=source_root,stdout=handle,stderr=subprocess.PIPE,check=False
            )
        require(result.returncode==0,"git archive failed: "+result.stderr.decode(errors="replace"))
        with tar_path.open("rb") as source,archive.open("wb") as target:
            with gzip.GzipFile(filename="",mode="wb",fileobj=target,compresslevel=9,mtime=0) as zipped:
                shutil.copyfileobj(source,zipped)
    require(archive.is_file() and archive.stat().st_size>0,"provenance archive missing")
    return archive

def capture(source_root: Path,tooling_root: Path,plan_path: Path,output: Path) -> dict[str,Any]:
    plan=load_json(plan_path)
    require(plan.get("sourceRevision")==SOURCE_REVISION,"provenance plan source revision drifted")
    require(plan.get("acceptanceModelVersion")==MODEL_VERSION,"provenance model version drifted")
    require(plan.get("archiveName")==ARCHIVE_NAME,"provenance archive identity drifted")
    require(plan.get("networkPolicy")=="repository-local-only","provenance network policy drifted")
    require(plan.get("deterministicDoubleBuildRequired") is True,"deterministic double build must be required")
    require(plan.get("publishesTag") is False and plan.get("publishesGithubRelease") is False,"provenance tooling must not publish")
    paths=plan.get("includedPaths")
    require(isinstance(paths,list) and paths,"provenance included paths missing")

    source_revision=git(source_root,"rev-parse","HEAD").strip()
    source_tree=git(source_root,"rev-parse","HEAD^{tree}").strip()
    require(source_revision==SOURCE_REVISION,f"frozen source mismatch: {source_revision}")
    require(git(source_root,"status","--porcelain","--untracked-files=no").strip()=="","frozen source has tracked modifications")

    archive=build_archive(source_root,output,[str(value) for value in paths])
    archive_digest=sha256(archive)

    provenance={
        "schemaVersion":1,
        "recordType":"glaze-v1.7-v1.3-artifact-provenance",
        "lifecycle":"DevelopmentQualification",
        "sourceRevision":source_revision,
        "sourceTree":source_tree,
        "acceptanceModelVersion":MODEL_VERSION,
        "stableBaseline":"1.6.0",
        "archive":{
            "name":archive.name,
            "size":archive.stat().st_size,
            "sha256":archive_digest,
            "format":"tar+gzip",
            "deterministic":True,
            "prefix":"glaze-v1.7.0-dev.47/"
        },
        "includedPaths":[str(value) for value in paths],
        "publication":{
            "tagCreated":False,
            "githubReleaseCreated":False,
            "artifactPublished":False,
            "publicationAuthorized":False,
            "anchorPromotionAuthorized":False
        },
        "authority":{
            "provenanceEvidenceOnly":True,
            "section48AcceptanceClaimed":False,
            "v17AcceptanceClaimed":False,
            "anchorStatusGranted":False,
            "lifecyclePromotionAutomatic":False
        }
    }
    provenance_path=output/"provenance.json"
    provenance_path.write_text(json.dumps(provenance,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    provenance_digest=sha256(provenance_path)

    reference=f"evidence+sha256:{provenance_digest}:v1.7/v1.3-provenance/provenance.json"
    v12=[{
        "id":"artifact-provenance",
        "verified":True,
        "revision":SOURCE_REVISION,
        "evidenceType":"provenance",
        "reference":reference
    }]
    section48=[{
        "id":"artifact-provenance-v13",
        "verified":True,
        "revision":SOURCE_REVISION,
        "evidenceType":"provenance",
        "reference":reference
    }]
    v12_path=output/"v12-provenance-evidence.json"
    section48_path=output/"section48-provenance-evidence.json"
    v12_path.write_text(json.dumps(v12,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    section48_path.write_text(json.dumps(section48,indent=2,sort_keys=True)+"\n",encoding="utf-8")

    sums={
        archive.name:archive_digest,
        provenance_path.name:provenance_digest,
        v12_path.name:sha256(v12_path),
        section48_path.name:sha256(section48_path)
    }
    sums_path=output/"SHA256SUMS"
    sums_path.write_text("".join(f"{digest}  {name}\n" for name,digest in sorted(sums.items())),encoding="utf-8")

    summary={
        "sourceRevision":SOURCE_REVISION,
        "sourceTree":source_tree,
        "acceptanceModelVersion":MODEL_VERSION,
        "archive":archive.name,
        "archiveSha256":archive_digest,
        "provenanceSha256":provenance_digest,
        "v12EvidenceRecord":v12_path.name,
        "section48EvidenceRecord":section48_path.name,
        "provenanceEvidenceEstablished":True,
        "publicationAuthorized":False,
        "anchorStatusGranted":False
    }
    (output/"summary.json").write_text(json.dumps(summary,indent=2,sort_keys=True)+"\n",encoding="utf-8")
    require(git(source_root,"status","--porcelain","--untracked-files=no").strip()=="","provenance capture mutated frozen source")
    return summary

def main() -> None:
    parser=argparse.ArgumentParser()
    parser.add_argument("--source-root",required=True)
    parser.add_argument("--tooling-root",default=".")
    parser.add_argument("--plan",default="contracts/v1.7/qualification.v1.3.provenance.plan.json")
    parser.add_argument("--out",default="artifacts/v1.7-v1.3-provenance")
    args=parser.parse_args()
    source_root=Path(args.source_root).resolve()
    tooling_root=Path(args.tooling_root).resolve()
    plan_path=(tooling_root/args.plan).resolve()
    output=(tooling_root/args.out).resolve()
    summary=capture(source_root,tooling_root,plan_path,output)
    print("Glaze V1.7 v1.3 provenance capture: PASS")
    print(json.dumps(summary,indent=2,sort_keys=True))
    print("Boundary: provenance evidence only; publication, V1.7 acceptance, and Anchor promotion remain external.")

if __name__=="__main__":
    try:
        main()
    except QualificationError as error:
        print(f"Glaze V1.7 provenance capture FAILED: {error}")
        raise SystemExit(1)
