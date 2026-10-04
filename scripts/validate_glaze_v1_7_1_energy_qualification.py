#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import json
import math
import re
import subprocess
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
PLAN_PATH = ROOT / "contracts/v1.7/qualification.v1.2.energy.plan.json"
SCHEMA_PATH = ROOT / "schemas/v1.7.1-energy-qualification-plan.schema.json"
TEMPLATE_PATH = ROOT / "acceptance/v1.7.1-energy-evidence.template.json"
PROCEDURE_PATH = ROOT / "acceptance/v1.7.1-energy-qualification.md"
ACCEPTANCE_PATH = ROOT / "contracts/v1.7/acceptance.dev.json"
ENERGY_CONTRACT_PATH = ROOT / "contracts/v1.7/performance-energy-awareness.dev.json"
MOTION_CONTRACT_PATH = ROOT / "contracts/v1.7/motion-performance.dev.json"
LIFECYCLE_PATH = ROOT / "registry/lifecycle.json"
VERSION_PATH = ROOT / "VERSION"

SOURCE = "4b9d085a5177b96cc31d4270b38d792a59872e37"
SOURCE_MODEL = "1.7.0-dev.47"
ACCEPTANCE_MODEL = "1.7.0-dev.39"
STABLE = "1.7.0"
HISTORICAL_STABLE = "1.6.0"
HEX40 = re.compile(r"^[0-9a-f]{40}$")
PLACEHOLDER = re.compile(r"(REPLACE_WITH|\bTBD\b|\bTODO\b|template placeholder)", re.I)

REQUIRED_SCENARIOS = [
    "source-and-build-identity",
    "controlled-idle-baseline",
    "foreground-representative-workload",
    "constrained-or-low-power-workload",
    "background-offscreen-lifecycle",
    "thermal-and-resource-recovery",
    "authority-and-task-integrity",
]
ENERGY_SCENARIOS = set(REQUIRED_SCENARIOS[1:6])
ALLOWED_METHODS = {
    "external-power-meter",
    "platform-energy-instrument",
    "battery-energy-counter",
    "battery-charge-counter",
    "platform-power-profiler",
    "other-direct-quantitative",
}
DIRECT_METRIC_UNITS = {
    "energy-consumed": {"joules", "watt-hours", "milliwatt-hours"},
    "average-power": {"watts", "milliwatts"},
    "charge-consumed": {"milliamp-hours"},
    "platform-energy": {"platform-energy-units"},
}

class QualificationError(RuntimeError):
    pass

def req(value: bool, message: str) -> None:
    if not value:
        raise QualificationError(message)

def read_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"))

def meaningful(value: Any, label: str) -> str:
    req(isinstance(value, str) and value.strip(), label + " must be a non-empty string")
    text = value.strip()
    req(not PLACEHOLDER.search(text), label + " contains a placeholder")
    return text

def finite(value: Any, label: str, minimum: float | None = None, maximum: float | None = None) -> float:
    req(isinstance(value, (int, float)) and not isinstance(value, bool), label + " must be numeric")
    number = float(value)
    req(math.isfinite(number), label + " must be finite")
    if minimum is not None:
        req(number >= minimum, label + f" must be >= {minimum}")
    if maximum is not None:
        req(number <= maximum, label + f" must be <= {maximum}")
    return number

def git(*args: str) -> str:
    result = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        raise QualificationError("git " + " ".join(args) + " failed: " + result.stderr.strip())
    return result.stdout.strip()

