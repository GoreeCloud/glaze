#!/usr/bin/env python3
"""Prepare an exact-source Glaze V1.7.1 physical-device review package.

This helper materializes frozen retained V1.7 source contracts plus the current
physical-device qualification protocol. It does not execute a device session,
verify a downstream integration, or create qualification evidence.
"""
from __future__ import annotations

import argparse
import io
import json
from datetime import datetime, timezone
from pathlib import Path
import shutil
import subprocess
import tarfile

SOURCE_REVISION = "4b9d085a5177b96cc31d4270b38d792a59872e37"
SOURCE_MODEL = "1.7.0-dev.47"
ACCEPTANCE_MODEL = "1.7.0-dev.39"
STABLE_BASELINE = "1.7.0"
HISTORICAL_SOURCE_STABLE_BASELINE = "1.6.0"
SENTINEL = ".glaze-v1.7.1-device-review-package"

FROZEN_PATHS = (
    "js",
    "contracts/v1.7/form-factor-profiles.dev.json",
    "contracts/v1.7/adaptive-input.dev.json",
    "contracts/v1.7/native-glaze-kits-v1-2.dev.json",
    "contracts/v1.7/cross-device-consistency.dev.json",
    "contracts/v1.7/performance-energy-awareness.dev.json",
)

CURRENT_PROTOCOL_FILES = (
    Path("contracts/v1.7/qualification.v1.2.device.plan.json"),
    Path("schemas/v1.7.1-device-qualification-plan.schema.json"),
    Path("acceptance/v1.7.1-device-evidence.template.json"),
    Path("acceptance/v1.7.1-device-qualification.md"),
)


class PreparationError(RuntimeError):
    pass


def run_git(root: Path, *args: str, binary: bool = False):
    result = subprocess.run(
        ["git", *args],
        cwd=root,
        capture_output=True,
        text=not binary,
        check=False,
    )
    if result.returncode != 0:
        stderr = result.stderr.decode() if binary else result.stderr
        raise PreparationError("git " + " ".join(args) + " failed: " + stderr.strip())
    return result.stdout


def safe_extract_tar(data: bytes, destination: Path) -> None:
    with tarfile.open(fileobj=io.BytesIO(data), mode="r:") as archive:
        root = destination.resolve()
        for member in archive.getmembers():
            target = (destination / member.name).resolve()
            if root != target and root not in target.parents:
                raise PreparationError("archive contains path outside destination: " + member.name)
        archive.extractall(destination)


def prepare(repo_root: Path, output: Path, replace: bool) -> dict:
    repo_root = repo_root.resolve()
    output = output.resolve()

    for rel in CURRENT_PROTOCOL_FILES:
        if not (repo_root / rel).is_file():
            raise PreparationError("missing current protocol file: " + str(rel))

    run_git(repo_root, "cat-file", "-e", SOURCE_REVISION + "^{commit}")
    tooling_revision = run_git(repo_root, "rev-parse", "HEAD").strip()

    if output.exists():
        sentinel = output / SENTINEL
        if not replace:
            raise PreparationError("output already exists; choose another path or pass --replace")
        if not sentinel.is_file():
            raise PreparationError("refusing to replace a directory without the device-review sentinel")
        shutil.rmtree(output)

    output.mkdir(parents=True)
    (output / SENTINEL).write_text(
        "Glaze V1.7.1 physical-device review package\n",
        encoding="utf-8",
    )

    archive = run_git(
        repo_root,
        "archive",
        "--format=tar",
        SOURCE_REVISION,
        *FROZEN_PATHS,
        binary=True,
    )
    safe_extract_tar(archive, output)

    for rel in CURRENT_PROTOCOL_FILES:
        target = output / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(repo_root / rel, target)

    manifest = {
        "schemaVersion": 1,
        "recordType": "glaze-v1.7.1-device-review-package",
        "successorReleaseLine": "1.7.1",
        "developmentIdentity": "1.7.1-dev.1",
        "sourceRevision": SOURCE_REVISION,
        "sourceModelVersion": SOURCE_MODEL,
        "acceptanceModelVersion": ACCEPTANCE_MODEL,
        "toolingRevision": tooling_revision,
        "stableBaseline": STABLE_BASELINE,
        "historicalSourceStableBaseline": HISTORICAL_SOURCE_STABLE_BASELINE,
        "preparedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "repositoryLocalOnly": True,
        "targetDeviceEvidenceLaneIds": [
            "mobile","tablet","desktop","foldable","tv","wearable",
            "touch","native-behavior","energy-behavior",
        ],
        "manualDeviceSessionPerformed": False,
        "deviceEvidenceClaimed": False,
        "humanEvidenceClaimed": False,
        "assistiveTechnologyEvidenceClaimed": False,
        "performanceEvidenceClaimed": False,
        "energyEvidenceClaimed": False,
        "section48Accepted": False,
        "v171AcceptanceClaimed": False,
        "lifecyclePromotionAutomatic": False,
    }
    (output / "qualification-source.json").write_text(
        json.dumps(manifest, indent=2, sort_keys=True) + "\n",
        encoding="utf-8",
    )
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--repo-root", default=".")
    parser.add_argument("--out", default="_v171-device-review")
    parser.add_argument("--replace", action="store_true")
    args = parser.parse_args()

    manifest = prepare(Path(args.repo_root), Path(args.out), args.replace)
    print("Glaze V1.7.1 physical-device review package prepared")
    print("Frozen source: " + manifest["sourceRevision"])
    print("Tooling revision: " + manifest["toolingRevision"])
    print("Protocol: " + str(CURRENT_PROTOCOL_FILES[3]))
    print("Template: " + str(CURRENT_PROTOCOL_FILES[2]))
    print("Boundary: preparation only; no device, human, performance, energy, lifecycle, or production acceptance is claimed.")


if __name__ == "__main__":
    try:
        main()
    except PreparationError as error:
        raise SystemExit("Glaze V1.7.1 physical-device review preparation FAILED: " + str(error))
