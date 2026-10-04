#!/usr/bin/env python3
from __future__ import annotations

import argparse
import copy
import json
import re
import subprocess
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent
PLAN_PATH = ROOT / "contracts/v1.7/qualification.v1.3.trust.plan.json"
SCHEMA_PATH = ROOT / "schemas/v1.7.1-section48-trust-qualification-plan.schema.json"
PROCEDURE_PATH = ROOT / "acceptance/v1.7.1-section48-trust-qualification.md"
PROVIDER_TEMPLATE_PATH = ROOT / "acceptance/v1.7.1-section48-provider-integration-evidence.template.json"
PRIVACY_TEMPLATE_PATH = ROOT / "acceptance/v1.7.1-section48-privacy-security-evidence.template.json"
LIFECYCLE_PATH = ROOT / "registry/lifecycle.json"
VERSION_PATH = ROOT / "VERSION"

SOURCE = "4b9d085a5177b96cc31d4270b38d792a59872e37"
SOURCE_MODEL = "1.7.0-dev.47"
SECTION48_MODEL = "1.7.0-dev.47"
STABLE = "1.7.0"
HISTORICAL_STABLE = "1.6.0"
HEX40 = re.compile(r"^[0-9a-f]{40}$")
PLACEHOLDER = re.compile(r"(REPLACE_WITH|\bTBD\b|\bTODO\b|template placeholder)", re.I)

PROVIDER_LANES = [
    "agent-activity-authority-v13",
    "care-authority-v13",
    "provider-integration-v13",
    "contextual-actions-v13",
    "brief-v13",
    "control-center-v13",
]
PRIVACY_LANES = [
    "privacy-attention-authority-v13",
    "privacy-security-integration-v13",
]
PROVIDER_SCENARIOS = [
    "source-and-integration-identity",
    "provider-identity-and-provenance",
    "least-privilege-contract",
    "provider-truth-authority",
    "execution-and-result-boundary",
    "failure-isolation-and-revocation",
    "data-minimization-and-secret-exclusion",
    "contract-versioning-and-compatibility",
]
PRIVACY_SCENARIOS = [
    "source-and-integration-identity",
    "privacy-by-default-and-data-minimization",
    "wardveil-security-authority",
    "privacy-shield-authority",
    "provider-local-scope-boundary",
    "conflict-and-unattested-fail-closed",
    "truth-presentation-separation",
    "permission-revocation-and-denial",
    "telemetry-and-secret-exclusion",
]

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

def git(*args: str) -> str:
    result = subprocess.run(["git", *args], cwd=ROOT, capture_output=True, text=True, check=False)
    if result.returncode != 0:
        raise QualificationError("git " + " ".join(args) + " failed: " + result.stderr.strip())
    return result.stdout.strip()

def section48_model() -> dict[str, list[str]]:
    script = r"""
import {V13_SECTION48_QUALIFICATION_LANES} from './js/glaze-v1.7-v1-3-qualification.dev.mjs';
import {V13_SECTION48_COVERAGE_LANES} from './js/glaze-v1.7-v1-3-qualification-coverage.dev.mjs';
const all=[...V13_SECTION48_QUALIFICATION_LANES,...V13_SECTION48_COVERAGE_LANES];
const out={};
for(const lane of all)out[lane.id]=lane.evidenceTypes;
console.log(JSON.stringify(out));
"""
    result = subprocess.run(
        ["node", "--input-type=module", "-e", script],
        cwd=ROOT, capture_output=True, text=True, check=False
    )
    if result.returncode != 0:
        raise QualificationError("unable to load Section 48 qualification model: " + result.stderr.strip())
    return json.loads(result.stdout)

