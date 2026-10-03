# Glaze V1.7 dev.42 — Adaptive Experience Surfaces

**Lifecycle:** Development  
**Stable baseline:** Glaze UI 1.6.0 Anchor  
**Consumer eligible:** No  
**Plan:** V1.7 v1.3, Section 48

## Scope

dev.42 implements the eight adaptive experience surfaces that remained after dev.41:

- Glaze Workspace
- Glaze Compact Surface
- Glaze Agent Activity
- Glaze Privacy Attention
- Glaze Accessibility Presentation
- Glaze Creative Surface
- Glaze Compare
- Glaze Care Surface

Together with dev.40 Expression System Core and dev.41 Contextual Actions / Glaze Brief / Glaze Control Center, this completes the planned **Section 48 source scope**.

## Governing boundaries

The source is presentation-only. It preserves producer and application authority instead of manufacturing truth. In particular:

- Workspace recomposition preserves task, focus, selection, navigation, draft, and provider-owned state through the retained Task Continuity foundation.
- Compact surfaces require attributable provider/source identity before provider-backed items are presented.
- Agent Activity keeps access state and operation result distinct and uses the retained Privacy and Authority Boundary resolver.
- Privacy Attention only communicates accepted authoritative privacy/security truth and fails closed to Unknown when authority cannot be established.
- Accessibility Presentation composes the retained Accessibility Continuity resolver; accessibility changes do not reset the current task.
- Creative Surface keeps proposal, preview, edit, pending, approval, and committed-result states distinct. Glaze does not approve or commit changes.
- Compare preserves neutral comparison semantics. Glaze does not create a rank, score, winner, recommendation, or selection.
- Care Surface presents provider-owned health/maintenance/recovery information and does not infer favorable state.

Raw visual constants, raw performance measurements, ranking controls, authority flags, acceptance controls, and lifecycle controls are rejected at the surface boundary.

## Current qualification state

Section 48 is **source-scope implemented, not accepted**.

The following remain evidence-gated for the exact V1.7 candidate revision:

- rendered and human visual review;
- native and representative-device behavior;
- large-text reflow;
- Forced Colors and other accessibility presentation;
- keyboard, switch-access, and voice-access behavior;
- provider integration and authority-boundary behavior;
- privacy/security integration;
- measured performance and applicable energy behavior;
- cross-platform expression consistency;
- exact artifact provenance and governed qualification review.

No source-level result in this record establishes Seal, Anchor, consumer eligibility, deployment acceptance, or production acceptance.

## Reforge boundary

Implementation was informed by public concepts from Android adaptive layout guidance, GNOME/libadwaita adaptive layouts, and W3C WAI-ARIA interaction guidance. No third-party component implementation is incorporated, and no mechanical rewriting or line-by-line translation was performed.

## Lifecycle preservation

`VERSION` remains 1.6.0 and `registry/lifecycle.json` remains anchored to 1.6.0. dev.42 does not create a V1.7 lifecycle candidate or alter the current Anchor release.
