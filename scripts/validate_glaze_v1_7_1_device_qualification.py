#!/usr/bin/env python3
"""Validate the Glaze V1.7.1 physical-device qualification control and records.

The validator is intentionally fail-closed. Synthetic self-tests validate only
the protocol; they are never physical-device evidence.
"""
from __future__ import annotations

import argparse
import copy
from datetime import datetime
import json
import math
from pathlib import Path
import re
import subprocess
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
PLAN_PATH = ROOT / "contracts/v1.7/qualification.v1.2.device.plan.json"
SCHEMA_PATH = ROOT / "schemas/v1.7.1-device-qualification-plan.schema.json"
TEMPLATE_PATH = ROOT / "acceptance/v1.7.1-device-evidence.template.json"
PROCEDURE_PATH = ROOT / "acceptance/v1.7.1-device-qualification.md"
PREPARER_PATH = ROOT / "scripts/prepare_glaze_v1_7_1_device_qualification.py"

SOURCE = "4b9d085a5177b96cc31d4270b38d792a59872e37"
SOURCE_MODEL = "1.7.0-dev.47"
ACCEPTANCE_MODEL = "1.7.0-dev.39"
STABLE = "1.7.0"
HISTORICAL = "1.6.0"
HEX40 = re.compile(r"^[0-9a-f]{40}$")
PLACEHOLDER = re.compile(r"(?:REPLACE_WITH|\bTBD\b|\bTODO\b|\bPLACEHOLDER\b)", re.I)

LANES = [
    "mobile","tablet","desktop","foldable","tv","wearable",
    "touch","native-behavior","energy-behavior",
]
FORM_FACTORS = ["mobile","tablet","desktop","foldable","tv","wearable"]
PLATFORMS = ["android","apple","linux","other"]
IMPLEMENTATIONS = ["web","android-compose","apple-swiftui","linux-native","other-native"]
NATIVE_IMPLEMENTATIONS = {"android-compose","apple-swiftui","linux-native","other-native"}
INPUTS = {
    "touch","pointer","keyboard","stylus","remote-dpad","rotary",
    "switch-access","voice-access","assistive-input",
}
COMMON_SCENARIOS = [
    "source-and-build-identity",
    "physical-device-and-form-factor",
    "platform-insets-and-safe-areas",
    "task-and-state-continuity",
    "accessibility-preference-precedence",
    "semantic-authority-preservation",
]
LANE_SCENARIOS = {
    "mobile":"mobile-navigation-and-reachability",
    "tablet":"tablet-dual-pane-and-mixed-input",
    "desktop":"desktop-windowing-and-mixed-input",
    "foldable":"foldable-posture-and-unsafe-regions",
    "tv":"tv-far-view-and-directional-focus",
    "wearable":"wearable-glanceability-and-rotary-or-touch",
    "touch":"real-touch-and-semantic-alternatives",
    "native-behavior":"native-toolkit-and-platform-conventions",
    "energy-behavior":"background-offscreen-device-lifecycle",
}


class QualificationError(RuntimeError):
    pass


def req(value: Any, message: str) -> None:
    if not value:
        raise QualificationError(message)


def read_json(path: Path) -> dict[str, Any]:
    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:
        raise QualificationError(f"cannot read JSON {path}: {exc}") from exc
    req(isinstance(data, dict), f"{path} must contain a JSON object")
    return data


def git(*args: str) -> str:
    result = subprocess.run(
        ["git", *args], cwd=ROOT, capture_output=True, text=True, check=False
    )
    if result.returncode != 0:
        raise QualificationError("git " + " ".join(args) + " failed: " + result.stderr.strip())
    return result.stdout.strip()


def meaningful(value: Any, label: str, min_len: int = 2) -> str:
    req(isinstance(value, str), f"{label} must be a string")
    text = value.strip()
    req(len(text) >= min_len, f"{label} must be meaningful")
    req(not PLACEHOLDER.search(text), f"{label} contains a placeholder")
    return text