def validate_source() -> dict[str, Any]:
    plan = read_json(PLAN_PATH)
    schema = read_json(SCHEMA_PATH)
    provider_template = read_json(PROVIDER_TEMPLATE_PATH)
    privacy_template = read_json(PRIVACY_TEMPLATE_PATH)
    lifecycle = read_json(LIFECYCLE_PATH)
    procedure = PROCEDURE_PATH.read_text(encoding="utf-8")
    model = section48_model()

    req(schema.get("$schema") == "https://json-schema.org/draft/2020-12/schema", "schema dialect drifted")
    req(plan.get("schemaVersion") == 1, "plan schemaVersion drifted")
    req(plan.get("planId") == "goreecloud.glaze.v1.7.1.section48-trust-qualification", "plan ID drifted")
    req(plan.get("lifecycle") == "DevelopmentQualification", "plan lifecycle drifted")
    req(plan.get("successorReleaseLine") == "1.7.1" and plan.get("developmentIdentity") == "1.7.1-dev.1", "successor identity drifted")
    req(plan.get("sourceRevision") == SOURCE and plan.get("sourceModelVersion") == SOURCE_MODEL, "frozen source binding drifted")
    req(plan.get("section48QualificationModelVersion") == SECTION48_MODEL, "Section 48 model binding drifted")
    req(plan.get("stableBaseline") == STABLE and plan.get("historicalSourceStableBaseline") == HISTORICAL_STABLE, "stable baseline binding drifted")
    req(plan.get("consumerEligible") is False, "plan must remain non-consumer-eligible")
    req(plan.get("evidenceTypes") == ["provider-integration", "privacy-security"], "trust evidence type set drifted")
    req(plan.get("providerIntegrationLaneIds") == PROVIDER_LANES, "provider-integration lane set drifted")
    req(plan.get("privacySecurityLaneIds") == PRIVACY_LANES, "privacy-security lane set drifted")
    req(plan.get("providerIntegrationScenarios") == PROVIDER_SCENARIOS, "provider scenario set drifted")
    req(plan.get("privacySecurityScenarios") == PRIVACY_SCENARIOS, "privacy-security scenario set drifted")

    for lane in PROVIDER_LANES:
        req("provider-integration" in model.get(lane, []), "Section 48 model no longer permits provider-integration for " + lane)
    for lane in PRIVACY_LANES:
        req("privacy-security" in model.get(lane, []), "Section 48 model no longer permits privacy-security for " + lane)

    provider_rules = plan.get("providerIntegrationRules", {})
    for key in [
        "providerIdentityMustBeAuthoritative","providerOwnsProviderTruth","leastPrivilegeRequired",
        "revocationMustRemoveFutureAccess","providerUnavailableMustFailSafely",
        "versionedOrOtherwiseExplicitContractRequired",
    ]:
        req(provider_rules.get(key) is True, "required provider rule drifted: " + key)
    for key in [
        "glazeMayExecuteProviderCommands","glazeMayAssumeProviderResults",
        "glazeMayGrantPermissionOrAuthorization","directProviderDatabaseAccessAllowed",
        "credentialsOrReusableSecretsMayBeRecorded","unnecessaryPrivatePayloadMayBeRecorded",
    ]:
        req(provider_rules.get(key) is False, "provider prohibition drifted: " + key)

    privacy_rules = plan.get("privacySecurityRules", {})
    for key in [
        "privacyByDefaultRequired","dataMinimizationRequired","wardveilOwnsSystemSecurityProtectionTruth",
        "privacyShieldOwnsSystemPrivacyConsentTruth","providerConflictsFailClosed","unattestedTruthFailsClosed",
        "permissionRevocationMustBeObservable",
    ]:
        req(privacy_rules.get(key) is True, "required privacy/security rule drifted: " + key)
    for key in [
        "responsibleProviderMayClaimSystemWidePrivacyAuthority","presentationCreatesTruth","motionCreatesTruth",
        "colorCreatesTruth","materialCreatesTruth","credentialsOrReusableSecretsMayBeRecorded",
        "unnecessaryPrivatePayloadMayBeRecorded","telemetryRequired",
    ]:
        req(privacy_rules.get(key) is False, "privacy/security prohibition drifted: " + key)

    mapping = plan.get("section48IntegrationMap", {})
    for key, rel in {
        "machineControl":"contracts/v1.7/qualification.v1.3.machine.plan.json",
        "renderedControl":"contracts/v1.7/qualification.v1.3.rendered.plan.json",
        "provenanceControl":"contracts/v1.7/qualification.v1.3.provenance.plan.json",
        "humanControl":"contracts/v1.7/qualification.v1.2.human.plan.json",
        "fieldHumanControl":"contracts/v1.7/qualification.v1.2.field-human.plan.json",
        "assistiveTechnologyControl":"contracts/v1.7/qualification.v1.2.assistive-technology.plan.json",
        "deviceControl":"contracts/v1.7/qualification.v1.2.device.plan.json",
        "performanceControl":"contracts/v1.7/qualification.v1.2.performance.plan.json",
        "energyControl":"contracts/v1.7/qualification.v1.2.energy.plan.json",
    }.items():
        req(mapping.get(key) == rel, "integration map drifted: " + key)
        req((ROOT / rel).is_file(), "mapped control missing: " + rel)
    req(mapping.get("companionControlEvidenceAutomaticallyInherited") is False, "companion controls must not auto-inherit evidence")

    current = plan.get("currentBoundary", {})
    req(current.get("protocolEstablished") is True, "protocolEstablished must be true")
    for key in [
        "providerIntegrationEvidenceEstablished","privacySecurityEvidenceEstablished",
        "companionControlEvidenceAutomaticallyInherited","section48EvidenceInventoryComplete",
        "section48Accepted","v171AcceptanceEstablished","lifecyclePromotionEstablished",
        "consumerAcceptanceEstablished","deploymentAcceptanceEstablished","publicationEstablished",
        "productionAcceptanceEstablished",
    ]:
        req(current.get(key) is False, "authority boundary must remain false: " + key)

    req(VERSION_PATH.read_text(encoding="utf-8").strip() == STABLE, "bounded Stable VERSION changed")
    req(lifecycle.get("currentOfficial") == STABLE and lifecycle.get("currentStable") == STABLE and lifecycle.get("currentLifecycle") == "anchor", "bounded V1.7 Stable authority changed")
    req(lifecycle.get("plannedNext") == "1.7.1", "plannedNext drifted")
    req(lifecycle.get("activeCandidate") is None and lifecycle.get("activePatchReleaseCandidate") is None, "trust control must not create lifecycle candidate")

    head = git("rev-parse", "HEAD")
    req(bool(HEX40.fullmatch(head)), "tooling revision must be a full SHA")
    git("cat-file", "-e", SOURCE + "^{commit}")
    result = subprocess.run(["git","merge-base","--is-ancestor",SOURCE,head],cwd=ROOT)
    req(result.returncode == 0, "frozen dev.47 source must remain an ancestor of tooling")

    for phrase in [
        "least-privilege","fail safely","Wardveil Security","Privacy Shield",
        "must not manufacture","reusable credentials","session-pass","candidate evidence",
    ]:
        req(phrase.lower() in procedure.lower(), "procedure missing required concept: " + phrase)

    req(provider_template.get("evidenceType") == "provider-integration", "provider template evidence type drifted")
    req(privacy_template.get("evidenceType") == "privacy-security", "privacy template evidence type drifted")
    req(provider_template.get("authority", {}).get("providerIntegrationEvidenceAccepted") is False, "provider template overclaims accepted evidence")
    req(privacy_template.get("authority", {}).get("privacySecurityEvidenceAccepted") is False, "privacy template overclaims accepted evidence")

    return plan

