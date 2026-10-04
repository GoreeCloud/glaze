#!/usr/bin/env python3
"""Validate Glaze V1.7.1 field-human candidate records.

This control covers only the Human evidence group for touch, alternative-input,
and native-behavior. Synthetic self-tests validate only the protocol.
"""
from __future__ import annotations
import argparse, json, re, subprocess
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
PLAN_PATH = ROOT / "contracts/v1.7/qualification.v1.2.field-human.plan.json"
SCHEMA_PATH = ROOT / "schemas/v1.7.1-field-human-qualification-plan.schema.json"
ACCEPTANCE_PATH = ROOT / "contracts/v1.7/acceptance.dev.json"
LIFECYCLE_PATH = ROOT / "registry/lifecycle.json"
VERSION_PATH = ROOT / "VERSION"
TEMPLATE_PATH = ROOT / "acceptance/v1.7.1-field-human-evidence.template.json"
PROCEDURE_PATH = ROOT / "acceptance/v1.7.1-field-human-qualification.md"
HUMAN_PLAN_PATH = ROOT / "contracts/v1.7/qualification.v1.2.human.plan.json"
DEVICE_PLAN_PATH = ROOT / "contracts/v1.7/qualification.v1.2.device.plan.json"
AT_PLAN_PATH = ROOT / "contracts/v1.7/qualification.v1.2.assistive-technology.plan.json"
DEVICE_PREPARER = ROOT / "scripts/prepare_glaze_v1_7_1_device_qualification.py"
AT_PREPARER = ROOT / "scripts/prepare_glaze_v1_7_1_assistive_technology_qualification.py"

SOURCE = "4b9d085a5177b96cc31d4270b38d792a59872e37"
SOURCE_MODEL = "1.7.0-dev.47"
ACCEPTANCE_MODEL = "1.7.0-dev.39"
STABLE = "1.7.0"
HISTORICAL_STABLE = "1.6.0"
LANES = ["touch", "alternative-input", "native-behavior"]
COMMON_SCENARIOS = [
    "source-and-session-identity",
    "task-and-focus-continuity",
    "meaning-and-authority-preservation",
    "accessibility-preference-precedence",
    "real-human-operation",
]
LANE_SCENARIOS = {
    "touch": "touch-human-interaction-quality",
    "alternative-input": "alternative-input-human-interaction-quality",
    "native-behavior": "native-behavior-human-platform-quality",
}
NATIVE_IMPLEMENTATIONS = {"android-compose", "apple-swiftui", "linux-native", "other-native"}
ALTERNATIVE_INPUTS = {
    "switch-access", "voice-access", "assistive-input", "rotary",
    "remote-dpad", "stylus", "other-alternative-input",
}
HEX40 = re.compile(r"^[0-9a-f]{40}$")
PLACEHOLDERS = {"", "todo", "tbd", "unknown", "placeholder", "example"}

class QualificationError(RuntimeError):
    pass

def req(ok: bool, message: str) -> None:
    if not ok:
        raise QualificationError(message)

def read_json(path: Path) -> dict[str, Any]:
    req(path.is_file(), "missing required JSON file: " + str(path.relative_to(ROOT)))
    value = json.loads(path.read_text(encoding="utf-8"))
    req(isinstance(value, dict), "expected JSON object: " + str(path))
    return value

def git(*args: str) -> str:
    result = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, check=False)
    req(result.returncode == 0, "git " + " ".join(args) + " failed: " + result.stderr.strip())
    return result.stdout.strip()

def meaningful(value: Any, label: str, allow_na: bool = False) -> str:
    req(isinstance(value, str), label + " must be a string")
    text = value.strip()
    lower = text.lower()
    if allow_na and lower == "not-applicable":
        return text
    req(lower not in PLACEHOLDERS, label + " contains a placeholder")
    req(not lower.startswith("replace_with_"), label + " contains a placeholder")
    req("template placeholder" not in lower, label + " contains template placeholder text")
    return text

def timestamp(value: Any, label: str) -> str:
    text = meaningful(value, label)
    parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    req(parsed.tzinfo is not None, label + " must include timezone")
    return text

def string_array(value: Any, label: str) -> list[str]:
    req(isinstance(value, list), label + " must be an array")
    out = [meaningful(v, label + "[" + str(i) + "]") for i, v in enumerate(value)]
    req(len(out) == len(set(out)), label + " must not contain duplicates")
    return out

