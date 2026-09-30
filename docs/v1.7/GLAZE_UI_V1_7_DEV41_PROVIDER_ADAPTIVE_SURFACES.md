# Glaze UI V1.7 dev.41 — Provider Adaptive Surfaces

**Lifecycle:** Development  
**Plan binding:** V1.7 plan v1.3, Section 48  
**Stable baseline:** GLAZE UI V1.6 / 1.6.0  
**Consumer eligible:** No

## Implemented source scope

The bounded dev.41 tranche implements the first provider-driven adaptive experience surfaces:

- **Glaze Contextual Actions** — presents provider-supplied, context-relevant actions only when provider identity, context identity, and availability are authoritative enough to support the presentation. It does not manufacture user intent, rank actions, grant permission or authorization, execute commands, navigate automatically, or invent success.
- **Glaze Brief** — presents rearrangeable provider-owned cards for activity, events, tasks, media, device, synchronization, security, privacy, recovery, and other approved state. Personalization may reorder, hide ordinary cards, or change expression, but it cannot change provider truth or suppress authoritative required/critical communication.
- **Glaze Control Center** — presents reusable semantic controls whose availability, current state, policy, permissions, authorization, execution, and result truth remain owned by the responsible provider/system. Interaction produces presentation proposals only; Glaze does not execute or assume results.

All three surfaces compose the dev.40 Expression System Core and inherit accessibility precedence, performance-aware optional-richness reduction, semantic-truth preservation, and the rule that personalization may change expression but must not change truth.

## Accessibility behavior

The source foundation requires:

- keyboard-equivalent access for actions and controls;
- visible focus;
- semantic roles that match actual interaction;
- predictable reading order for Brief cards;
- visual order aligned with reading order;
- disabled/unavailable state that remains understandable;
- no reliance on color or motion alone for required meaning;
- no suppression of authoritative required/critical Brief communication.

These are source requirements, not rendered or assistive-technology acceptance evidence.

## Reforge research basis

The design was informed by multiple open-source and standards sources reviewed on September 30, 2026:

- **GLib/GIO GAction** (LGPL-2.1-or-later): action functionality is modeled independently from presentation, with enabled/state information carried by the action model. GoreeCloud adopts the implementation-neutral requirement that presentation must not become execution authority.
- **GNOME Shell** (GPL-2.0-or-later): action handling is bounded by explicit shell modes/context. GoreeCloud extracts the requirement that contextual presentation must be scoped rather than globally assumed.
- **Material Web** (Apache-2.0): menu/button patterns distinguish temporary choice surfaces, disabled items, keyboard interaction, and visual emphasis. GoreeCloud independently implements semantic action presentation without copying Material components, tokens, values, or source.
- **Fluent UI** (MIT): open-source design-system patterns reinforce reusable semantic action/control surfaces. GoreeCloud does not import Fluent UI components, assets, fonts, icons, source structures, or visual identity.
- **W3C WAI-ARIA Authoring Practices**: menu-button, button, menu/menubar, and feed patterns inform keyboard/focus, disabled-state, semantic-role, and reading-order requirements.

No third-party implementation is incorporated by this tranche.

## Still planned in Section 48

- Glaze Workspace.
- Glaze Compact Surface.
- Glaze Agent Activity.
- Glaze Privacy Attention.
- Glaze Accessibility Presentation.
- Glaze Creative Surface.
- Glaze Compare.
- Glaze Care Surface.

## Acceptance boundary

Section 48 remains incomplete.

dev.41 is source implementation only. It does not establish rendered, native-platform, assistive-technology, representative-device, keyboard/switch/voice, Large Text/reflow, Forced Colors, measured-performance, energy, cross-platform, security/privacy-provider integration, or human visual acceptance.

The dev.39 acceptance-control framework remains bound to the v1.2 plan and does not automatically accept V1.7 v1.3 Section 48 requirements.

This tranche does not change `VERSION`, `registry/lifecycle.json`, V1.6 Anchor authority, V1.7 consumer eligibility, deployment acceptance, or production acceptance.