def validate_source() -> dict[str, Any]:
    plan = read_json(PLAN_PATH)
    schema = read_json(SCHEMA_PATH)
    acceptance = read_json(ACCEPTANCE_PATH)
    energy = read_json(ENERGY_CONTRACT_PATH)
    motion = read_json(MOTION_CONTRACT_PATH)
    lifecycle = read_json(LIFECYCLE_PATH)
    template = read_json(TEMPLATE_PATH)
    procedure = PROCEDURE_PATH.read_text(encoding="utf-8")

    req(schema.get("$schema") == "https://json-schema.org/draft/2020-12/schema", "schema dialect drifted")
    req(plan.get("schemaVersion") == 1, "plan schemaVersion drifted")
    req(plan.get("planId") == "goreecloud.glaze.v1.7.1.energy-behavior-qualification", "plan ID drifted")
    req(plan.get("lifecycle") == "DevelopmentQualification", "plan lifecycle drifted")
    req(plan.get("successorReleaseLine") == "1.7.1", "successor line drifted")
    req(plan.get("developmentIdentity") == "1.7.1-dev.1", "development identity drifted")
    req(plan.get("sourceRevision") == SOURCE and plan.get("sourceModelVersion") == SOURCE_MODEL, "frozen source binding drifted")
    req(plan.get("acceptanceModelVersion") == ACCEPTANCE_MODEL, "acceptance model drifted")
    req(plan.get("stableBaseline") == STABLE and plan.get("historicalSourceStableBaseline") == HISTORICAL_STABLE, "baseline binding drifted")
    req(plan.get("consumerEligible") is False, "plan must remain non-consumer-eligible")
    req(plan.get("laneId") == "energy-behavior" and plan.get("evidenceType") == "energy", "plan must target only Energy evidence for energy-behavior")
    req(plan.get("conditional") is True, "energy-behavior must remain conditional")
    req(plan.get("otherRequiredGroups") == ["device"], "separate Device prerequisite drifted")
    req(plan.get("retainedOtherGroupsAlreadyPresent") is False, "Device prerequisite must not be assumed present")

    req(acceptance.get("version") == ACCEPTANCE_MODEL, "acceptance contract version drifted")
    req(acceptance.get("evidenceRequirements", {}).get("energy-behavior") == [["energy"], ["device"]], "Energy/Device group requirement drifted")

    req(energy.get("version") == "1.7.0-dev.38", "Performance and Energy Awareness contract drifted")
    req(energy.get("energyPolicy", {}).get("energyAcceptanceInferred") is False, "energy acceptance must not be inferred")
    req(energy.get("requestPolicy", {}).get("callerEnergyThresholdsAccepted") is False, "caller Energy thresholds must remain prohibited")
    req(energy.get("requestPolicy", {}).get("acceptanceMeasurementsAcceptedByResolver") is False, "resolver must not accept acceptance measurements")
    req(energy.get("evidence", {}).get("energyImpactEstablished") is False, "source contract must not pre-establish energy impact")
    req(energy.get("acceptanceBoundary", {}).get("energyAcceptanceEstablished") is False, "source contract must not pre-establish Energy acceptance")
    req(energy.get("degradationPolicy", {}).get("backgroundOptionalWorkSuspended") is True, "background optional-work policy drifted")
    req(energy.get("degradationPolicy", {}).get("idleRenderLoopsAllowed") is False, "idle render-loop policy drifted")

    req(motion.get("version") == "1.7.0-dev.25", "Motion Performance contract drifted")
    req(motion.get("evidence", {}).get("energyImpactEstablished") is False, "Motion Performance must not pre-establish energy impact")
    req(motion.get("degradationPolicy", {}).get("offscreenOptionalWorkSuspended") is True, "offscreen optional-work policy drifted")

    req(VERSION_PATH.read_text(encoding="utf-8").strip() == STABLE, "bounded Stable VERSION changed")
    req(lifecycle.get("currentOfficial") == STABLE and lifecycle.get("currentStable") == STABLE and lifecycle.get("currentLifecycle") == "anchor", "bounded Stable lifecycle changed")
    req(lifecycle.get("plannedNext") == "1.7.1", "plannedNext drifted")
    req(lifecycle.get("activeCandidate") is None and lifecycle.get("activePatchReleaseCandidate") is None, "Energy control must not create a lifecycle candidate")

    record = plan.get("record", {})
    req(set(record.get("allowedMeasurementMethods", [])) == ALLOWED_METHODS, "allowed measurement methods drifted")
    req(record.get("requiredScenarioIds") == REQUIRED_SCENARIOS, "required Energy scenario set drifted")
    req(record.get("measurementDecisionValues") == ["review-required", "measurement-blocked"], "Energy decision vocabulary drifted")

    rules = plan.get("measurementRules", {})
    for key in [
        "samePhysicalDeviceAcrossScenarios","sameIntegrationBuildAcrossScenarios",
        "sameMeasurementMethodAcrossMeasuredScenarios","directQuantitativeEnergyOrPowerMeasurementRequired",
        "controlledIdleRequired","foregroundRepresentativeWorkloadRequired","constrainedOrLowPowerRequired",
        "backgroundOrOffscreenRequired","thermalAndResourceRecoveryRequired",
        "reviewerMustAssessAgainstGoverningStandards","sameSessionComparativeScenariosRequired",
        "platformEnergyUnitsComparableOnlyWithinSameToolSession","accessibilityAndReducedMotionIntegrityRequired",
        "measurementLimitationsRequired",
    ]:
        req(rules.get(key) is True, "required measurement rule drifted: " + key)
    req(rules.get("minimumEnergyScenarioDurationSeconds") == 30, "minimum Energy scenario duration drifted")
    for key in [
        "batteryPercentageAloneIsEnergyEvidence","thermalStateAloneIsEnergyEvidence",
        "cpuGpuUtilizationAloneIsEnergyEvidence","numericEnergyAcceptanceThresholdDefined",
        "protocolMayInventAcceptanceThreshold",
    ]:
        req(rules.get(key) is False, "fail-closed measurement rule drifted: " + key)

    for key, value in plan.get("acceptanceRules", {}).items():
        if key in {"operatorIdentityRequired","integrationBuildIdentityRequired","realPhysicalDeviceRequired","directQuantitativeMeasurementRequired"}:
            req(value is True, "required acceptance rule drifted: " + key)
        else:
            req(value is False, "automatic/overclaim acceptance rule must remain false: " + key)

    req(template.get("measurementDecision") == "measurement-blocked", "template must start measurement-blocked")
    req(template.get("manualExecution") is False, "template must not claim manual execution")
    req(template.get("authority", {}).get("candidateEvidenceOnly") is True, "template must remain candidate-only")
    for key in [
        "durableEvidenceRecorded","energyEvidenceAccepted","deviceEvidenceClaimed",
        "performanceEvidenceClaimed","humanEvidenceClaimed","laneClosed","section48Accepted",
        "v171AcceptanceClaimed","lifecyclePromotionAutomatic","consumerAcceptanceAutomatic",
        "deploymentAcceptanceAutomatic","publicationAutomatic","productionAcceptanceAutomatic",
    ]:
        req(template.get("authority", {}).get(key) is False, "template authority overclaim: " + key)

    for phrase in [
        "must not invent one",
        "Battery percentage by itself is contextual metadata, not Energy evidence.",
        "There is no",
        "separate device group",
    ]:
        req(phrase.lower() in procedure.lower(), "procedure boundary missing: " + phrase)

    git("cat-file", "-e", SOURCE + "^{commit}")
    req(git("merge-base", "--is-ancestor", SOURCE, "HEAD") == "", "frozen source must be in current history")
    return plan

