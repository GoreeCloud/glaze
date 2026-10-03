# Glaze V1.7 — Enforcement

The current Glaze enforcement and consumer-conformance target is **Glaze V1.7** (`1.7.0`). `registry/lifecycle.json` and `VERSION` are the live lifecycle authorities. GLAZE UI V1.6 / `1.6.0` remains the immediate known-good Stable rollback baseline.

Enforcement fails closed when required V1.7 evidence is absent, stale, unsupported, or bound to a different revision. Consumers must not claim conformance from copied tokens, renamed assets, screenshots alone, a platform declaration, or the shared V1.7.0 Stable/Anchor promotion itself.

V1.7.0 has a bounded Stable scope defined by `contracts/v1.7/stable-scope.json` and `acceptance/v1.7-stable.md`. Its runtime inherits the accepted V1.6.0 behavior and excludes the retained dev.47 / Section 48 Development feature set. The 21 open retained qualification lanes and Section 48 acceptance are V1.7.1 obligations, not V1.7.0 passes.

Required consumer checks include exact-revision contract validation, accessibility, supported form factors, rendered/native evidence where applicable, applicable performance budgets, privacy/security authority-boundary preservation, migration/rollback evidence, and product-specific release/production acceptance. A Stable/Anchor Glaze release never makes a consumer production-eligible by inheritance.

V1.6.0 and earlier Stable/Candidate evidence remains historical provenance. Privacy Shield, Wardveil Security, Everkeep, GoreeCloud Identity, GoreeCloud Mesh, GoreeCloud Policy, GoreeCloud Observability, applications, services, and platforms retain authority over their own truth domains. Glaze enforcement governs presentation-system conformance only.