def finite(value: Any, label: str, minimum: float | None = None, maximum: float | None = None) -> float:
    req(isinstance(value, (int, float)) and not isinstance(value, bool), f"{label} must be numeric")
    number = float(value)
    req(math.isfinite(number), f"{label} must be finite")
    if minimum is not None:
        req(number >= minimum, f"{label} below minimum {minimum}")
    if maximum is not None:
        req(number <= maximum, f"{label} above maximum {maximum}")
    return number


def timestamp(value: Any, label: str) -> str:
    text = meaningful(value, label, 10)
    normalized = text[:-1] + "+00:00" if text.endswith("Z") else text
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError as exc:
        raise QualificationError(f"{label} must be ISO-8601") from exc
    req(parsed.tzinfo is not None, f"{label} must include timezone")
    return text


def array_of_strings(value: Any, label: str, allowed: set[str] | None = None) -> list[str]:
    req(isinstance(value, list), f"{label} must be an array")
    result: list[str] = []
    for i, item in enumerate(value):
        text = meaningful(item, f"{label}[{i}]")
        if allowed is not None:
            req(text in allowed, f"{label}[{i}] unsupported: {text}")
        result.append(text)
    req(len(result) == len(set(result)), f"{label} contains duplicates")
    return result


def validate_source() -> dict[str, Any]:
    plan = read_json(PLAN_PATH)
    schema = read_json(SCHEMA_PATH)
    template = read_json(TEMPLATE_PATH)
    acceptance = read_json(ROOT / "contracts/v1.7/acceptance.dev.json")
    lifecycle = read_json(ROOT / "registry/lifecycle.json")
    form_factors = read_json(ROOT / "contracts/v1.7/form-factor-profiles.dev.json")
    adaptive_input = read_json(ROOT / "contracts/v1.7/adaptive-input.dev.json")
    native = read_json(ROOT / "contracts/v1.7/native-glaze-kits-v1-2.dev.json")
    cross_device = read_json(ROOT / "contracts/v1.7/cross-device-consistency.dev.json")
    performance_energy = read_json(ROOT / "contracts/v1.7/performance-energy-awareness.dev.json")

    req((ROOT / "VERSION").read_text().strip() == STABLE, "bounded V1.7 Stable version changed")
    req(
        lifecycle.get("currentOfficial") == STABLE
        and lifecycle.get("currentStable") == STABLE
        and lifecycle.get("currentLifecycle") == "anchor",
        "bounded V1.7 Stable/Anchor authority changed",
    )
    req(lifecycle.get("plannedNext") == "1.7.1", "V1.7.1 successor line changed")
    req(lifecycle.get("activeCandidate") is None and lifecycle.get("activePatchReleaseCandidate") is None, "device tooling must not create a lifecycle candidate")

    req(schema.get("$schema") == "https://json-schema.org/draft/2020-12/schema", "device plan schema dialect mismatch")
    req(plan.get("schemaVersion") == 1, "device plan schemaVersion drifted")
    req(plan.get("planId") == "goreecloud.glaze.v1.7.1.physical-device-qualification", "device plan identity drifted")
    req(plan.get("lifecycle") == "DevelopmentQualification", "device plan lifecycle drifted")
    req(plan.get("successorReleaseLine") == "1.7.1" and plan.get("developmentIdentity") == "1.7.1-dev.1", "device plan successor identity drifted")
    req(plan.get("sourceRevision") == SOURCE and plan.get("sourceModelVersion") == SOURCE_MODEL, "device plan frozen source binding drifted")
    req(plan.get("acceptanceModelVersion") == ACCEPTANCE_MODEL, "device plan acceptance model drifted")
    req(plan.get("stableBaseline") == STABLE and plan.get("historicalSourceStableBaseline") == HISTORICAL, "device plan Stable baseline drifted")
    req(plan.get("consumerEligible") is False and plan.get("evidenceType") == "device", "device plan authority boundary drifted")

    groups = plan.get("eligibleEvidenceGroups")
    req(isinstance(groups, list) and len(groups) == len(LANES), "eligible device lane set incomplete")
    by_lane = {entry.get("laneId"): entry for entry in groups if isinstance(entry, dict)}
    req(list(by_lane) == LANES, "eligible device lane ordering/set drifted")
    requirements = acceptance.get("evidenceRequirements", {})
    expected_other = {
        "mobile":(["rendered"], True),
        "tablet":(["rendered"], True),
        "desktop":(["rendered"], True),
        "foldable":(["rendered"], True),
        "tv":(["rendered"], True),
        "wearable":(["rendered"], True),
        "touch":(["human"], False),
        "native-behavior":(["human"], False),
        "energy-behavior":(["energy"], False),
    }
    for lane in LANES:
        lane_req = requirements.get(lane)
        req(isinstance(lane_req, list) and ["device"] in lane_req, f"{lane} no longer contains a device evidence group")
        other = [group[0] for group in lane_req if group != ["device"]]
        expected, retained = expected_other[lane]
        req(other == expected, f"{lane} other evidence groups drifted: {other}")
        req(by_lane[lane].get("otherRequiredGroups") == expected, f"{lane} plan other-group mapping drifted")
        req(by_lane[lane].get("retainedOtherGroupsAlreadyPresent") is retained, f"{lane} retained prerequisite disposition drifted")
    req(by_lane["wearable"].get("conditional") is True and by_lane["energy-behavior"].get("conditional") is True, "conditional device lanes drifted")
    for lane in set(LANES) - {"wearable","energy-behavior"}:
        req(by_lane[lane].get("conditional") is False, f"{lane} must remain required")

    record = plan.get("record", {})
    req(record.get("sourceRevisionRequired") == SOURCE and record.get("repository") == "GoreeCloud/glaze", "device record source/repository binding drifted")
    req(record.get("eligibleLaneIds") == LANES, "device record lane set drifted")
    req(record.get("formFactors") == FORM_FACTORS, "device form-factor set drifted")
    req(record.get("platformFamilies") == PLATFORMS, "device platform-family set drifted")
    req(record.get("implementationKinds") == IMPLEMENTATIONS, "device implementation-kind set drifted")
    req(set(record.get("nativeImplementationKinds", [])) == NATIVE_IMPLEMENTATIONS, "native implementation-kind set drifted")
    req(set(record.get("inputCapabilities", [])) == INPUTS, "device input-capability set drifted")
    req(record.get("requiredCommonScenarioIds") == COMMON_SCENARIOS, "common device scenarios drifted")
    req(record.get("laneSpecificScenarioIds") == LANE_SCENARIOS, "lane-specific device scenarios drifted")

    req(form_factors.get("profiles") == FORM_FACTORS, "V1.7 form-factor profile contract drifted")
    req(form_factors.get("adaptation", {}).get("widthAloneIsProfileAuthority") is False, "width-only profile authority was enabled")
    req(form_factors.get("adaptation", {}).get("safeAreasOwnedByPlatform") is True, "safe-area ownership drifted")
    req(form_factors.get("wearableBoundary", {}).get("nativeDeviceAcceptanceImplied") is False, "wearable native acceptance was implied")
    req("touch" in adaptive_input.get("inputModels", []), "Adaptive Input lost Touch")
    req(adaptive_input.get("semanticActions", {}).get("physicalKeyOrGestureIsSemanticAuthority") is False, "physical binding became semantic authority")
    req(set(native.get("platforms", [])) == {"android-compose","apple-swiftui","web","linux-native"}, "Native Glaze Kits platform set drifted")
    req(native.get("crossPlatformPolicy", {}).get("identicalAnimationImplementationRequired") is False, "native uniformity requirement drifted")
    req(native.get("acceptanceBoundary", {}).get("nativePlatformAcceptanceEstablished") is False, "native source contract overclaims acceptance")
    req(cross_device.get("uniformityNotRequired", {}).get("pixelIdenticalPresentation") is True, "cross-device uniformity boundary drifted")
    req(performance_energy.get("acceptanceBoundary", {}).get("section45Complete") is False, "Section 45 must remain incomplete")

    rules = plan.get("acceptanceRules", {})
    for key in (
        "browserCiIsPhysicalDeviceEvidence","emulatorOrSimulatorIsDeviceEvidence",
        "singleDeviceImpliesPlatformQualification","singleDeviceImpliesFormFactorMatrixAcceptance",
        "singleNativeToolkitImpliesCrossPlatformNativeParity","webImplementationMayClaimNativeBehavior",
        "deviceRecordMayClaimHumanEvidence","deviceRecordMayClaimPerformanceEvidence",
        "deviceRecordMayClaimEnergyEvidence","deviceRecordPassImpliesLaneClosed",
        "protocolValidationImpliesDeviceEvidence","protocolValidationImpliesSection48Acceptance",
        "protocolValidationImpliesV171Acceptance","protocolValidationImpliesLifecyclePromotion",
        "protocolValidationImpliesConsumerAcceptance","protocolValidationImpliesDeploymentAcceptance",
        "protocolValidationImpliesProductionAcceptance",
    ):
        req(rules.get(key) is False, f"device overclaim guard drifted: {key}")
    req(rules.get("operatorIdentityRequired") is True and rules.get("integrationBuildIdentityRequired") is True, "device identity requirements drifted")
    req(rules.get("manualExecutionRequired") is True and rules.get("realPhysicalDeviceRequired") is True, "real-device execution requirements drifted")

    boundary = plan.get("currentBoundary", {})
    for key in (
        "physicalDeviceEvidenceEstablished","humanEvidenceEstablished","performanceEvidenceEstablished",
        "energyEvidenceEstablished","section48Accepted","v171AcceptanceEstablished",
        "lifecyclePromotionEstablished","consumerAcceptanceEstablished",
        "deploymentAcceptanceEstablished","productionAcceptanceEstablished",
    ):
        req(boundary.get(key) is False, f"device current boundary must remain false: {key}")

    req(template.get("recordType") == "glaze-v1.7.1-physical-device-session-candidate", "device template recordType drifted")
    req(template.get("sourceRevision") == SOURCE and template.get("repository") == "GoreeCloud/glaze", "device template source binding drifted")
    req(template.get("manualExecution") is False and template.get("device", {}).get("physicalDevice") is False, "device template must fail closed")
    auth = template.get("authority", {})
    req(auth.get("candidateEvidenceOnly") is True, "device template candidate boundary missing")
    for key in (
        "durableEvidenceRecorded","deviceEvidenceAccepted","laneClosed","humanEvidenceClaimed",
        "assistiveTechnologyEvidenceClaimed","performanceEvidenceClaimed","energyEvidenceClaimed",
        "section48Accepted","v171AcceptanceClaimed","lifecyclePromotionAutomatic",
        "consumerAcceptanceAutomatic","deploymentAcceptanceAutomatic","publicationAutomatic",
        "productionAcceptanceAutomatic",
    ):
        req(auth.get(key) is False, f"device template authority must remain false: {key}")

    procedure = PROCEDURE_PATH.read_text(encoding="utf-8")
    req("browser CI, screenshots, responsive viewport emulation" in procedure, "device procedure CI/emulation boundary missing")
    req("A browser/web implementation may support form-factor or Touch device observation" in procedure, "web/native boundary missing")
    req("Do not infer power draw" in procedure, "device/energy boundary missing")

    preparer = PREPARER_PATH.read_text(encoding="utf-8")
    req(f'SOURCE_REVISION = "{SOURCE}"' in preparer and f'SOURCE_MODEL = "{SOURCE_MODEL}"' in preparer, "device preparer exact-source binding missing")
    for marker in (
        '"manualDeviceSessionPerformed": False','"deviceEvidenceClaimed": False',
        '"humanEvidenceClaimed": False','"performanceEvidenceClaimed": False',
        '"energyEvidenceClaimed": False','"section48Accepted": False',
        '"v171AcceptanceClaimed": False',
    ):
        req(marker in preparer, "device preparer authority boundary missing: " + marker)

    return plan


