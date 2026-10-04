#!/usr/bin/env python3
from __future__ import annotations

import argparse
import io
import json
import subprocess
import tarfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SOURCE = "4b9d085a5177b96cc31d4270b38d792a59872e37"
SOURCE_MODEL = "1.7.0-dev.47"
SECTION48_MODEL = "1.7.0-dev.47"
STABLE = "1.7.0"
HISTORICAL_STABLE = "1.6.0"
PLAN = Path("contracts/v1.7/qualification.v1.3.trust.plan.json")
PROCEDURE = Path("acceptance/v1.7.1-section48-trust-qualification.md")
PROVIDER_TEMPLATE = Path("acceptance/v1.7.1-section48-provider-integration-evidence.template.json")
PRIVACY_TEMPLATE = Path("acceptance/v1.7.1-section48-privacy-security-evidence.template.json")
SENTINEL = ".glaze-v1.7.1-section48-trust-review-root"

def run_git(*args: str, binary: bool = False):
    result = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, check=False)
    if result.returncode != 0:
        raise RuntimeError(result.stderr.decode("utf-8", "replace").strip())
    return result.stdout if binary else result.stdout.decode().strip()

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--out", type=Path, required=True)
    args = parser.parse_args()

    output = args.out.expanduser().resolve()
    if output.exists() and any(output.iterdir()):
        raise SystemExit("output directory must be absent or empty")
    output.mkdir(parents=True, exist_ok=True)

    run_git("cat-file", "-e", SOURCE + "^{commit}")
    head = run_git("rev-parse", "HEAD")

    archive = run_git(
        "archive", "--format=tar", SOURCE,
        "js", "contracts/v1.7", "docs/v1.7", "VERSION", "registry/lifecycle.json",
        binary=True,
    )
    with tarfile.open(fileobj=io.BytesIO(archive), mode="r:") as tf:
        tf.extractall(output)

    for rel in [PLAN, PROCEDURE, PROVIDER_TEMPLATE, PRIVACY_TEMPLATE]:
        target = output / rel
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes((ROOT / rel).read_bytes())

    manifest = {
        "schemaVersion": 1,
        "recordType": "glaze-v1.7.1-section48-trust-review-source",
        "sourceRevision": SOURCE,
        "sourceModelVersion": SOURCE_MODEL,
        "section48QualificationModelVersion": SECTION48_MODEL,
        "stableBaseline": STABLE,
        "historicalSourceStableBaseline": HISTORICAL_STABLE,
        "toolingRevision": head,
        "preparedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "repositoryLocalOnly": True,
        "targetEvidenceTypes": ["provider-integration", "privacy-security"],
        "manualIntegrationSessionPerformed": False,
        "providerIntegrationEvidenceClaimed": False,
        "privacySecurityEvidenceClaimed": False,
        "credentialsOrReusableSecretsIncluded": False,
        "unnecessaryPrivatePayloadIncluded": False,
        "section48Accepted": False,
        "v171AcceptanceClaimed": False,
        "lifecyclePromotionAutomatic": False,
    }
    (output / "qualification-source.json").write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")
    (output / SENTINEL).write_text("Glaze V1.7.1 Section 48 trust qualification review root\n", encoding="utf-8")

    print("Glaze V1.7.1 Section 48 trust review package prepared")
    print("Frozen source: " + SOURCE)
    print("Tooling revision: " + head)
    print("Evidence types: provider-integration, privacy-security")
    print("Boundary: preparation only; no trust evidence, Section 48 acceptance, or lifecycle authority is claimed.")

if __name__ == "__main__":
    main()