def validate_tooling_revision(value: Any) -> str:
    head = git("rev-parse", "HEAD")
    rev = meaningful(value, "toolingRevision")
    req(bool(HEX40.fullmatch(rev)), "toolingRevision must be 40 lowercase hex")
    req(subprocess.run(["git","cat-file","-e",rev+"^{commit}"], cwd=ROOT, check=False).returncode == 0,
        "toolingRevision unavailable in repository history")
    req(subprocess.run(["git","merge-base","--is-ancestor",rev,head], cwd=ROOT, check=False).returncode == 0,
        "toolingRevision must be ancestor of validation head")
    return rev

def validate_source() -> dict[str, Any]:
    plan = read_json(PLAN_PATH)
    schema = read_json(SCHEMA_PATH)
    acceptance = read_json(ACCEPTANCE_PATH)
    lifecycle = read_json(LIFECYCLE_PATH)
    template = read_json(TEMPLATE_PATH)
    human_plan = read_json(HUMAN_PLAN_PATH)
    device_plan = read_json(DEVICE_PLAN_PATH)
    at_plan = read_json(AT_PLAN_PATH)
    procedure = PROCEDURE_PATH.read_text(encoding="utf-8")

    req(VERSION_PATH.read_text(encoding="utf-8").strip() == STABLE, "bounded V1.7 Stable VERSION changed")
    req(lifecycle.get("currentOfficial") == STABLE and lifecycle.get("currentStable") == STABLE and lifecycle.get("currentLifecycle") == "anchor",
        "bounded V1.7 Stable/Anchor authority changed")
    req(lifecycle.get("plannedNext") == "1.7.1", "V1.7.1 planned successor changed")
    req(lifecycle.get("activeCandidate") is None and lifecycle.get("activePatchReleaseCandidate") is None,
        "field-human control must not create a lifecycle candidate")

    req(schema.get("$schema") == "https://json-schema.org/draft/2020-12/schema", "plan schema dialect drifted")
    req(plan.get("planId") == "goreecloud.glaze.v1.7.1.field-human-qualification", "plan ID drifted")
    req(plan.get("lifecycle") == "DevelopmentQualification", "plan lifecycle drifted")
    req(plan.get("successorReleaseLine") == "1.7.1" and plan.get("developmentIdentity") == "1.7.1-dev.1",
        "successor identity drifted")
    req(plan.get("sourceRevision") == SOURCE and plan.get("sourceModelVersion") == SOURCE_MODEL,
        "frozen-source binding drifted")
    req(plan.get("acceptanceModelVersion") == ACCEPTANCE_MODEL, "acceptance model drifted")
    req(plan.get("stableBaseline") == STABLE and plan.get("historicalSourceStableBaseline") == HISTORICAL_STABLE,
        "stable baseline boundary drifted")
    req(plan.get("consumerEligible") is False and plan.get("evidenceType") == "human",
        "consumer/evidence boundary drifted")

    requirements = acceptance.get("evidenceRequirements", {})
    req(requirements.get("touch") == [["device"], ["human"]], "Touch requirements drifted")
    req(requirements.get("alternative-input") == [["assistive-technology"], ["human"]],
        "Alternative input requirements drifted")
    req(requirements.get("native-behavior") == [["device"], ["human"]],
        "Native behavior requirements drifted")

    groups = plan.get("eligibleEvidenceGroups", [])
    req([x.get("laneId") for x in groups] == LANES, "eligible lane set/order drifted")
    for item in groups:
        req(item.get("evidenceType") == "human", "eligible group must be Human")
        req(item.get("companionEvidenceAutomaticallyInherited") is False,
            "companion evidence cannot auto-inherit as Human")

    req(set(human_plan.get("lanes", [])).isdisjoint(LANES), "browser human plan overlaps field-human lanes")
    device_lanes = {x.get("laneId") for x in device_plan.get("eligibleEvidenceGroups", [])}
    req({"touch","native-behavior"}.issubset(device_lanes), "Device companion plan no longer covers Touch/Native")
    at_lanes = {x.get("laneId") for x in at_plan.get("eligibleEvidenceGroups", [])}
    req("alternative-input" in at_lanes, "AT companion plan no longer covers Alternative input")
    req(DEVICE_PREPARER.is_file() and AT_PREPARER.is_file(), "companion preparation helpers are required")

    execution = plan.get("execution", {})
    for key in ("realHumanObservationRequired","realPhysicalDeviceRequired","mayBeCoScheduledWithDeviceOrAssistiveTechnologySession","separateHumanEvidenceRecordRequired"):
        req(execution.get(key) is True, "execution requirement drifted: " + key)
    for key in ("deviceOrAssistiveTechnologyRecordAutomaticallyCountsAsHumanEvidence","hostedCiMayClaimHumanEvidence","emulatorOrSimulatorMayClaimHumanFieldEvidence","generatedTemplateMayClaimHumanEvidence","sessionPassImpliesLaneClosed"):
        req(execution.get(key) is False, "fail-closed execution rule drifted: " + key)

    boundary = plan.get("currentBoundary", {})
    req(boundary.get("protocolEstablished") is True, "protocol must be established")
    for key in ("humanEvidenceEstablished","touchLaneClosed","alternativeInputLaneClosed","nativeBehaviorLaneClosed","deviceEvidenceEstablishedByThisControl","assistiveTechnologyEvidenceEstablishedByThisControl","section41Complete","section48Accepted","v171AcceptanceEstablished","lifecyclePromotionEstablished","consumerAcceptanceEstablished","deploymentAcceptanceEstablished","publicationEstablished","productionAcceptanceEstablished"):
        req(boundary.get(key) is False, "plan overclaimed " + key)

    req(template.get("sourceRevision") == SOURCE, "template source drifted")
    req(template.get("manualExecution") is False, "template must fail closed")
    req(template.get("device", {}).get("physicalDevice") is False, "template must not assert physical device")
    req(template.get("sessionDecision") == "session-fail", "template must default to session-fail")

    for marker in ("A Device record is not Human evidence","Assistive-Technology record is not Human evidence","real physical hardware","touch-human-interaction-quality","alternative-input-human-interaction-quality","native-behavior-human-platform-quality","governed review remains required"):
        req(marker in procedure, "procedure missing marker: " + marker)
    return plan