def direct_energy_measurement(items: list[dict[str, Any]]) -> bool:
    for item in items:
        metric = item.get("metric")
        unit = item.get("unit")
        if metric in DIRECT_METRIC_UNITS and unit in DIRECT_METRIC_UNITS[metric]:
            finite(item.get("value"), metric + ".value", 0)
            return True
    return False

def validate_record(record: dict[str, Any], plan: dict[str, Any]) -> None:
    req(isinstance(record, dict), "record must be an object")
    req(record.get("schemaVersion") == 1, "record schemaVersion drifted")
    req(record.get("recordType") == "glaze-v1.7.1-energy-measurement-candidate", "recordType drifted")
    req(record.get("sourceRevision") == SOURCE, "record must bind the frozen Glaze source")
    tooling = meaningful(record.get("toolingRevision"), "toolingRevision")
    req(bool(HEX40.fullmatch(tooling)), "toolingRevision must be a lowercase 40-character SHA")
    req(record.get("repository") == "GoreeCloud/glaze", "repository drifted")
    meaningful(record.get("capturedAt"), "capturedAt")
    meaningful(record.get("operator"), "operator")
    req(record.get("manualExecution") is True, "real Energy record requires manualExecution=true")
    req(record.get("laneId") == "energy-behavior", "record may target only energy-behavior")

    implementation = record.get("implementation")
    req(isinstance(implementation, dict), "implementation must be an object")
    meaningful(implementation.get("application"), "implementation.application")
    repo = meaningful(implementation.get("integrationRepository"), "implementation.integrationRepository")
    req(repo.startswith("GoreeCloud/"), "integration repository must be a GoreeCloud repository")
    integration_revision = meaningful(implementation.get("integrationRevision"), "implementation.integrationRevision")
    req(bool(HEX40.fullmatch(integration_revision)), "integrationRevision must be a lowercase 40-character SHA")
    req(implementation.get("glazeSourceRevision") == SOURCE, "integration must identify the frozen Glaze source")
    meaningful(implementation.get("buildIdentifier"), "implementation.buildIdentifier")

    device = record.get("device")
    req(isinstance(device, dict), "device must be an object")
    req(device.get("physicalDevice") is True, "Energy measurement requires a real physical device")
    req(device.get("emulator") is False, "emulator/simulator cannot be Energy evidence")
    for key in ["manufacturer","model","architecture","formFactor","platform"]:
        meaningful(device.get(key), "device." + key)
    finite(device.get("displayRefreshHz"), "device.displayRefreshHz", 1)

    environment = record.get("environment")
    req(isinstance(environment, dict), "environment must be an object")
    for key in ["powerSource","thermalStateBefore","thermalStateAfter","backgroundLoad","ambientCondition","constrainedCondition"]:
        meaningful(environment.get(key), "environment." + key)
    finite(environment.get("batteryStartPercent"), "environment.batteryStartPercent", 0, 100)
    finite(environment.get("batteryEndPercent"), "environment.batteryEndPercent", 0, 100)
    req(isinstance(environment.get("lowPowerModeAvailable"), bool), "environment.lowPowerModeAvailable must be boolean")

    method = record.get("measurementMethod")
    req(isinstance(method, dict), "measurementMethod must be an object")
    req(method.get("kind") in ALLOWED_METHODS, "measurement method is not permitted")
    for key in ["name","versionOrModel","calibrationOrBaselineNote"]:
        meaningful(method.get(key), "measurementMethod." + key)

    scenarios = record.get("scenarios")
    req(isinstance(scenarios, list) and len(scenarios) == len(REQUIRED_SCENARIOS), "record must contain exactly seven governed scenarios")
    by_id: dict[str, dict[str, Any]] = {}
    incomplete = False
    blocking = False
    authority_count = None
    for index, scenario in enumerate(scenarios):
        req(isinstance(scenario, dict), f"scenarios[{index}] must be an object")
        sid = meaningful(scenario.get("id"), f"scenarios[{index}].id")
        req(sid in REQUIRED_SCENARIOS and sid not in by_id, "unexpected or duplicate scenario: " + sid)
        completed = scenario.get("completed")
        req(isinstance(completed, bool), sid + ".completed must be boolean")
        duration = finite(scenario.get("durationSeconds"), sid + ".durationSeconds", 0)
        req(duration > 0, sid + ".durationSeconds must be greater than zero")
        if sid in ENERGY_SCENARIOS:
            req(duration >= 30, sid + ".durationSeconds must be at least 30 seconds")
        meaningful(scenario.get("observation"), sid + ".observation")
        finding = scenario.get("blockingFinding")
        if finding is not None:
            meaningful(finding, sid + ".blockingFinding")
            blocking = True
        items = scenario.get("quantitativeMeasurements")
        req(isinstance(items, list), sid + ".quantitativeMeasurements must be an array")
        if completed:
            req(bool(items), sid + " requires quantitative measurements when completed")
            for j, item in enumerate(items):
                req(isinstance(item, dict), f"{sid}.quantitativeMeasurements[{j}] must be an object")
                metric = meaningful(item.get("metric"), f"{sid}.quantitativeMeasurements[{j}].metric")
                unit = meaningful(item.get("unit"), f"{sid}.quantitativeMeasurements[{j}].unit")
                finite(item.get("value"), f"{sid}.quantitativeMeasurements[{j}].value", 0)
                req(metric != "battery-percent" and unit != "percent", "battery percentage alone is not Energy evidence")
            if sid in ENERGY_SCENARIOS:
                req(direct_energy_measurement(items), sid + " requires a direct quantitative energy/power measurement")
            if sid == "authority-and-task-integrity":
                matches = [x for x in items if x.get("metric") == "automatic-authority-action-count" and x.get("unit") == "count"]
                req(len(matches) == 1, "authority scenario requires automatic-authority-action-count")
                authority_count = finite(matches[0].get("value"), "automatic-authority-action-count", 0)
        else:
            incomplete = True
        by_id[sid] = scenario

    req(list(by_id) == REQUIRED_SCENARIOS, "scenario ordering/set must match governed protocol")

    decision = record.get("measurementDecision")
    req(decision in {"review-required","measurement-blocked"}, "measurementDecision invalid")
    if decision == "review-required":
        req(not incomplete, "review-required requires every scenario completed")
        req(not blocking, "review-required cannot contain a blocking finding")
        req(authority_count == 0, "review-required requires zero automatic authority actions")
    else:
        req(incomplete or blocking or (authority_count is not None and authority_count > 0), "measurement-blocked requires an incomplete scenario or blocking finding")

    meaningful(record.get("reviewSummary"), "reviewSummary")
    meaningful(record.get("measurementLimitations"), "measurementLimitations")
    authority = record.get("authority")
    req(isinstance(authority, dict), "authority must be an object")
    req(authority.get("candidateEvidenceOnly") is True, "candidateEvidenceOnly must be true")
    for key in [
        "durableEvidenceRecorded","energyEvidenceAccepted","deviceEvidenceClaimed",
        "performanceEvidenceClaimed","humanEvidenceClaimed","laneClosed","section48Accepted",
        "v171AcceptanceClaimed","lifecyclePromotionAutomatic","consumerAcceptanceAutomatic",
        "deploymentAcceptanceAutomatic","publicationAutomatic","productionAcceptanceAutomatic",
    ]:
        req(authority.get(key) is False, "record authority overclaim: " + key)

