#!/usr/bin/env python3
"""Validate current Glaze UI wearable authority and retained evidence boundaries."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = ROOT / "VERSION"
LIFECYCLE = ROOT / "registry/lifecycle.json"
WEARABLES = ROOT / "WEARABLES.md"
COMPONENTS = ROOT / "WEARABLE_COMPONENTS.md"
EVIDENCE = ROOT / "acceptance/wearable-native-evidence.template.json"
WEAR_OS_REFERENCE = ROOT / "reference/native/wear-os/buildable"
WATCH_OS_REFERENCE = ROOT / "reference/native/watchos"
WEAR_OS_BUILD_WORKFLOW = ROOT / ".github/workflows/glaze-wear-build-toolchain-validation.yml"
WEAR_OS_RUNTIME_WORKFLOW = ROOT / ".github/workflows/wear-os-emulator.yml"


def fail(message: str) -> None:
    raise SystemExit(f"wearable authority validation failed: {message}")


def require(condition: bool, message: str) -> None:
    if not condition:
        fail(message)


def read(path: Path) -> str:
    require(path.is_file(), f"missing {path.relative_to(ROOT)}")
    return path.read_text(encoding="utf-8")


def main() -> None:
    version = read(VERSION).strip()
    lifecycle = json.loads(read(LIFECYCLE))
    wearable_doc = read(WEARABLES)
    component_doc = read(COMPONENTS)
    evidence = json.loads(read(EVIDENCE))
    build_workflow = read(WEAR_OS_BUILD_WORKFLOW)
    runtime_workflow = read(WEAR_OS_RUNTIME_WORKFLOW)

    require(version == "1.7.0", "VERSION must identify bounded Glaze V1.7 Stable/Anchor 1.7.0")
    require(lifecycle.get("currentOfficial") == version, "currentOfficial must match VERSION")
    require(lifecycle.get("currentStable") == version, "currentStable compatibility field must match VERSION")
    current_release = next(
        (item for item in lifecycle.get("releases", []) if item.get("version") == version),
        None,
    )
    require(current_release is not None, "current Glaze V1.7 release record missing")
    require(lifecycle.get("officialProductLabel") == current_release.get("label"), "official product label must match current release label")

    require(current_release.get("consumerEligible") is True, "current Glaze V1.7 release must remain consumer eligible")
    require(current_release.get("lifecycle") == "anchor", "current Glaze V1.7 canonical lifecycle must remain Anchor")
    require(current_release.get("runtimeEntrypoint") == "js/glaze-v1.7.0.mjs", "current Glaze V1.7 runtime binding drifted")

    capabilities = lifecycle.get("capabilities", {})
    require("wearable" not in capabilities, "wearable must not silently become a first-class capability")

    for phrase in (
        "Glaze V1.7 / `1.7.0` Stable/Anchor",
        "no first-class wearable capability is currently promoted",
        "does not establish V1.7.1 acceptance",
    ):
        require(phrase in wearable_doc, f"WEARABLES.md missing current boundary: {phrase}")

    for phrase in (
        "Glaze V1.7 / `1.7.0` Stable/Anchor",
        "Development/reference mapping only",
        "application-specific acceptance",
    ):
        require(phrase in component_doc, f"WEARABLE_COMPONENTS.md missing current boundary: {phrase}")

    require(evidence.get("status") == "template-only", "wearable native evidence must remain template-only")
    require(evidence.get("glazeUiStableBaseline") == "1.7.0", "wearable evidence baseline must be current bounded V1.7")
    promotion = evidence.get("promotion", {})
    require(promotion.get("stableEligible") is False, "wearable evidence template must remain promotion-ineligible")
    require(promotion.get("reviewedBy") is None, "template must not contain a reviewer")
    require(promotion.get("reviewDate") is None, "template must not contain a review date")
    require(promotion.get("releaseCandidateCommit") is None, "template must not bind an accepted release candidate")

    require(WEAR_OS_REFERENCE.is_dir(), "Wear OS reference source missing")
    require(WATCH_OS_REFERENCE.is_dir(), "watchOS reference source missing")

    require("Build Wear OS reference APK" in build_workflow, "Wear OS build workflow missing compile check")
    require("workflow_dispatch" in runtime_workflow, "Wear OS runtime workflow must remain manual")
    require("Deferred Manual Validation" in runtime_workflow, "Wear OS runtime workflow must remain explicitly deferred")
    require("not a Glaze UI" in runtime_workflow, "Wear OS runtime workflow missing non-promotion boundary")
    require("V1.7.0 Anchor expansion" in runtime_workflow, "Wear OS runtime workflow missing current Anchor boundary")

    print(
        "Glaze wearable authority validated: V1.7/1.7.0 Stable/Anchor remains current; "
        "wearable source is deferred to V1.7.1 and native/product acceptance remains separate"
    )


if __name__ == "__main__":
    main()