def validate_record(record: dict[str, Any], plan: dict[str, Any]) -> None:
    req(record.get("schemaVersion") == 1, "schemaVersion must be 1")
    req(record.get("recordType") == "glaze-v1.7.1-field-human-session-candidate", "recordType mismatch")
    req(record.get("sourceRevision") == SOURCE, "record must bind exact frozen source")
    validate_tooling_revision(record.get("toolingRevision"))
    req(record.get("repository") == "GoreeCloud/glaze", "repository identity mismatch")
    timestamp(record.get("capturedAt"), "capturedAt")
    meaningful(record.get("operator"), "operator")
    req(record.get("manualExecution") is True, "manualExecution must be true")

    lane = record.get("laneId")
    req(lane in LANES, "laneId not eligible for field-human evidence")

    platform = record.get("platform")
    req(isinstance(platform, dict), "platform must be object")
    for key in ("family","name","version","build"):
        meaningful(platform.get(key), "platform." + key)

    implementation = record.get("implementation")
    req(isinstance(implementation, dict), "implementation must be object")
    kind = meaningful(implementation.get("kind"), "implementation.kind")
    meaningful(implementation.get("application"), "implementation.application")
    meaningful(implementation.get("integrationRepository"), "implementation.integrationRepository")
    integration_rev = meaningful(implementation.get("integrationRevision"), "implementation.integrationRevision")
    req(bool(HEX40.fullmatch(integration_rev)), "integrationRevision must be 40 lowercase hex")
    req(implementation.get("glazeSourceRevision") == SOURCE, "implementation Glaze source mismatch")
    meaningful(implementation.get("buildIdentifier"), "implementation.buildIdentifier")
    native_toolkit = meaningful(implementation.get("nativeToolkit"), "implementation.nativeToolkit", allow_na=True)

    device = record.get("device")
    req(isinstance(device, dict), "device must be object")
    req(device.get("physicalDevice") is True and device.get("emulator") is False,
        "real physical non-emulated device required")
    for key in ("manufacturer","model","osName","osVersion","osBuild","formFactor"):
        meaningful(device.get(key), "device." + key)

    interaction = record.get("interaction")
    req(isinstance(interaction, dict), "interaction must be object")
    modes = string_array(interaction.get("actualInputModes"), "interaction.actualInputModes")
    req(bool(modes), "actual input mode required")
    at_name = meaningful(interaction.get("assistiveTechnologyName"), "interaction.assistiveTechnologyName", allow_na=True)
    at_version = meaningful(interaction.get("assistiveTechnologyVersion"), "interaction.assistiveTechnologyVersion", allow_na=True)
    meaningful(interaction.get("humanObservationContext"), "interaction.humanObservationContext")

    expected = COMMON_SCENARIOS + [LANE_SCENARIOS[lane]]
    scenarios = record.get("scenarios")
    req(isinstance(scenarios, list) and len(scenarios) == len(expected), "scenario set size mismatch")
    seen = []
    for i, scenario in enumerate(scenarios):
        req(isinstance(scenario, dict), "scenario must be object")
        sid = meaningful(scenario.get("id"), "scenarios[" + str(i) + "].id")
        req(sid in expected and sid not in seen, "unexpected or duplicate scenario " + sid)
        status = scenario.get("status")
        req(status in {"pass","fail"}, "invalid scenario status " + sid)
        meaningful(scenario.get("observation"), sid + ".observation")
        finding = scenario.get("defectOrFinding")
        if status == "fail":
            meaningful(finding, sid + ".defectOrFinding")
        elif finding is not None:
            meaningful(finding, sid + ".defectOrFinding")
        seen.append(sid)
    req(seen == expected, "scenario ordering/set mismatch")

    if lane == "touch":
        req("touch" in modes, "Touch Human record must use real touch")
    elif lane == "alternative-input":
        req(bool(ALTERNATIVE_INPUTS.intersection(modes)), "Alternative input requires concrete alternative input")
        req(at_name.lower() != "not-applicable" and at_version.lower() != "not-applicable",
            "Alternative input requires technology name/version")
    else:
        req(kind in NATIVE_IMPLEMENTATIONS, "Native behavior requires native implementation")
        req(native_toolkit.lower() != "not-applicable", "Native behavior requires actual native toolkit")

    decision = record.get("sessionDecision")
    req(decision in {"session-pass","session-fail"}, "invalid sessionDecision")
    has_failure = any(x.get("status") == "fail" for x in scenarios)
    req((decision == "session-fail") == has_failure, "sessionDecision must agree with failures")
    meaningful(record.get("sessionSummary"), "sessionSummary")

    authority = record.get("authority")
    req(isinstance(authority, dict) and authority.get("candidateEvidenceOnly") is True,
        "candidateEvidenceOnly must be true")
    for key in ("durableEvidenceRecorded","humanEvidenceAccepted","laneClosed","deviceEvidenceClaimedByThisRecord","assistiveTechnologyEvidenceClaimedByThisRecord","performanceEvidenceClaimed","energyEvidenceClaimed","section41Complete","section48Accepted","v171AcceptanceClaimed","lifecyclePromotionAutomatic","consumerAcceptanceAutomatic","deploymentAcceptanceAutomatic","publicationAutomatic","productionAcceptanceAutomatic"):
        req(authority.get(key) is False, "record authority overclaim: " + key)