def validate_scenarios(items: Any, expected: list[str]) -> tuple[bool, bool]:
    req(isinstance(items, list) and len(items) == len(expected), "scenario list must contain the governed scenario set")
    ids: list[str] = []
    all_pass = True
    blocking = False
    for index, item in enumerate(items):
        req(isinstance(item, dict), f"scenarios[{index}] must be an object")
        sid = meaningful(item.get("id"), f"scenarios[{index}].id")
        req(sid in expected and sid not in ids, "unexpected or duplicate scenario: " + sid)
        status = item.get("status")
        req(status in {"pass","fail"}, sid + ".status must be pass or fail")
        meaningful(item.get("observation"), sid + ".observation")
        finding = item.get("blockingFinding")
        if finding is not None:
            meaningful(finding, sid + ".blockingFinding")
            blocking = True
        if status != "pass":
            all_pass = False
        ids.append(sid)
    req(ids == expected, "scenario order/set must match governed protocol")
    return all_pass, blocking

def validate_common(record: dict[str, Any], evidence_type: str, allowed_lanes: list[str]) -> str:
    req(record.get("schemaVersion") == 1, "record schemaVersion drifted")
    req(record.get("evidenceType") == evidence_type, "record evidenceType mismatch")
    req(record.get("sourceRevision") == SOURCE, "record must bind frozen dev.47 source")
    tooling = record.get("toolingRevision")
    req(isinstance(tooling, str) and bool(HEX40.fullmatch(tooling)), "toolingRevision must be a lowercase 40-character SHA")
    req(record.get("repository") == "GoreeCloud/glaze", "repository identity drifted")
    meaningful(record.get("capturedAt"), "capturedAt")
    meaningful(record.get("operator"), "operator")
    req(record.get("manualExecution") is True, "manualExecution must be true")
    lane = meaningful(record.get("laneId"), "laneId")
    req(lane in allowed_lanes, "record targets unsupported lane: " + lane)
    decision = record.get("sessionDecision")
    req(decision in {"session-pass","session-fail"}, "sessionDecision invalid")
    meaningful(record.get("sessionSummary"), "sessionSummary")
    meaningful(record.get("limitations"), "limitations")
    return lane