def validate_record(record: dict[str, Any], plan: dict[str, Any]) -> None:
    spec = plan["record"]
    for field in spec["requiredTopLevelFields"]:
        req(field in record, f"record missing top-level field {field}")
    req(record.get("schemaVersion") == 1, "record schemaVersion must be 1")
    req(record.get("recordType") == "glaze-v1.7.1-physical-device-session-candidate", "recordType mismatch")
    req(record.get("sourceRevision") == SOURCE, "record must remain bound to frozen dev.47 source")
    tooling = meaningful(record.get("toolingRevision"), "toolingRevision", 40)
    req(bool(HEX40.fullmatch(tooling)), "toolingRevision must be 40 lowercase hex")
    git("cat-file", "-e", tooling + "^{commit}")
    req(record.get("repository") == "GoreeCloud/glaze", "record repository mismatch")
    timestamp(record.get("capturedAt"), "capturedAt")
    meaningful(record.get("operator"), "operator")
    req(record.get("manualExecution") is True, "manualExecution must be true only after a real device session")

    lane = record.get("laneId")
    req(lane in LANES, f"unsupported device lane: {lane!r}")

    platform = record.get("platform")
    req(isinstance(platform, dict), "platform must be an object")
    req(platform.get("family") in PLATFORMS, "platform.family unsupported")
    for field in ("name","version","build"):
        meaningful(platform.get(field), "platform." + field)

    implementation = record.get("implementation")
    req(isinstance(implementation, dict), "implementation must be an object")
    kind = implementation.get("kind")
    req(kind in IMPLEMENTATIONS, "implementation.kind unsupported")
    meaningful(implementation.get("application"), "implementation.application")
    repo = meaningful(implementation.get("integrationRepository"), "implementation.integrationRepository")
    req(repo.startswith("GoreeCloud/") and repo.count("/") == 1, "integrationRepository must identify one GoreeCloud repository")
    integration_revision = meaningful(implementation.get("integrationRevision"), "implementation.integrationRevision", 40)
    req(bool(HEX40.fullmatch(integration_revision)), "integrationRevision must be 40 lowercase hex")
    req(implementation.get("glazeSourceRevision") == SOURCE, "integration must identify the exact frozen Glaze source")
    meaningful(implementation.get("buildIdentifier"), "implementation.buildIdentifier")
    native_toolkit = meaningful(implementation.get("nativeToolkit"), "implementation.nativeToolkit")

    device = record.get("device")
    req(isinstance(device, dict), "device must be an object")
    req(device.get("physicalDevice") is True, "physicalDevice must be true")
    req(device.get("emulator") is False, "emulator/simulator cannot satisfy device evidence")
    for field in ("manufacturer","model","architecture","safeAreaDescription"):
        meaningful(device.get(field), "device." + field)
    form_factor = device.get("formFactor")
    req(form_factor in FORM_FACTORS, "device.formFactor unsupported")
    finite(device.get("displayRefreshHz"), "device.displayRefreshHz", 1, 1000)
    capabilities = array_of_strings(device.get("inputCapabilities"), "device.inputCapabilities", INPUTS)
    used = array_of_strings(device.get("actualInputsUsed"), "device.actualInputsUsed", INPUTS)
    req(bool(used), "device.actualInputsUsed must identify at least one input actually used")
    req(set(used).issubset(set(capabilities)), "actualInputsUsed must be a subset of inputCapabilities")
    postures = array_of_strings(device.get("posturesObserved"), "device.posturesObserved")
    meaningful(device.get("safeAreaDescription"), "device.safeAreaDescription")

    environment = record.get("environment")
    req(isinstance(environment, dict), "environment must be an object")
    req(environment.get("foregroundState") in {"foreground","mixed"}, "environment.foregroundState unsupported")
    meaningful(environment.get("powerSource"), "environment.powerSource")
    finite(environment.get("batteryPercent"), "environment.batteryPercent", 0, 100)
    meaningful(environment.get("thermalStateBefore"), "environment.thermalStateBefore")
    meaningful(environment.get("thermalStateAfter"), "environment.thermalStateAfter")
    meaningful(environment.get("backgroundLoad"), "environment.backgroundLoad")
    array_of_strings(environment.get("accessibilityModes"), "environment.accessibilityModes")

    expected_scenarios = COMMON_SCENARIOS + [LANE_SCENARIOS[lane]]
    scenarios = record.get("scenarios")
    req(isinstance(scenarios, list), "scenarios must be an array")
    req(len(scenarios) == len(expected_scenarios), "record must contain exactly the common plus lane-specific scenario set")
    by_id: dict[str, dict[str, Any]] = {}
    for i, scenario in enumerate(scenarios):
        req(isinstance(scenario, dict), f"scenarios[{i}] must be an object")
        sid = meaningful(scenario.get("id"), f"scenarios[{i}].id")
        req(sid in expected_scenarios and sid not in by_id, f"unexpected or duplicate scenario {sid}")
        status = scenario.get("status")
        req(status in {"pass","fail"}, f"invalid scenario status for {sid}")
        meaningful(scenario.get("observation"), f"{sid}.observation")
        finding = scenario.get("defectOrFinding")
        if status == "fail":
            meaningful(finding, f"{sid}.defectOrFinding")
        elif finding is not None:
            meaningful(finding, f"{sid}.defectOrFinding")
        by_id[sid] = scenario
    req(list(by_id) == expected_scenarios, "scenario ordering/set must match the governed lane protocol")

    # Lane-specific fail-closed claims.
    if lane in FORM_FACTORS:
        req(form_factor == lane, f"{lane} device record must use formFactor {lane}")
    if lane == "foldable":
        req({"folded","unfolded"}.issubset(set(postures)), "foldable record must observe both folded and unfolded posture")
    if lane == "tv":
        req("remote-dpad" in used, "TV record must use real remote-dpad input")
    if lane == "wearable":
        req(bool({"touch","rotary"} & set(used)), "wearable record must use touch or rotary input")
    if lane == "touch":
        req("touch" in used, "Touch record must use real touch input")
    if lane == "native-behavior":
        req(kind in NATIVE_IMPLEMENTATIONS, "Native behavior record requires a native implementation kind")
        req(native_toolkit.lower() != "not-applicable-for-web", "Native behavior record requires an actual native toolkit")
    if lane == "energy-behavior":
        # These are device-context observations only, never energy measurements.
        meaningful(environment.get("powerSource"), "energy device powerSource")
        meaningful(environment.get("thermalStateBefore"), "energy device thermalStateBefore")
        meaningful(environment.get("thermalStateAfter"), "energy device thermalStateAfter")
        meaningful(environment.get("backgroundLoad"), "energy device backgroundLoad")

    decision = record.get("sessionDecision")
    req(decision in {"session-pass","session-fail"}, "sessionDecision invalid")
    has_failure = any(item["status"] == "fail" for item in scenarios)
    req((decision == "session-fail") == has_failure, "sessionDecision must agree with scenario failures")
    meaningful(record.get("sessionSummary"), "sessionSummary")

    authority = record.get("authority")
    req(isinstance(authority, dict), "authority must be an object")
    req(authority.get("candidateEvidenceOnly") is True, "candidateEvidenceOnly must be true")
    for key in (
        "durableEvidenceRecorded","deviceEvidenceAccepted","laneClosed","humanEvidenceClaimed",
        "assistiveTechnologyEvidenceClaimed","performanceEvidenceClaimed","energyEvidenceClaimed",
        "section48Accepted","v171AcceptanceClaimed","lifecyclePromotionAutomatic",
        "consumerAcceptanceAutomatic","deploymentAcceptanceAutomatic","publicationAutomatic",
        "productionAcceptanceAutomatic",
    ):
        req(authority.get(key) is False, f"record authority overclaim: {key}")

    # Web is explicitly permitted only where the lane itself is not Native behavior.
    if kind == "web":
        req(lane != "native-behavior", "web implementation cannot claim Native behavior device evidence")


