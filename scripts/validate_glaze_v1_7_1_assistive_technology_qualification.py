#!/usr/bin/env python3
"""Validate Glaze V1.7.1 exact-source manual assistive-technology session records.

Synthetic self-tests validate only the control and record shape. They are never
screen-reader, voice-access, switch-access, human, device, or lifecycle evidence.
"""
from __future__ import annotations

import argparse
import copy
import json
import re
import subprocess
from datetime import datetime
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
PLAN = ROOT / "contracts/v1.7/qualification.v1.2.assistive-technology.plan.json"
ACCEPTANCE = ROOT / "contracts/v1.7/acceptance.dev.json"
LIFECYCLE = ROOT / "registry/lifecycle.json"
VERSION = ROOT / "VERSION"
TEMPLATE = ROOT / "acceptance/v1.7.1-assistive-technology-evidence.template.json"
PROCEDURE = ROOT / "acceptance/v1.7.1-assistive-technology-qualification.md"
HARNESS = ROOT / "reference/v1.7/assistive-technology-qualification.html"
PREPARER = ROOT / "scripts/prepare_glaze_v1_7_1_assistive_technology_qualification.py"

SOURCE = "4b9d085a5177b96cc31d4270b38d792a59872e37"
SOURCE_MODEL = "1.7.0-dev.47"
ACCEPTANCE_MODEL = "1.7.0-dev.39"
STABLE = "1.7.0"
HISTORICAL_STABLE = "1.6.0"
HEX40 = re.compile(r"^[0-9a-f]{40}$")
PLACEHOLDERS = {
    "", "todo", "tbd", "unknown", "n/a", "na", "placeholder", "example",
    "none", "null", "replace_with_operator_name", "replace_with_platform"
}


class QualificationError(RuntimeError):
    pass


def req(ok: bool, message: str) -> None:
    if not ok:
        raise QualificationError(message)


def read_json(path: Path, *, external: bool = False) -> dict[str, Any]:
    label = str(path) if external else str(path.relative_to(ROOT))
    req(path.is_file(), f"missing required JSON file: {label}")
    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise QualificationError(f"invalid JSON file {label}: {exc}") from exc
    req(isinstance(value, dict), f"expected JSON object: {label}")
    return value


def git(*args: str, check: bool = True) -> str:
    result = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    if check:
        req(result.returncode == 0, "git " + " ".join(args) + " failed: " + result.stderr.strip())
    return result.stdout.strip()


def revision() -> str:
    value = git("rev-parse", "HEAD")
    req(bool(HEX40.fullmatch(value)), f"invalid Git revision: {value!r}")
    return value


def meaningful(value: Any, label: str) -> str:
    req(isinstance(value, str), f"{label} must be a string")
    text = value.strip()
    lower = text.lower()
    req(lower not in PLACEHOLDERS, f"{label} contains a placeholder value")
    req(not lower.startswith("replace_with_"), f"{label} contains a placeholder value")
    req("template placeholder" not in lower, f"{label} contains template placeholder text")
    return text


def valid_timestamp(value: Any, label: str) -> str:
    text = meaningful(value, label)
    try:
        parsed = datetime.fromisoformat(text.replace("Z", "+00:00"))
    except ValueError as exc:
        raise QualificationError(f"{label} must be ISO-8601: {text!r}") from exc
    req(parsed.tzinfo is not None, f"{label} must include an explicit timezone")
    return text