def validate_provider_record(record: dict[str, Any]) -> None:
    lane = validate_common(record, "provider-integration", PROVIDER_LANES)
    req(record.get("recordType") == "glaze-v1.7.1-section48-provider-integration-candidate", "provider recordType mismatch")
    integration = record.get("integration")
    req(isinstance(integration, dict), "integration must be an object")
    for key in ["consumerApplication","providerSystem","providerEndpointOrContract","providerVersion","integrationRepository","buildIdentifier"]:
        meaningful(integration.get(key), "integration." + key)
    revision = integration.get("integrationRevision")
    req(isinstance(revision, str) and bool(HEX40.fullmatch(revision)), "integrationRevision must be a lowercase 40-character SHA")

    access = record.get("access")
    req(isinstance(access, dict), "access must be an object")
    for key in [
        "leastPrivilegeConfirmed","readOnlyWhereSufficient","directProviderDatabaseAccess",
        "providerAuthorizationRechecked","revocationTested","credentialsOrReusableSecretsRecorded",
        "unnecessaryPrivatePayloadRecorded",
    ]:
        req(isinstance(access.get(key), bool), "access." + key + " must be boolean")

    all_pass, blocking = validate_scenarios(record.get("scenarios"), PROVIDER_SCENARIOS)
    if record.get("sessionDecision") == "session-pass":
        req(all_pass and not blocking, "session-pass requires every provider scenario to pass without blocking finding")
        req(access.get("leastPrivilegeConfirmed") is True, "session-pass requires least privilege confirmation")
        req(access.get("providerAuthorizationRechecked") is True, "session-pass requires provider authorization recheck")
        req(access.get("revocationTested") is True, "session-pass requires revocation test")
        req(access.get("directProviderDatabaseAccess") is False, "direct provider database access cannot pass")
        req(access.get("credentialsOrReusableSecretsRecorded") is False, "recorded secrets cannot pass")
        req(access.get("unnecessaryPrivatePayloadRecorded") is False, "unnecessary private payload cannot pass")
    else:
        req((not all_pass) or blocking, "session-fail requires a failed scenario or blocking finding")

    authority = record.get("authority")
    req(isinstance(authority, dict), "authority must be an object")
    req(authority.get("candidateEvidenceOnly") is True, "provider candidateEvidenceOnly must be true")
    for key in [
        "durableEvidenceRecorded","providerIntegrationEvidenceAccepted","providerTruthOwnedByGlaze",
        "commandExecutionPerformedByGlaze","permissionOrAuthorizationGrantedByGlaze","laneClosed",
        "section48Accepted","v171AcceptanceClaimed","lifecyclePromotionAutomatic",
        "consumerAcceptanceAutomatic","deploymentAcceptanceAutomatic","publicationAutomatic",
        "productionAcceptanceAutomatic",
    ]:
        req(authority.get(key) is False, "provider authority overclaim: " + key)
    req(lane in PROVIDER_LANES, "provider lane drifted")