def sample(plan: dict[str, Any], head: str) -> dict[str, Any]:
    scenarios = []
    for sid in REQUIRED_SCENARIOS:
        if sid in ENERGY_SCENARIOS:
            items = [{"metric":"average-power","unit":"watts","value":2.5}]
        elif sid == "authority-and-task-integrity":
            items = [{"metric":"automatic-authority-action-count","unit":"count","value":0}]
        else:
            items = [{"metric":"identity-check","unit":"count","value":1}]
        scenarios.append({
            "id": sid,
            "durationSeconds": 60 if sid in ENERGY_SCENARIOS else 1,
            "quantitativeMeasurements": items,
            "observation": "Validator self-test observation; synthetic and not Energy evidence.",
            "blockingFinding": None,
            "completed": True,
        })
    return {
        "schemaVersion":1,
        "recordType":"glaze-v1.7.1-energy-measurement-candidate",
        "sourceRevision":SOURCE,
        "toolingRevision":head,
        "repository":"GoreeCloud/glaze",
        "capturedAt":"2026-10-04T01:45:00Z",
        "operator":"energy-protocol-self-test",
        "manualExecution":True,
        "laneId":"energy-behavior",
        "implementation":{
            "application":"Energy Protocol Validation App",
            "integrationRepository":"GoreeCloud/glaze",
            "integrationRevision":head,
            "glazeSourceRevision":SOURCE,
            "buildIdentifier":"validator-self-test-build",
        },
        "device":{
            "physicalDevice":True,
            "emulator":False,
            "manufacturer":"Validation Manufacturer",
            "model":"Validation Hardware",
            "architecture":"x86_64",
            "formFactor":"desktop",
            "platform":"Validation Platform 1.0",
            "displayRefreshHz":60,
        },
        "environment":{
            "powerSource":"battery",
            "batteryStartPercent":80,
            "batteryEndPercent":79,
            "thermalStateBefore":"nominal",
            "thermalStateAfter":"nominal",
            "backgroundLoad":"controlled-low",
            "ambientCondition":"controlled-room",
            "constrainedCondition":"platform-power-saving-mode",
            "lowPowerModeAvailable":True,
        },
        "measurementMethod":{
            "kind":"external-power-meter",
            "name":"Validation Power Meter",
            "versionOrModel":"validator-model",
            "calibrationOrBaselineNote":"Synthetic validator fixture; no real measurement claim.",
        },
        "scenarios":scenarios,
        "measurementDecision":"review-required",
        "reviewSummary":"Synthetic validator self-test only; structurally review-required but not real Energy evidence.",
        "measurementLimitations":"Synthetic fixture values are not physical measurements and have no external comparability.",
        "authority":{
            "candidateEvidenceOnly":True,
            "durableEvidenceRecorded":False,
            "energyEvidenceAccepted":False,
            "deviceEvidenceClaimed":False,
            "performanceEvidenceClaimed":False,
            "humanEvidenceClaimed":False,
            "laneClosed":False,
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
    good = sample(plan, head)
    validate_record(good, plan)

    stale = copy.deepcopy(good)
    stale["sourceRevision"] = "0" * 40
    reject(stale, plan, "stale Glaze source")

    emulator = copy.deepcopy(good)
    emulator["device"]["physicalDevice"] = False
    emulator["device"]["emulator"] = True
    reject(emulator, plan, "emulator represented as Energy hardware")

    battery_only = copy.deepcopy(good)
    battery_only["scenarios"][1]["quantitativeMeasurements"] = [{"metric":"battery-percent","unit":"percent","value":80}]
    reject(battery_only, plan, "battery-percent-only measurement")

    missing_direct = copy.deepcopy(good)
    missing_direct["scenarios"][2]["quantitativeMeasurements"] = [{"metric":"cpu-utilization","unit":"percent-cpu","value":10}]
    reject(missing_direct, plan, "resource proxy represented as direct Energy measurement")

    incomplete_pass = copy.deepcopy(good)
    incomplete_pass["scenarios"][3]["completed"] = False
    incomplete_pass["scenarios"][3]["quantitativeMeasurements"] = []
    reject(incomplete_pass, plan, "review-required with incomplete constrained scenario")

    blocked = copy.deepcopy(good)
    blocked["scenarios"][3]["completed"] = False
    blocked["scenarios"][3]["quantitativeMeasurements"] = []
    blocked["scenarios"][3]["blockingFinding"] = "Constrained mode unavailable."
    blocked["measurementDecision"] = "measurement-blocked"
    validate_record(blocked, plan)

    authority = copy.deepcopy(good)
    authority["scenarios"][-1]["quantitativeMeasurements"][0]["value"] = 1
    authority["scenarios"][-1]["blockingFinding"] = "Observed unauthorized automatic navigation."
    reject(authority, plan, "review-required with automatic authority action")
    authority["measurementDecision"] = "measurement-blocked"
    validate_record(authority, plan)

    overclaim = copy.deepcopy(good)
    overclaim["authority"]["energyEvidenceAccepted"] = True
    reject(overclaim, plan, "Energy acceptance overclaim")

    device_overclaim = copy.deepcopy(good)
    device_overclaim["authority"]["deviceEvidenceClaimed"] = True
    reject(device_overclaim, plan, "Device evidence overclaim")

    template = read_json(TEMPLATE_PATH)
    reject(template, plan, "canonical fail-closed template")

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    plan = validate_source()
    if args.record:
        record = read_json(args.record.expanduser().resolve())
        validate_record(record, plan)
        print("Validated Glaze V1.7.1 Energy candidate record.")
        print("Decision: " + record["measurementDecision"])
        print("Record remains subject to separate governed review; Energy acceptance is not automatic.")
    if args.self_test:
        self_test(plan)
        print("Glaze V1.7.1 Energy qualification control self-test: PASS")
        print("Synthetic self-test records are not Energy evidence.")
    if not args.record and not args.self_test:
        print("Glaze V1.7.1 Energy qualification control source validation: PASS")

    print("Frozen source: " + SOURCE + " / " + SOURCE_MODEL)
    print("Target lane: energy-behavior; evidence type: energy")
    print("Separate Device evidence still required: true")
    print("Numeric Energy acceptance threshold invented by this control: false")
    print("Current bounded Stable preserved: " + STABLE)

if __name__ == "__main__":
    try:
        main()
    except QualificationError as error:
        raise SystemExit("Glaze V1.7.1 Energy qualification FAILED: " + str(error))