def sample(plan: dict[str, Any], lane: str, head: str) -> dict[str, Any]:
    form = lane if lane in FORM_FACTORS else "desktop"
    kind = "android-compose" if lane == "native-behavior" else "web"
    capabilities = {
        "mobile":["touch"],
        "tablet":["touch","pointer","keyboard"],
        "desktop":["pointer","keyboard"],
        "foldable":["touch"],
        "tv":["remote-dpad"],
        "wearable":["touch","rotary"],
        "touch":["touch"],
        "native-behavior":["touch","keyboard"],
        "energy-behavior":["touch"],
    }[lane]
    used = {
        "mobile":["touch"],
        "tablet":["touch"],
        "desktop":["pointer","keyboard"],
        "foldable":["touch"],
        "tv":["remote-dpad"],
        "wearable":["rotary"],
        "touch":["touch"],
        "native-behavior":["touch"],
        "energy-behavior":["touch"],
    }[lane]
    postures = ["folded","unfolded"] if lane == "foldable" else []
    scenarios = [
        {
            "id": sid,
            "status": "pass",
            "observation": f"Synthetic protocol self-test observation for {sid}; not device evidence.",
            "defectOrFinding": "No synthetic blocking finding.",
        }
        for sid in COMMON_SCENARIOS + [LANE_SCENARIOS[lane]]
    ]
    return {
        "schemaVersion":1,
        "recordType":"glaze-v1.7.1-physical-device-session-candidate",
        "sourceRevision":SOURCE,
        "toolingRevision":head,
        "repository":"GoreeCloud/glaze",
        "capturedAt":"2026-10-04T00:45:00Z",
        "operator":"protocol-self-test",
        "manualExecution":True,
        "laneId":lane,
        "platform":{"family":"android","name":"Synthetic Platform","version":"1.0","build":"build-1"},
        "implementation":{
            "kind":kind,
            "application":"Synthetic Review Application",
            "integrationRepository":"GoreeCloud/synthetic-review",
            "integrationRevision":head,
            "glazeSourceRevision":SOURCE,
            "buildIdentifier":"synthetic-build-1",
            "nativeToolkit":"Jetpack Compose" if kind == "android-compose" else "not-applicable-for-web",
        },
        "device":{
            "physicalDevice":True,
            "emulator":False,
            "manufacturer":"Synthetic Manufacturer",
            "model":"Synthetic Device",
            "architecture":"arm64",
            "formFactor":form,
            "displayRefreshHz":60,
            "inputCapabilities":capabilities,
            "actualInputsUsed":used,
            "posturesObserved":postures,
            "safeAreaDescription":"Synthetic safe-area observation for validator self-test.",
        },
        "environment":{
            "foregroundState":"foreground",
            "powerSource":"battery",
            "batteryPercent":80,
            "thermalStateBefore":"nominal",
            "thermalStateAfter":"nominal",
            "backgroundLoad":"controlled-low",
            "accessibilityModes":["default"],
        },
        "scenarios":scenarios,
        "sessionDecision":"session-pass",
        "sessionSummary":"Synthetic validator self-test only; not physical-device evidence.",
        "authority":{
            "candidateEvidenceOnly":True,
            "durableEvidenceRecorded":False,
            "deviceEvidenceAccepted":False,
            "laneClosed":False,
            "humanEvidenceClaimed":False,
            "assistiveTechnologyEvidenceClaimed":False,
            "performanceEvidenceClaimed":False,
            "energyEvidenceClaimed":False,
            "section48Accepted":False,
            "v171AcceptanceClaimed":False,
            "lifecyclePromotionAutomatic":False,
            "consumerAcceptanceAutomatic":False,
            "deploymentAcceptanceAutomatic":False,
            "publicationAutomatic":False,
            "productionAcceptanceAutomatic":False,
        },
    }