def validate_privacy_record(record: dict[str, Any]) -> None:
    lane = validate_common(record, "privacy-security", PRIVACY_LANES)
    req(record.get("recordType") == "glaze-v1.7.1-section48-privacy-security-candidate", "privacy recordType mismatch")
    integration = record.get("integration")
    req(isinstance(integration, dict), "integration must be an object")
    for key in ["applicationOrSurface","privacyShieldIntegration","wardveilIntegration","integrationRepository","buildIdentifier"]:
        meaningful(integration.get(key), "integration." + key)
    revision = integration.get("integrationRevision")
    req(isinstance(revision, str) and bool(HEX40.fullmatch(revision)), "integrationRevision must be a lowercase 40-character SHA")

    state = record.get("privacySecurity")
    req(isinstance(state, dict), "privacySecurity must be an object")
    true_keys = [
        "privacyByDefaultConfirmed","dataMinimizationConfirmed","wardveilAuthorityPreserved",
        "privacyShieldAuthorityPreserved","providerLocalScopePreserved","conflictsFailClosed",
        "unattestedTruthFailsClosed","permissionRevocationTested",
    ]
    false_keys = [
        "credentialsOrReusableSecretsRecorded","unnecessaryPrivatePayloadRecorded","telemetryRequired",
    ]
    for key in true_keys + false_keys:
        req(isinstance(state.get(key), bool), "privacySecurity." + key + " must be boolean")

    all_pass, blocking = validate_scenarios(record.get("scenarios"), PRIVACY_SCENARIOS)
    if record.get("sessionDecision") == "session-pass":
        req(all_pass and not blocking, "session-pass requires every privacy/security scenario to pass without blocking finding")
        for key in true_keys:
            req(state.get(key) is True, "session-pass requires privacy/security safeguard: " + key)
        for key in false_keys:
            req(state.get(key) is False, "session-pass prohibits privacy/security condition: " + key)
    else:
        req((not all_pass) or blocking, "session-fail requires a failed scenario or blocking finding")

    authority = record.get("authority")
    req(isinstance(authority, dict), "authority must be an object")
    req(authority.get("candidateEvidenceOnly") is True, "privacy candidateEvidenceOnly must be true")
    req(authority.get("systemSecurityTruthOwnedByWardveil") is True, "Wardveil authority flag must stay true")
    req(authority.get("systemPrivacyTruthOwnedByPrivacyShield") is True, "Privacy Shield authority flag must stay true")
    for key in ["presentationCreatesTruth","motionCreatesTruth","colorCreatesTruth","materialCreatesTruth"]:
        req(authority.get(key) is False, "truth/presentation boundary overclaim: " + key)
    for key in [
        "durableEvidenceRecorded","privacySecurityEvidenceAccepted","laneClosed","section48Accepted",
        "v171AcceptanceClaimed","lifecyclePromotionAutomatic","consumerAcceptanceAutomatic",
        "deploymentAcceptanceAutomatic","publicationAutomatic","productionAcceptanceAutomatic",
    ]:
        req(authority.get(key) is False, "privacy authority overclaim: " + key)
    req(lane in PRIVACY_LANES, "privacy lane drifted")