def validate_tooling_revision(value: Any, head: str) -> str:
    tooling = meaningful(value, "toolingRevision")
    req(bool(HEX40.fullmatch(tooling)), "toolingRevision must be 40 lowercase hex characters")
    result = subprocess.run(
        ["git", "cat-file", "-e", tooling + "^{commit}"],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    req(result.returncode == 0, "toolingRevision is not available in repository history")
    ancestor = subprocess.run(
        ["git", "merge-base", "--is-ancestor", tooling, head],
        cwd=ROOT,
        capture_output=True,
        text=True,
        check=False,
    )
    req(ancestor.returncode == 0, "toolingRevision must be an ancestor of the validation head")
    return tooling


def validate_source() -> dict[str, Any]:
    plan = read_json(PLAN)
    acceptance = read_json(ACCEPTANCE)
    lifecycle = read_json(LIFECYCLE)
    template = read_json(TEMPLATE)
    harness = HARNESS.read_text(encoding="utf-8")
    procedure = PROCEDURE.read_text(encoding="utf-8")
    preparer = PREPARER.read_text(encoding="utf-8")

    req(VERSION.read_text(encoding="utf-8").strip() == STABLE, "bounded V1.7 Stable VERSION changed")
    req(
        lifecycle.get("currentOfficial") == STABLE
        and lifecycle.get("currentStable") == STABLE
        and lifecycle.get("currentLifecycle") == "anchor",
        "bounded V1.7 Stable/Anchor authority changed",
    )
    req(lifecycle.get("plannedNext") == "1.7.1", "V1.7.1 planned successor changed")
    req(lifecycle.get("activeCandidate") is None and lifecycle.get("activePatchReleaseCandidate") is None,
        "AT qualification control must not create a lifecycle candidate")

    req(plan.get("id") == "glaze-v1.7.1-assistive-technology-qualification", "AT plan ID drifted")
    req(plan.get("version") == "1.7.1-dev.1" and plan.get("lifecycle") == "DevelopmentQualification",
        "AT plan successor identity drifted")
    req(plan.get("sourceRevision") == SOURCE and plan.get("sourceModelVersion") == SOURCE_MODEL,
        "AT plan frozen-source binding drifted")
    req(plan.get("acceptanceModelVersion") == ACCEPTANCE_MODEL, "AT acceptance model binding drifted")
    req(plan.get("stableBaseline") == STABLE and plan.get("historicalSourceStableBaseline") == HISTORICAL_STABLE,
        "AT Stable/historical baseline drifted")
    req(plan.get("consumerEligible") is False, "AT plan must remain non-consumer-eligible")

    requirements = acceptance.get("evidenceRequirements", {})
    req(requirements.get("assistive-technology") == [["assistive-technology"]],
        "assistive-technology lane evidence requirement drifted")
    req(requirements.get("alternative-input") == [["assistive-technology"], ["human"]],
        "alternative-input grouped evidence requirement drifted")

    boundary = plan.get("currentBoundary", {})
    req(boundary.get("protocolEstablished") is True, "AT protocol must be established")
    for key in (
        "manualAssistiveTechnologyEvidenceEstablished",
        "assistiveTechnologyLaneClosed",
        "alternativeInputLaneClosed",
        "humanAccessibilityAcceptanceEstablished",
        "deviceEvidenceEstablished",
        "section41Complete",
        "section48Accepted",
        "v171AcceptanceEstablished",
        "lifecyclePromotionEstablished",
        "consumerAcceptanceEstablished",
        "deploymentAcceptanceEstablished",
        "productionAcceptanceEstablished",
    ):
        req(boundary.get(key) is False, f"AT plan overclaimed {key}")

    rules = plan.get("acceptanceRules", {})
    req(rules.get("operatorIdentityRequired") is True and rules.get("technologyVersionRequired") is True,
        "AT manual identity/version requirements drifted")
    req(rules.get("manualExecutionRequired") is True, "AT manualExecution requirement drifted")
    for key in (
        "machineAccessibilityTreeAloneIsAssistiveTechnologyEvidence",
        "browserAccessibilityTreeAloneIsScreenReaderEvidence",
        "automatedKeyboardTraversalAloneIsAssistiveTechnologyEvidence",
        "hostedCiMayClaimManualAssistiveTechnologyEvidence",
        "sessionPassImpliesAssistiveTechnologyLaneClosed",
        "sessionPassImpliesAlternativeInputLaneClosed",
        "singleTechnologyPassImpliesSupportMatrixAcceptance",
        "singlePlatformPassImpliesCompleteNativeParity",
        "protocolValidationImpliesHumanAcceptance",
        "protocolValidationImpliesSection48Acceptance",
        "protocolValidationImpliesV171Acceptance",
        "protocolValidationImpliesLifecyclePromotion",
        "protocolValidationImpliesConsumerAcceptance",
    ):
        req(rules.get(key) is False, f"AT overclaim guard drifted: {key}")

    required = plan.get("record", {}).get("requiredScenarioIds", [])
    req(isinstance(required, list) and len(required) == 10 and len(required) == len(set(required)),
        "AT required scenario set drifted")

    req(template.get("sourceRevision") == SOURCE, "AT template frozen source drifted")
    req(template.get("manualExecution") is False, "AT template must fail closed on manualExecution")
    req(template.get("device", {}).get("physicalDevice") is False, "AT template must not assert physical device")
    req(template.get("sessionDecision") == "session-fail", "AT template must default to session-fail")
    authority = template.get("authority", {})
    req(authority.get("candidateEvidenceOnly") is True, "AT template must remain candidate-only")
    for key in (
        "durableEvidenceRecorded", "assistiveTechnologyLaneClosed", "alternativeInputLaneClosed",
        "humanEvidenceClaimed", "deviceEvidenceClaimedBySession", "section41Complete",
        "section48Accepted", "v171AcceptanceClaimed", "lifecyclePromotionAutomatic",
        "consumerAcceptanceAutomatic", "deploymentAcceptanceAutomatic", "productionAcceptanceAutomatic"
    ):
        req(authority.get(key) is False, f"AT template overclaimed {key}")

    for marker in (
        "Manual review only.",
        "This page has no PASS control and emits no evidence file.",
        'role="status"',
        'role="alert"',
        'aria-expanded="false"',
        "Move Alpha up",
        "Move Beta down",
        "resolveGlazeAccessibilityContinuity",
        "resolveGlazeAdaptiveInputBinding",
        "task reset allowed",
    ):
        req(marker in harness, "AT review harness missing marker: " + marker)
    req("downloadEvidence" not in harness and "candidateDisposition" not in harness,
        "AT review harness must not generate evidence or a pass disposition")
    req("fetch('../../qualification-source.json'" in harness, "AT harness must verify exact-source manifest")
    req("SOURCE='" + SOURCE + "'" in harness and "SOURCE_MODEL='" + SOURCE_MODEL + "'" in harness,
        "AT harness frozen source identity missing")

    for marker in (
        "real human-operated assistive-technology session",
        "single passing session",
        "Alternative input",
        "remains unverified",
    ):
        req(marker.lower() in procedure.lower(), "AT procedure missing boundary marker: " + marker)

    req('SOURCE_REVISION = "' + SOURCE + '"' in preparer, "AT preparer source binding missing")
    req('manualExecutionPerformed": False' in preparer, "AT preparer must not claim manual execution")
    req('assistiveTechnologyEvidenceClaimed": False' in preparer, "AT preparer must not claim AT evidence")
    return plan


def validate_record(record: dict[str, Any], plan: dict[str, Any], head: str) -> None:
    spec = plan["record"]
    for field in spec["requiredTopLevelFields"]:
        req(field in record, f"record missing top-level field {field}")

    req(record.get("schemaVersion") == 1, "record schemaVersion must be 1")
    req(record.get("recordType") == "glaze-v1.7.1-assistive-technology-session-candidate",
        "recordType mismatch")
    source = meaningful(record.get("sourceRevision"), "sourceRevision")
    req(source == SOURCE, f"AT session must bind frozen source {SOURCE}")
    validate_tooling_revision(record.get("toolingRevision"), head)
    req(record.get("repository") == spec["repository"], "record repository mismatch")
    valid_timestamp(record.get("capturedAt"), "capturedAt")
    meaningful(record.get("operator"), "operator")
    req(record.get("manualExecution") is True,
        "manualExecution must be true; machine-only execution is not assistive-technology evidence")
    meaningful(record.get("platform"), "platform")

    device = record.get("device")
    req(isinstance(device, dict), "device must be an object")
    for field in spec["deviceRequiredFields"]:
        req(field in device, f"device missing {field}")
    req(device.get("physicalDevice") is True, "manual AT session must identify a physical device")
    req(device.get("emulator") is False, "emulator/simulator cannot be represented as a physical AT session")
    for field in ("manufacturer", "model", "osName", "osVersion", "osBuild"):
        meaningful(device.get(field), f"device.{field}")

    technology = record.get("assistiveTechnology")
    req(isinstance(technology, dict), "assistiveTechnology must be an object")
    for field in spec["assistiveTechnologyRequiredFields"]:
        req(field in technology, f"assistiveTechnology missing {field}")
    name = meaningful(technology.get("name"), "assistiveTechnology.name")
    req(name in set(spec["recognizedTechnologies"]), f"unrecognized assistive technology {name!r}")
    meaningful(technology.get("version"), "assistiveTechnology.version")
    meaningful(technology.get("inputMode"), "assistiveTechnology.inputMode")
    if name == "Other":
        meaningful(technology.get("otherName"), "assistiveTechnology.otherName")

    required_ids = list(spec["requiredScenarioIds"])
    statuses = set(spec["scenarioStatus"])
    scenarios = record.get("scenarios")
    req(isinstance(scenarios, list), "scenarios must be an array")
    by_id: dict[str, dict[str, Any]] = {}
    has_failure = False
    for i, scenario in enumerate(scenarios):
        req(isinstance(scenario, dict), f"scenarios[{i}] must be an object")
        sid = meaningful(scenario.get("id"), f"scenarios[{i}].id")
        req(sid in required_ids and sid not in by_id, f"unexpected or duplicate scenario {sid}")
        status = scenario.get("status")
        req(status in statuses, f"invalid scenario status for {sid}: {status!r}")
        if status == "not-applicable-with-reason":
            meaningful(scenario.get("reason"), f"{sid}.reason")
        else:
            meaningful(scenario.get("observation"), f"{sid}.observation")
        if status == "fail":
            has_failure = True
            meaningful(scenario.get("defectOrFinding"), f"{sid}.defectOrFinding")
        by_id[sid] = scenario
    req(set(by_id) == set(required_ids), "record does not contain the exact required AT scenario set")

    decision = record.get("sessionDecision")
    req(decision in set(spec["sessionDecisionValues"]), f"invalid sessionDecision {decision!r}")
    if decision == "session-pass":
        req(not has_failure, "session-pass cannot contain a failed scenario")
    if decision == "session-fail":
        req(has_failure, "session-fail must identify at least one failed scenario")
    meaningful(record.get("sessionSummary"), "sessionSummary")

    authority = record.get("authority")
    req(isinstance(authority, dict), "authority must be an object")
    req(authority.get("candidateEvidenceOnly") is True, "AT record must remain candidate-only")
    for key in (
        "durableEvidenceRecorded", "assistiveTechnologyLaneClosed", "alternativeInputLaneClosed",
        "humanEvidenceClaimed", "deviceEvidenceClaimedBySession", "section41Complete",
        "section48Accepted", "v171AcceptanceClaimed", "lifecyclePromotionAutomatic",
        "consumerAcceptanceAutomatic", "deploymentAcceptanceAutomatic", "productionAcceptanceAutomatic"
    ):
        req(authority.get(key) is False, f"AT session record overclaimed {key}")


def sample(head: str, plan: dict[str, Any]) -> dict[str, Any]:
    return {
        "schemaVersion": 1,
        "recordType": "glaze-v1.7.1-assistive-technology-session-candidate",
        "sourceRevision": SOURCE,
        "toolingRevision": head,
        "repository": "GoreeCloud/glaze",
        "capturedAt": "2026-10-03T23:00:00Z",
        "operator": "qualification-self-test",
        "manualExecution": True,
        "platform": "Synthetic protocol self-test",
        "device": {
            "physicalDevice": True,
            "emulator": False,
            "manufacturer": "SelfTest Manufacturer",
            "model": "SelfTest Device",
            "osName": "SelfTest OS",
            "osVersion": "self-test-version",
            "osBuild": "self-test-build",
        },
        "assistiveTechnology": {
            "name": "Orca",
            "version": "self-test-version",
            "inputMode": "screen-reader-keyboard",
        },
        "scenarios": [
            {
                "id": sid,
                "status": "pass",
                "observation": f"Synthetic format observation for {sid}; validator self-test only.",
            }
            for sid in plan["record"]["requiredScenarioIds"]
        ],
        "sessionDecision": "session-pass",
        "sessionSummary": "Synthetic validator self-test only; not a real manual assistive-technology session.",
        "authority": {
            "candidateEvidenceOnly": True,
            "durableEvidenceRecorded": False,
            "assistiveTechnologyLaneClosed": False,
            "alternativeInputLaneClosed": False,
            "humanEvidenceClaimed": False,
            "deviceEvidenceClaimedBySession": False,
            "section41Complete": False,
            "section48Accepted": False,
            "v171AcceptanceClaimed": False,
            "lifecyclePromotionAutomatic": False,
            "consumerAcceptanceAutomatic": False,
            "deploymentAcceptanceAutomatic": False,
            "productionAcceptanceAutomatic": False,
        },
    }


def reject(record: dict[str, Any], plan: dict[str, Any], head: str, label: str) -> None:
    try:
        validate_record(record, plan, head)
    except QualificationError:
        return
    raise QualificationError(f"self-test expected rejection but accepted {label}")


def self_test(plan: dict[str, Any], head: str) -> None:
    valid = sample(head, plan)
    validate_record(valid, plan, head)

    stale = copy.deepcopy(valid)
    stale["sourceRevision"] = "0" * 40
    reject(stale, plan, head, "stale source")

    machine = copy.deepcopy(valid)
    machine["manualExecution"] = False
    reject(machine, plan, head, "machine-only session")

    emulator = copy.deepcopy(valid)
    emulator["device"].update({"physicalDevice": False, "emulator": True})
    reject(emulator, plan, head, "emulator as physical session")

    placeholder = copy.deepcopy(valid)
    placeholder["assistiveTechnology"]["version"] = "TBD"
    reject(placeholder, plan, head, "placeholder technology version")

    failed_pass = copy.deepcopy(valid)
    failed_pass["scenarios"][0].update({"status": "fail", "defectOrFinding": "Synthetic failure"})
    reject(failed_pass, plan, head, "session-pass with failed scenario")

    overclaim = copy.deepcopy(valid)
    overclaim["authority"]["assistiveTechnologyLaneClosed"] = True
    reject(overclaim, plan, head, "automatic lane closure")

    bad_tooling = copy.deepcopy(valid)
    bad_tooling["toolingRevision"] = "0" * 40
    reject(bad_tooling, plan, head, "unavailable tooling revision")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--record", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    plan = validate_source()
    head = revision()

    if args.record:
        record_path = args.record.expanduser().resolve()
        validate_record(read_json(record_path, external=True), plan, head)
        print(f"Validated V1.7.1 assistive-technology candidate session for frozen source {SOURCE}")
        print(f"Tooling validation head: {head}")
    if args.self_test:
        self_test(plan, head)
        print("Glaze V1.7.1 assistive-technology qualification protocol self-test: PASS")
        print("Synthetic self-test records are not assistive-technology, human, device, or lifecycle evidence")
    if not args.record and not args.self_test:
        print("Glaze V1.7.1 assistive-technology qualification control source validation: PASS")

    print("Assistive technology lane remains open until real exact-source sessions are governed as durable evidence")
    print("Alternative input additionally requires its independent Human evidence group")
    print("Current bounded Stable preserved: Glaze V1.7 / 1.7.0")


if __name__ == "__main__":
    try:
        main()
    except QualificationError as exc:
        raise SystemExit(f"Glaze V1.7.1 assistive-technology qualification failed: {exc}")
