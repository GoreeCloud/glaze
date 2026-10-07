#!/usr/bin/env python3
"""Validate the current GLAZE UI Stable consumer registry and guidance."""
from __future__ import annotations

from datetime import date
import json
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SEMVER = re.compile(r"^\d+\.\d+\.\d+$")
SHA40 = re.compile(r"^[0-9a-f]{40}$")
REPOSITORY = re.compile(r"^GoreeCloud/.+$")
STATUSES = {"adoption-required", "unverified", "accepted-v1"}
SCHEMA_VERSION = 9


def req(condition: bool, message: str) -> None:
    if not condition:
        raise SystemExit(f"Glaze UI consumer registry validation failed: {message}")


def load_json(path: str) -> dict[str, object]:
    value = json.loads((ROOT / path).read_text(encoding="utf-8"))
    req(isinstance(value, dict), f"{path} root must be an object")
    return value


def validate_guidance(stable: str, label: str) -> None:
    guidance = (ROOT / "CONSUMERS.md").read_text(encoding="utf-8")
    family = ".".join(stable.split(".")[:2])
    req(label in guidance, "CONSUMERS.md must identify the official product label")
    req(stable in guidance, "CONSUMERS.md must identify the current Stable version")
    req(
        f"Fresh repository-local V{family} adoption and acceptance evidence is required" in guidance,
        "CONSUMERS.md must preserve the fresh current-Stable evidence boundary",
    )
    req("No consumer is production-eligible merely because" in guidance, "CONSUMERS.md must preserve independent product acceptance")
    req("consumer registry" in guidance.lower(), "CONSUMERS.md must identify the registry authority")


def validate_schema_contract(stable: str) -> None:
    schema = load_json("schemas/consumer-registry.schema.json")
    properties = schema.get("properties")
    req(isinstance(properties, dict), "consumer registry schema properties")
    schema_version = properties.get("schemaVersion")
    req(isinstance(schema_version, dict) and schema_version.get("const") == SCHEMA_VERSION, f"schema must describe registry schemaVersion {SCHEMA_VERSION}")
    family = ".".join(stable.split(".")[:2])
    req(f"V{family}" in str(schema.get("title", "")), "schema title must identify the current Stable family")
    serialized = json.dumps(schema, sort_keys=True)
    for status in sorted(STATUSES):
        req(status in serialized, f"schema must recognize status {status}")
    req("officialBaseline" in properties and "officialProductLabel" in properties, "schema must describe current official baseline fields")
    req("candidateAssessment" not in properties, "current registry schema must not require retired Candidate assessment state")