def sample_provider(head: str) -> dict[str, Any]:
    return {
        "schemaVersion":1,
        "recordType":"glaze-v1.7.1-section48-provider-integration-candidate",
        "evidenceType":"provider-integration",
        "sourceRevision":SOURCE,
        "toolingRevision":head,
        "repository":"GoreeCloud/glaze",
        "capturedAt":"2026-10-04T02:30:00Z",
        "operator":"trust-protocol-self-test",
        "manualExecution":True,
        "laneId":"provider-integration-v13",
        "integration":{
            "consumerApplication":"Validation Consumer",
            "providerSystem":"Validation Provider",
            "providerEndpointOrContract":"v1 validation contract",
            "providerVersion":"1.0",
            "integrationRepository":"GoreeCloud/glaze",
            "integrationRevision":head,
            "buildIdentifier":"validator-self-test-build",
        },
        "access":{
            "leastPrivilegeConfirmed":True,"readOnlyWhereSufficient":True,
            "directProviderDatabaseAccess":False,"providerAuthorizationRechecked":True,
            "revocationTested":True,"credentialsOrReusableSecretsRecorded":False,
            "unnecessaryPrivatePayloadRecorded":False,
        },
        "scenarios":[
            {"id":sid,"status":"pass","observation":"Synthetic validator self-test; not provider evidence.","blockingFinding":None}
            for sid in PROVIDER_SCENARIOS
        ],
        "sessionDecision":"session-pass",
        "sessionSummary":"Synthetic validator self-test only; not externally accepted provider evidence.",
        "limitations":"Synthetic control-plane fixture with no live provider integration.",
        "authority":{
            "candidateEvidenceOnly":True,"durableEvidenceRecorded":False,
            "providerIntegrationEvidenceAccepted":False,"providerTruthOwnedByGlaze":False,
            "commandExecutionPerformedByGlaze":False,"permissionOrAuthorizationGrantedByGlaze":False,
            "laneClosed":False,"section48Accepted":False,"v171AcceptanceClaimed":False,
            "lifecyclePromotionAutomatic":False,"consumerAcceptanceAutomatic":False,
            "deploymentAcceptanceAutomatic":False,"publicationAutomatic":False,
            "productionAcceptanceAutomatic":False,
        },
    }

def sample_privacy(head: str) -> dict[str, Any]:
    return {
        "schemaVersion":1,
        "recordType":"glaze-v1.7.1-section48-privacy-security-candidate",
        "evidenceType":"privacy-security",
        "sourceRevision":SOURCE,
        "toolingRevision":head,
        "repository":"GoreeCloud/glaze",
        "capturedAt":"2026-10-04T02:30:00Z",
        "operator":"trust-protocol-self-test",
        "manualExecution":True,
        "laneId":"privacy-security-integration-v13",
        "integration":{
            "applicationOrSurface":"Validation Surface",
            "privacyShieldIntegration":"Validation Privacy Shield boundary",
            "wardveilIntegration":"Validation Wardveil boundary",
            "integrationRepository":"GoreeCloud/glaze",
            "integrationRevision":head,
            "buildIdentifier":"validator-self-test-build",
        },
        "privacySecurity":{
            "privacyByDefaultConfirmed":True,"dataMinimizationConfirmed":True,
            "wardveilAuthorityPreserved":True,"privacyShieldAuthorityPreserved":True,
            "providerLocalScopePreserved":True,"conflictsFailClosed":True,
            "unattestedTruthFailsClosed":True,"permissionRevocationTested":True,
            "credentialsOrReusableSecretsRecorded":False,"unnecessaryPrivatePayloadRecorded":False,
            "telemetryRequired":False,
        },
        "scenarios":[
            {"id":sid,"status":"pass","observation":"Synthetic validator self-test; not privacy/security evidence.","blockingFinding":None}
            for sid in PRIVACY_SCENARIOS
        ],
        "sessionDecision":"session-pass",
        "sessionSummary":"Synthetic validator self-test only; not externally accepted privacy/security evidence.",
        "limitations":"Synthetic control-plane fixture with no live Privacy Shield/Wardveil integration.",
        "authority":{
            "candidateEvidenceOnly":True,"durableEvidenceRecorded":False,
            "privacySecurityEvidenceAccepted":False,
            "systemSecurityTruthOwnedByWardveil":True,"systemPrivacyTruthOwnedByPrivacyShield":True,
            "presentationCreatesTruth":False,"motionCreatesTruth":False,"colorCreatesTruth":False,
            "materialCreatesTruth":False,"laneClosed":False,"section48Accepted":False,
            "v171AcceptanceClaimed":False,"lifecyclePromotionAutomatic":False,
            "consumerAcceptanceAutomatic":False,"deploymentAcceptanceAutomatic":False,
            "publicationAutomatic":False,"productionAcceptanceAutomatic":False,
        },
    }