def sample(lane: str, head: str) -> dict[str, Any]:
    kind = "android-compose" if lane == "native-behavior" else "web"
    modes = {"touch":["touch"],"alternative-input":["switch-access"],"native-behavior":["touch","keyboard"]}[lane]
    at_name = "Switch Access" if lane == "alternative-input" else "not-applicable"
    at_version = "1.0" if lane == "alternative-input" else "not-applicable"
    scenarios = [{"id":sid,"status":"pass","observation":"Synthetic protocol self-test; not Human evidence.","defectOrFinding":"No synthetic blocking finding."} for sid in COMMON_SCENARIOS + [LANE_SCENARIOS[lane]]]
    return {
        "schemaVersion":1,"recordType":"glaze-v1.7.1-field-human-session-candidate",
        "sourceRevision":SOURCE,"toolingRevision":head,"repository":"GoreeCloud/glaze",
        "capturedAt":"2026-10-04T02:30:00Z","operator":"protocol-self-test",
        "manualExecution":True,"laneId":lane,
        "platform":{"family":"android","name":"Synthetic Platform","version":"1.0","build":"build-1"},
        "implementation":{"kind":kind,"application":"Synthetic Review Application","integrationRepository":"GoreeCloud/synthetic-review","integrationRevision":head,"glazeSourceRevision":SOURCE,"buildIdentifier":"synthetic-build","nativeToolkit":"Jetpack Compose" if kind == "android-compose" else "not-applicable"},
        "device":{"physicalDevice":True,"emulator":False,"manufacturer":"Synthetic Manufacturer","model":"Synthetic Device","osName":"Synthetic OS","osVersion":"1.0","osBuild":"build-1","formFactor":"mobile"},
        "interaction":{"actualInputModes":modes,"assistiveTechnologyName":at_name,"assistiveTechnologyVersion":at_version,"humanObservationContext":"Synthetic validator self-test only; not Human evidence."},
        "scenarios":scenarios,"sessionDecision":"session-pass",
        "sessionSummary":"Synthetic validator self-test only; not Human evidence.",
        "authority":{"candidateEvidenceOnly":True,"durableEvidenceRecorded":False,"humanEvidenceAccepted":False,"laneClosed":False,"deviceEvidenceClaimedByThisRecord":False,"assistiveTechnologyEvidenceClaimedByThisRecord":False,"performanceEvidenceClaimed":False,"energyEvidenceClaimed":False,"section41Complete":False,"section48Accepted":False,"v171AcceptanceClaimed":False,"lifecyclePromotionAutomatic":False,"consumerAcceptanceAutomatic":False,"deploymentAcceptanceAutomatic":False,"publicationAutomatic":False,"productionAcceptanceAutomatic":False},
    }

