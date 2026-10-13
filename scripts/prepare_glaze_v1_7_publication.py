#!/usr/bin/env python3
"""Prepare reproducible, non-publishing Glaze 1.7.0 source/runtime evidence.

This command cannot authorize a release. The exact built bytes require separate
owner-governed acceptance, immutable publication and readback.
"""
from __future__ import annotations

import argparse
import gzip
import hashlib
import io
import json
import re
import subprocess
import tarfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
ENTRYPOINT = "js/glaze-v1.7.0.mjs"
ARCHIVE = "glaze-v1.7.0-source-runtime.tar.gz"
FIXED = (
    "LICENSE", "VERSION", "GLAZE_V1_7.md", "STABILITY.md",
    "acceptance/v1.7-stable.md", "contracts/v1.7/stable-scope.json",
    "acceptance/v1.6-stable.json", "acceptance/v1.6-final-security-acceptance.json",
)
SPECIFIER = re.compile(r"""(?m)^\s*(?:export|import)\b[^\n]*?\bfrom\s*['"]([^'"]+)['"]""")
SIDE_EFFECT = re.compile(r"""(?m)^\s*import\s*['"]([^'"]+)['"]""")


def require(test: bool, message: str) -> None:
    if not test:
        raise RuntimeError(message)


def git(*args: str) -> str:
    return subprocess.check_output(["git", *args], cwd=ROOT, text=True).strip()


def digest(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def json_bytes(data: object) -> bytes:
    return (json.dumps(data, indent=2, sort_keys=True) + "\n").encode()


def runtime_closure() -> list[str]:
    pending = [ENTRYPOINT]
    included: set[str] = set()
    while pending:
        rel = pending.pop()
        if rel in included:
            continue
        require(rel.startswith("js/") and rel.endswith(".mjs"), "unexpected runtime module: " + rel)
        text = (ROOT / rel).read_text(encoding="utf-8")
        require("import(" not in text and "require(" not in text, "unresolved dynamic load in " + rel)
        included.add(rel)
        for spec in SPECIFIER.findall(text) + SIDE_EFFECT.findall(text):
            require(spec.startswith("./"), "external or unresolved module in " + rel + ": " + spec)
            normalized = (PurePosixPath(rel).parent / spec).parts
            stack: list[str] = []
            for part in normalized:
                if part == "..":
                    require(bool(stack), "module escapes source root")
                    stack.pop()
                elif part not in ("", "."):
                    stack.append(part)
            child = "/".join(stack)
            require(child.startswith("js/glaze-v1.6") and child.endswith(".mjs"),
                    "1.7.0 release imports outside approved inherited runtime: " + child)
            pending.append(child)
    return sorted(included)


def prepare(expected_sha: str, out: Path) -> dict:
    require(re.fullmatch(r"[0-9a-f]{40}", expected_sha) is not None, "expected SHA must be exact")
    head = git("rev-parse", "HEAD")
    require(head == expected_sha, "exact candidate source HEAD mismatch")
    tree = git("rev-parse", "HEAD^{tree}")
    scope = json.loads((ROOT / "contracts/v1.7/stable-scope.json").read_text())
    lifecycle = json.loads((ROOT / "registry/lifecycle.json").read_text())
    release = [r for r in lifecycle["releases"] if r["version"] == "1.7.0"]
    require(len(release) == 1 and release[0]["lifecycle"] == "anchor", "bounded Anchor record missing")
    anchor = release[0]["sourceQualificationAnchor"]
    require(re.fullmatch(r"[0-9a-f]{40}", anchor) is not None, "source anchor missing")
    subprocess.run(["git", "merge-base", "--is-ancestor", anchor, head], cwd=ROOT, check=True)
    require(scope["stableRuntime"]["inheritedRuntime"] == "js/glaze-v1.6.0.mjs", "baseline drift")
    require(scope["stableRuntime"]["retainedDev47RuntimeIncluded"] is False, "dev47 must be excluded")
    subprocess.run(["node", "scripts/verify_glaze_v1_7_stable.mjs"], cwd=ROOT, check=True,
                   stdout=subprocess.DEVNULL)
    paths = sorted(set(FIXED) | set(runtime_closure()))
    tracked = set(git("ls-files").splitlines())
    for rel in paths:
        require(rel in tracked and (ROOT / rel).is_file(), "untracked/missing release source: " + rel)
    require(not git("diff", "--name-only", "HEAD", "--", *paths),
            "dirty release source paths cannot be packaged")
    payload = {p: (ROOT / p).read_bytes() for p in paths}
    listing = [{"path": p, "size": len(payload[p]), "sha256": digest(payload[p])} for p in paths]
    manifest = {
        "schemaVersion": 1, "product": "Glaze V1.7", "version": "1.7.0",
        "sourceRevision": head, "sourceTree": tree, "sourceQualificationAnchor": anchor,
        "runtimeEntrypoint": ENTRYPOINT, "inheritedRuntime": "js/glaze-v1.6.0.mjs",
        "publicationAuthorized": False, "productionAcceptanceAutomatic": False,
        "candidateFiles": listing,
    }
    payload["SOURCE_MANIFEST.json"] = json_bytes(manifest)
    out.mkdir(parents=True, exist_ok=True)
    archive = out / ARCHIVE
    buffer = io.BytesIO()
    with tarfile.open(fileobj=buffer, mode="w", format=tarfile.USTAR_FORMAT) as tar:
        for name, data in sorted(payload.items()):
            tarinfo = tarfile.TarInfo("glaze-v1.7.0/" + name)
            tarinfo.size, tarinfo.mtime, tarinfo.mode = len(data), 0, 0o644
            tarinfo.uid = tarinfo.gid = 0
            tar.addfile(tarinfo, io.BytesIO(data))
    with archive.open("wb") as dest:
        with gzip.GzipFile(fileobj=dest, mode="wb", filename="", mtime=0, compresslevel=9) as zipped:
            zipped.write(buffer.getvalue())
    sbom = {
        "bomFormat": "CycloneDX", "specVersion": "1.5", "version": 1,
        "metadata": {"component": {"type": "library", "name": "Glaze", "version": "1.7.0"}},
        "components": [{"type": "file", "name": p,
                        "hashes": [{"alg": "SHA-256", "content": digest(data)}]}
                       for p, data in sorted(payload.items())],
    }
    provenance = {
        "schemaVersion": 1, "kind": "glaze-v1.7.0-publication-preparation",
        "sourceRevision": head, "sourceTree": tree, "sourceQualificationAnchor": anchor,
        "archive": ARCHIVE, "archiveSha256": digest(archive.read_bytes()),
        "publicationAuthorized": False, "anchorQualificationEffect": "none",
        "humanReleaseAcceptance": "pending", "immutablePublicationReadback": "pending",
    }
    outputs = {
        ARCHIVE: archive.read_bytes(),
        "cyclonedx-1.5.json": json_bytes(sbom),
        "provenance.json": json_bytes(provenance),
    }
    for name, data in outputs.items():
        if name != ARCHIVE:
            (out / name).write_bytes(data)
    (out / "SHA256SUMS").write_text(
        "".join(digest(data) + "  " + name + "\n" for name, data in sorted(outputs.items())),
        encoding="utf-8")
    return {"source": head, "sourceTree": tree, "archiveSha256": provenance["archiveSha256"],
            "moduleCount": len(runtime_closure()), "releaseAuthorized": False}


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--expected-sha", required=True)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()
    print(json.dumps(prepare(args.expected_sha, args.output_dir), sort_keys=True))
