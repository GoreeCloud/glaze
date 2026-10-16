# Branding and identity — planned GC UI replacement

| Field | Value |
| --- | --- |
| Owner decision date | October 16, 2026 |
| Classification | Repository branding / future naming decision |
| Decision status | **Approved future direction** |
| Implementation status | **Not yet migrated or verified** |
| Current system name | Glaze |
| Historical predecessor name | Glaze UI |
| Future permanent system name | **GC UI — GoreeCloud User Interface** |
| Official abbreviation expansion | **GC UI** = **GoreeCloud User Interface** |
| Effective cutover date | Not specified ("soon") |

## Decision

**GC UI (GoreeCloud User Interface) will permanently replace both "Glaze" and "Glaze UI" as the active name of GoreeCloud's shared design, interface, and experience system.**

**Naming rule:** **GC UI** is short for **GoreeCloud User Interface**. Use the full form where the expansion is needed and the short form as the approved system name. Do not reinterpret **GC** or **UI** as different words.

This is an owner-directed future naming decision. It does **not** mean that the system, repository, applications, releases, dependent packages, or user-facing interfaces have already migrated.

## Existing state and historical integrity

As of this decision, the implementation repository remains `GoreeCloud/glaze` and its README identifies **Glaze V1.7 / 1.7.0** as the current Official Anchor / Stable-compatibility shared system. Historical releases labeled **Glaze UI** must retain the names and evidence that were valid when they were issued. Current lifecycle, release, registry, and consumer state remain governed by their own verified source files, not by this planned naming record.

After the authorized cutover, **GC UI** must be the sole active design-system identity; the terms **Glaze** and **Glaze UI** remain legitimate only when identifying historical evidence, legacy compatibility surfaces, or migration context.

## Migration and acceptance boundaries

- Inventory active naming, references, tooling, distribution artifacts, URLs, packages, application integration points, design tokens, registries, and governance documents before changing identities.
- Set a precise cutover and compatibility plan when implementation is authorized. No exact date, next version number, repository name, package namespace, or migration mechanism has yet been specified.
- Migrate current branding and references across affected GoreeCloud products in a coordinated, verified process.
- Preserve immutable historical source and releases. Do not rewrite historical Glaze / Glaze UI labels solely to display GC UI.
- Preserve compatibility aliases until consumers and release gates demonstrate that retirement is safe; do not equate a permanent final replacement with an immediate breaking deletion.
- Maintain current Stable, qualification, privacy/security, consumer-acceptance, and release gates; naming alone does not grant new implementation or production status.
- Reconcile the GoreeCloud-wide governing decision and current `Glaze-Index` when the owner-directed name change is implemented and verifiable.

## References and precedence

- [Current implementation summary](../README.md)
- [Existing Glaze rename decision (Drive)](https://docs.google.com/document/d/1yHuwJJ1u4x8wC2lm5vKmx1_KsM9hSX0H/edit)
- [Canonical Glaze Drive index](https://docs.google.com/document/d/1FVfqxQTzE-LAOJNMIz08Gai_n73Vvfo2/edit)

The October 16, 2026 decision supersedes the **long-term naming destination** of older Glaze naming plans. Earlier documents remain historical evidence and must be reconciled through approved authoritative edits; they do not establish that GC UI has launched.

## Revision history

- **2026-10-16:** Clarified the approved expansion: GC UI = GoreeCloud User Interface.
- **2026-10-16:** Initial record of the owner's permanent future GC UI replacement decision. Migration remains planned.