def main() -> None:
    stable = (ROOT / "VERSION").read_text(encoding="utf-8").strip()
    req(SEMVER.fullmatch(stable) is not None, "VERSION must contain a semantic Stable version")

    data = load_json("consumers/registry.json")
    lifecycle = load_json("registry/lifecycle.json")
    req(data.get("schemaVersion") == SCHEMA_VERSION, f"registry schemaVersion must be {SCHEMA_VERSION}")
    req(data.get("officialBaseline") == stable, "officialBaseline must match VERSION")
    req(data.get("requiredConsumerVersion") == stable, "requiredConsumerVersion must match VERSION")

    label = data.get("officialProductLabel")
    req(isinstance(label, str) and label.strip(), "officialProductLabel")
    req(lifecycle.get("currentStable") == stable, "lifecycle currentStable must match VERSION")
    req(lifecycle.get("currentOfficial") == stable, "lifecycle currentOfficial must match VERSION")
    req(lifecycle.get("officialProductLabel") == label, "registry/lifecycle product label mismatch")

    releases = lifecycle.get("releases")
    req(isinstance(releases, list), "lifecycle releases list")

    active_candidate = lifecycle.get("activeCandidate")
    if active_candidate is not None:
        req(isinstance(active_candidate, str) and active_candidate.strip(), "activeCandidate must be a version string when present")
        req(active_candidate != stable, "activeCandidate must not equal current Stable")
        candidate_releases = [
            r for r in releases
            if isinstance(r, dict) and r.get("version") == active_candidate
        ]
        req(len(candidate_releases) == 1, "activeCandidate must reference exactly one lifecycle release")
        candidate = candidate_releases[0]
        req(candidate.get("status") == "release-candidate", "activeCandidate must reference a Release Candidate")
        req(candidate.get("consumerEligible") is False, "active Release Candidate must not be consumer-eligible")
        req(candidate.get("stableBaseline") == stable, "active Release Candidate stableBaseline must match current Stable")
    stable_releases = [r for r in releases if isinstance(r, dict) and r.get("version") == stable]
    req(len(stable_releases) == 1, "exactly one lifecycle record must match current Stable")
    release = stable_releases[0]
    req(release.get("status") == "stable", "current Stable lifecycle status")
    req(release.get("consumerEligible") is True, "current Stable must be consumer-eligible")
    anchor = release.get("sourceQualificationAnchor") or release.get("sourceIntegrationAnchor")
    req(isinstance(anchor, str) and SHA40.fullmatch(anchor) is not None, "current Stable exact source anchor")

    vocabulary = data.get("statusVocabulary")
    req(isinstance(vocabulary, list) and set(vocabulary) == STATUSES and len(vocabulary) == len(STATUSES), "statusVocabulary must exactly match the current schema vocabulary")

    enforcement = data.get("enforcement")
    req(isinstance(enforcement, dict), "enforcement object")
    req(enforcement.get("officialCurrentRequired") is True, "officialCurrentRequired must be true")
    req(enforcement.get("productionExceptionsAllowed") is False, "productionExceptionsAllowed must be false")
    scope = enforcement.get("platformScope")
    req(isinstance(scope, list) and scope and len(scope) == len(set(scope)), "platformScope must be a non-empty unique list")
    rule = enforcement.get("unsupportedPlatformRule")
    family = ".".join(stable.split(".")[:2])
    req(isinstance(rule, str) and f"V{family}" in rule, "unsupportedPlatformRule must identify the current Stable family")

    audited_at = data.get("auditedAt")
    req(isinstance(audited_at, str), "auditedAt")
    try:
        date.fromisoformat(audited_at)
    except ValueError as exc:
        raise SystemExit(f"Glaze UI consumer registry validation failed: auditedAt must be YYYY-MM-DD: {exc}") from exc

    consumers = data.get("consumers")
    req(isinstance(consumers, list) and consumers, "consumers must be a non-empty list")
    seen_names: set[str] = set()
    seen_consumer_locations: set[tuple[str, str]] = set()
    accepted = 0
    historical = 0
    required_keys = {"name", "repository", "sourcePath", "status", "targetVersion", "requiredTargetVersion", "referenceRevision", "evidence", "productionEligible", "notes"}

    for index, consumer in enumerate(consumers):
        req(isinstance(consumer, dict), f"consumers[{index}] must be an object")
        req(set(consumer) == required_keys, f"consumers[{index}] field drift")
        name, repo, source_path, status = consumer.get("name"), consumer.get("repository"), consumer.get("sourcePath"), consumer.get("status")
        req(isinstance(name, str) and name.strip(), f"consumers[{index}].name")
        req(isinstance(repo, str) and REPOSITORY.fullmatch(repo) is not None, f"consumers[{index}].repository")
        req(source_path is None or (isinstance(source_path, str) and source_path.strip() and not source_path.startswith("/") and ".." not in source_path.split("/")), f"consumers[{index}].sourcePath")
        normalized_path = source_path or ""
        identity = (repo, normalized_path)
        req(name not in seen_names and identity not in seen_consumer_locations, f"duplicate consumer identity {name}/{repo}/{normalized_path}")
        seen_names.add(name); seen_consumer_locations.add(identity)
        req(status in STATUSES, f"{repo} status")
        req(consumer.get("requiredTargetVersion") == stable, f"{repo} required target must be current Stable")
        req(consumer.get("productionEligible") is False, f"{repo} must not become production-eligible from Glaze registry state alone")
        req(isinstance(consumer.get("notes"), str) and consumer.get("notes").strip(), f"{repo} notes")

        target, revision, evidence = consumer.get("targetVersion"), consumer.get("referenceRevision"), consumer.get("evidence")
        if status in {"adoption-required", "unverified"}:
            if all(value is None for value in (target, revision, evidence)):
                continue
            historical += 1
            req(all(value is not None for value in (target, revision, evidence)), f"{repo} historical provenance must be complete")
            req(isinstance(target, str) and SEMVER.fullmatch(target) is not None and target != stable, f"{repo} historical target")
            req(isinstance(revision, str) and SHA40.fullmatch(revision) is not None, f"{repo} historical revision")
            req(isinstance(evidence, str) and evidence.strip(), f"{repo} historical evidence")
        else:
            accepted += 1
            req(target == stable, f"{repo} accepted target must equal current Stable")
            req(isinstance(revision, str) and SHA40.fullmatch(revision) is not None, f"{repo} accepted revision")
            req(isinstance(evidence, str) and evidence.strip(), f"{repo} accepted evidence")

    validate_schema_contract(stable)
    validate_guidance(stable, label)
    print(f"Glaze UI consumer registry validated: {len(consumers)} consumers, {accepted} accepted for {label} / {stable}, {historical} unresolved consumer(s) retaining historical provenance; product production eligibility remains independently gated")


if __name__ == "__main__":
    main()
