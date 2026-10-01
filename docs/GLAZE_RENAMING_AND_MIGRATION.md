---
title: "Glaze Renaming and Migration"
document_type: "Identity and Migration Record"
status: "Active"
canonical_name: "Glaze"
formal_identity: "Glaze — GoreeCloud Design & Experience System"
former_name: "Glaze UI"
canonical_repository: "GoreeCloud/glaze"
identity_boundary: "Glaze 1.7"
historical_boundary: "Glaze UI 1.6.x and earlier"
last_updated: "2026-10-01"
---

# Glaze Renaming and Migration

## Decision

The canonical system name is **Glaze**.

The formal identity is:

**Glaze — GoreeCloud Design & Experience System**

Glaze UI is the former name. The rename reflects the existing scope of the system across visual design, spatial composition, components, interaction, motion, accessibility, adaptive presentation, task continuity, content and feedback patterns, semantic states, experience consistency, and conformance.

The rename does not create a second UX authority and does not replace the existing platform system.

## Release identity boundary

Historical release identities remain immutable:

- Glaze UI 1.6.x and earlier retain their original labels and evidence.
- Glaze 1.7 is the first release line intended to use the new canonical identity.
- The version number does not reset solely because of the rename.

Current authoritative release state remains **GLAZE UI V1.6 / 1.6.0** until a separate governed V1.7 qualification and lifecycle process establishes a successor release.

## Repository identity

The canonical repository is now:

`GoreeCloud/glaze`

The former repository name `GoreeCloud/glaze-ui` is a legacy compatibility reference. Redirect behavior is useful but is not by itself proof that every downstream dependency has migrated.

## Authority boundary

Glaze governs controlled design and experience decisions: visual, spatial, interaction, component, accessibility, adaptive-presentation, motion, content/feedback, and experience-conformance semantics.

Glaze may present provider-owned state, but it must not invent or infer authentication, authorization, identity, security, privacy, consent, permissions, backup, recovery, synchronization, availability, infrastructure health, policy, observability, or application business logic.

## Compatibility strategy

User-visible current identity should migrate to **Glaze** promptly.

Machine identifiers, package names, environment variables, schemas, token namespaces, workflow inputs, and consumer registry fields may retain legacy aliases while active consumers still depend on them. Removal requires evidence that compatibility is no longer needed.

Legacy file paths may remain as compatibility pointers when removing them would create avoidable breakage.

## Historical evidence rule

Do not rewrite historical evidence solely to match the current brand. Released contracts, signed or published artifacts, acceptance records, tags, historical changelog entries, exact-source review records, and immutable evidence retain the product name valid when they were created.

## Active V1.7 documents

The canonical current V1.7 planning records are:

- `docs/v1.7/GLAZE_V1_7_PLANNED.md`
- `docs/v1.7/GLAZE_V1_7_EXPRESSION_ADAPTIVE_INTELLIGENCE.md`

Former-name V1.7 paths may remain temporarily as compatibility pointers.

## Completion boundary

The identity migration is not complete merely because the repository was renamed. Completion requires current architecture, policies, project documentation, lifecycle metadata, consumers, compatibility surfaces, and active development to use the Glaze identity consistently, with all historical evidence preserved and no active dependency broken.