def reject(func, record: dict[str, Any], label: str) -> None:
    try:
        func(record)
    except QualificationError:
        return
    raise QualificationError("self-test expected rejection but accepted " + label)

def self_test() -> None:
    head = git("rev-parse", "HEAD")
    provider = sample_provider(head)
    privacy = sample_privacy(head)
    validate_provider_record(provider)
    validate_privacy_record(privacy)

    stale = copy.deepcopy(provider)
    stale["sourceRevision"] = "0" * 40
    reject(validate_provider_record, stale, "stale provider source")

    direct_db = copy.deepcopy(provider)
    direct_db["access"]["directProviderDatabaseAccess"] = True
    reject(validate_provider_record, direct_db, "direct provider database access")

    secrets = copy.deepcopy(provider)
    secrets["access"]["credentialsOrReusableSecretsRecorded"] = True
    reject(validate_provider_record, secrets, "provider secrets recorded")

    provider_overclaim = copy.deepcopy(provider)
    provider_overclaim["authority"]["providerIntegrationEvidenceAccepted"] = True
    reject(validate_provider_record, provider_overclaim, "provider evidence acceptance overclaim")

    conflict = copy.deepcopy(privacy)
    conflict["privacySecurity"]["conflictsFailClosed"] = False
    reject(validate_privacy_record, conflict, "privacy conflict not fail-closed")

    wardveil = copy.deepcopy(privacy)
    wardveil["privacySecurity"]["wardveilAuthorityPreserved"] = False
    reject(validate_privacy_record, wardveil, "Wardveil authority not preserved")

    privacy_secret = copy.deepcopy(privacy)
    privacy_secret["privacySecurity"]["credentialsOrReusableSecretsRecorded"] = True
    reject(validate_privacy_record, privacy_secret, "privacy/security secrets recorded")

    privacy_overclaim = copy.deepcopy(privacy)
    privacy_overclaim["authority"]["section48Accepted"] = True
    reject(validate_privacy_record, privacy_overclaim, "Section 48 acceptance overclaim")

    reject(validate_provider_record, read_json(PROVIDER_TEMPLATE_PATH), "provider fail-closed template")
    reject(validate_privacy_record, read_json(PRIVACY_TEMPLATE_PATH), "privacy fail-closed template")

def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--provider-record", type=Path)
    parser.add_argument("--privacy-record", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    validate_source()
    if args.provider_record:
        validate_provider_record(read_json(args.provider_record.expanduser().resolve()))
        print("Validated Glaze V1.7.1 Section 48 provider-integration candidate record.")
    if args.privacy_record:
        validate_privacy_record(read_json(args.privacy_record.expanduser().resolve()))
        print("Validated Glaze V1.7.1 Section 48 privacy-security candidate record.")
    if args.self_test:
        self_test()
        print("Glaze V1.7.1 Section 48 trust qualification control self-test: PASS")
        print("Synthetic self-test records are not provider-integration or privacy-security evidence.")
    if not args.provider_record and not args.privacy_record and not args.self_test:
        print("Glaze V1.7.1 Section 48 trust qualification control source validation: PASS")

    print("Frozen source: " + SOURCE + " / " + SOURCE_MODEL)
    print("Provider-integration lanes: " + str(len(PROVIDER_LANES)))
    print("Privacy-security lanes: " + str(len(PRIVACY_LANES)))
    print("Candidate records automatically accepted: false")
    print("Section 48 accepted by this control: false")
    print("Current bounded Stable preserved: " + STABLE)

if __name__ == "__main__":
    try:
        main()
    except QualificationError as error:
        raise SystemExit("Glaze V1.7.1 Section 48 trust qualification FAILED: " + str(error))
