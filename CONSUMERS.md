# Glaze V1.7 Consumers

The machine-readable consumer registry authority is `consumers/registry.json`.

The required target for every applicable GoreeCloud user-facing consumer is **Glaze V1.7** (`1.7.0`). Fresh repository-local V1.7 adoption and acceptance evidence is required for each consumer; the exact required release version is `1.7.0`. Prior V1.6.0 and earlier evidence remains historical provenance and does not automatically establish current conformance.

No consumer is production-eligible merely because Glaze V1.7.0 is the current shared Stable/Anchor target. Each application or service must independently satisfy its own lifecycle, supported-platform, accessibility, security, privacy, integration, deployment, signing/package, and production acceptance requirements.

Current shared authority:

- Version: `1.7.0`
- Runtime: `js/glaze-v1.7.0.mjs`
- Contract: `GLAZE_V1_7.md`
- Stable scope: `contracts/v1.7/stable-scope.json`
- Acceptance: `acceptance/v1.7-stable.md`
- Immediate rollback baseline: `1.6.0`
- Successor Development track: `1.7.1-dev.1`

## Registry status vocabulary

- `adoption-required` — current V1.7.0 acceptance is not established. Historical target/evidence fields may remain as provenance.
- `unverified` — the current consumer state has not yet been verified against V1.7.0.
- `accepted-v1` — the consumer has completed governed product-specific acceptance for the current target at an exact source revision with an evidence reference. This still does not grant overall product production eligibility.

An accepted current consumer must target exactly `1.7.0`.

For monorepos, `repository` identifies the canonical GitHub repository and `sourcePath` identifies the consumer-owned subtree. Repository/path pairs are unique consumer locations; multiple GoreeCloud products may legitimately share one monorepo when their `sourcePath` values differ. A `null` `sourcePath` means the repository root is the consumer source boundary.

## Shared boundary

V1.7.0 is bounded to inherited accepted V1.6.0 runtime behavior. The dev.47/Section 48 feature set is a V1.7.1 Development concern and is not part of current consumer conformance.

Privacy Shield, Wardveil Security, Everkeep, application, service, platform, policy, identity, observability, and other authoritative systems retain their own truth domains.