def reject(record: dict[str, Any], plan: dict[str, Any], label: str) -> None:
    try:
        validate_record(record, plan)
    except QualificationError:
        return
    raise QualificationError("self-test expected rejection but accepted " + label)


def self_test(plan: dict[str, Any]) -> None:
    head = git("rev-parse", "HEAD")
    req(bool(HEX40.fullmatch(head)), "current tooling revision is not a full SHA")

    for lane in LANES:
        validate_record(sample(plan, lane, head), plan)

    stale = sample(plan, "mobile", head)
    stale["sourceRevision"] = "0" * 40
    reject(stale, plan, "stale Glaze source")

    emulator = sample(plan, "mobile", head)
    emulator["device"]["physicalDevice"] = False
    emulator["device"]["emulator"] = True
    reject(emulator, plan, "emulator represented as physical device")

    mismatch = sample(plan, "mobile", head)
    mismatch["device"]["formFactor"] = "tablet"
    reject(mismatch, plan, "mismatched form factor")

    foldable = sample(plan, "foldable", head)
    foldable["device"]["posturesObserved"] = ["unfolded"]
    reject(foldable, plan, "foldable missing folded posture")

    tv = sample(plan, "tv", head)
    tv["device"]["actualInputsUsed"] = ["keyboard"]
    tv["device"]["inputCapabilities"].append("keyboard")
    reject(tv, plan, "TV without remote-dpad")

    wearable = sample(plan, "wearable", head)
    wearable["device"]["actualInputsUsed"] = ["keyboard"]
    wearable["device"]["inputCapabilities"].append("keyboard")
    reject(wearable, plan, "wearable without touch or rotary")

    touch = sample(plan, "touch", head)
    touch["device"]["actualInputsUsed"] = ["pointer"]
    touch["device"]["inputCapabilities"].append("pointer")
    reject(touch, plan, "Touch lane without touch input")

    native = sample(plan, "native-behavior", head)
    native["implementation"]["kind"] = "web"
    native["implementation"]["nativeToolkit"] = "not-applicable-for-web"
    reject(native, plan, "web represented as Native behavior")

    energy = sample(plan, "energy-behavior", head)
    energy["environment"]["thermalStateAfter"] = "TBD"
    reject(energy, plan, "Energy device group without concrete thermal context")

    inconsistent = sample(plan, "mobile", head)
    inconsistent["scenarios"][0]["status"] = "fail"
    inconsistent["sessionDecision"] = "session-pass"
    reject(inconsistent, plan, "session pass with failed scenario")

    overclaim = sample(plan, "mobile", head)
    overclaim["authority"]["deviceEvidenceAccepted"] = True
    reject(overclaim, plan, "device acceptance overclaim")

    placeholder = sample(plan, "mobile", head)
    placeholder["device"]["manufacturer"] = "REPLACE_WITH_MANUFACTURER"
    reject(placeholder, plan, "placeholder device data")

    template = read_json(TEMPLATE_PATH)
    reject(template, plan, "canonical fail-closed template")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    plan = validate_source()

    if args.record:
        validate_record(read_json(args.record.expanduser().resolve()), plan)
        print("Validated Glaze V1.7.1 physical-device candidate record for lane " + read_json(args.record.expanduser().resolve())["laneId"])
        print("Candidate record remains subject to separate governed review; no lane closure is automatic.")
    if args.self_test:
        self_test(plan)
        print("Glaze V1.7.1 physical-device qualification control self-test: PASS")
        print("Synthetic self-test records are not physical-device evidence.")
    if not args.record and not args.self_test:
        print("Glaze V1.7.1 physical-device qualification control source validation: PASS")

    print("Frozen source: " + SOURCE + " / " + SOURCE_MODEL)
    print("Eligible device lanes: " + ", ".join(LANES))
    print("Human/performance/energy evidence claimed by this control: false")
    print("Current bounded Stable preserved: " + STABLE)


if __name__ == "__main__":
    try:
        main()
    except QualificationError as error:
        raise SystemExit("Glaze V1.7.1 physical-device qualification FAILED: " + str(error))