def reject(record: dict[str, Any], plan: dict[str, Any], label: str) -> None:
    try:
        validate_record(record, plan)
    except QualificationError:
        return
    raise QualificationError("self-test expected rejection but accepted " + label)

def self_test(plan: dict[str, Any]) -> None:
    head = git("rev-parse", "HEAD")
    for lane in LANES:
        validate_record(sample(lane, head), plan)
    bad = sample("touch", head); bad["sourceRevision"] = "0"*40; reject(bad, plan, "stale source")
    bad = sample("touch", head); bad["device"]["physicalDevice"] = False; bad["device"]["emulator"] = True; reject(bad, plan, "emulator")
    bad = sample("touch", head); bad["interaction"]["actualInputModes"] = ["pointer"]; reject(bad, plan, "touch without touch")
    bad = sample("alternative-input", head); bad["interaction"]["assistiveTechnologyName"] = "not-applicable"; bad["interaction"]["assistiveTechnologyVersion"] = "not-applicable"; reject(bad, plan, "alternative without technology identity")
    bad = sample("native-behavior", head); bad["implementation"]["kind"] = "web"; bad["implementation"]["nativeToolkit"] = "not-applicable"; reject(bad, plan, "web as native")
    bad = sample("touch", head); bad["scenarios"][0]["status"] = "fail"; bad["sessionDecision"] = "session-pass"; reject(bad, plan, "pass with failed scenario")
    bad = sample("touch", head); bad["authority"]["humanEvidenceAccepted"] = True; reject(bad, plan, "acceptance overclaim")
    bad = sample("touch", head); bad["authority"]["deviceEvidenceClaimedByThisRecord"] = True; reject(bad, plan, "device overclaim")
    bad = sample("touch", head); bad["operator"] = "REPLACE_WITH_OPERATOR_NAME"; reject(bad, plan, "placeholder")
    reject(read_json(TEMPLATE_PATH), plan, "fail-closed template")

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    plan = validate_source()
    if args.record:
        record = read_json(args.record.expanduser().resolve())
        validate_record(record, plan)
        print("Validated Glaze V1.7.1 field-human candidate for " + record["laneId"])
        print("Candidate remains subject to governed review; no lane closure is automatic.")
    if args.self_test:
        self_test(plan)
        print("Glaze V1.7.1 field-human qualification control self-test: PASS")
        print("Synthetic self-tests are not Human evidence.")
    if not args.record and not args.self_test:
        print("Glaze V1.7.1 field-human qualification control source validation: PASS")
    print("Frozen source: " + SOURCE + " / " + SOURCE_MODEL)
    print("Eligible Human lanes: " + ", ".join(LANES))
    print("Device/Assistive-Technology evidence claimed by this control: false")
    print("Current bounded Stable preserved: " + STABLE)

if __name__ == "__main__":
    try:
        main()
    except QualificationError as error:
        raise SystemExit("Glaze V1.7.1 field-human qualification FAILED: " + str(error))
