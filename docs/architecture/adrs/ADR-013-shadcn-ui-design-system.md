# ADR-013: shadcn/ui as the Frontend Design-System Foundation

Status: Accepted
Date: 2026-07-24

## Context

The product has staff operations, dense calendars/tables, public booking,
configuration forms, responsive mobile web, and later Bangla localization.
Building every interactive primitive from scratch would consume significant
time and create accessibility inconsistency. Using several component libraries
would create conflicting APIs, visual rules, bundle cost, and maintenance.

The founder explicitly prefers shadcn/ui as the common frontend foundation.

## Decision

- Use shadcn/ui as the default component system for all first-party web
  surfaces.
- Initialize new components on the current stable Base UI primitive foundation.
  Base UI is shadcn/ui's current default for new projects; Radix remains a
  viable fallback if a Phase 4 component proof exposes a blocker.
- Use the current shadcn `base-nova` style, neutral base color, CSS-variable
  theming, Tailwind CSS, Lucide icons, TypeScript, and React Server Component
  support.
- Store the generated/copied source in `packages/ui`; it is application-owned
  code, reviewed and versioned with the repository.
- Compose product-specific components from those primitives instead of adding
  another general-purpose UI kit.
- Use semantic native HTML directly when it is simpler and more accessible.
  This is not an exception to the design system.
- Do not introduce Material UI, Ant Design, Chakra UI, Bootstrap component
  JavaScript, another shadcn registry, or a large commercial component suite
  without a superseding ADR.

The initial `components.json` choices that cannot be changed safely after
initialization are committed and reviewed before the first bulk component
installation.

## Ownership layers

```text
packages/ui
  shadcn primitives + tokens + shared low-level composition
        ↓
apps/web/components
  product components and domain display patterns
        ↓
apps/web/features and routes
  workflow composition, data loading, and screen state
```

Examples of product components include money/phone inputs, booking-status
badges, slot pickers, operational data tables, conflict messages, permission
explanations, and responsive booking summaries.

## Accessibility boundary

Base UI handles substantial primitive behavior such as ARIA attributes,
keyboard interaction, pointer behavior, and focus management. It does not make
the completed application automatically accessible.

The application still owns:

- labels, descriptions, headings, landmarks, and status announcements;
- focus order and restoration across complete workflows;
- contrast and non-color meaning after theme customization;
- keyboard behavior of composed calendars, tables, and slot pickers;
- validation/error association;
- zoom, mobile reflow, touch targets, and reduced motion;
- automated checks plus manual keyboard and screen-reader task tests.

Core Today and public-booking flows retain the WCAG 2.2 AA target in
NFR-UX-001.

## Alternatives

### Hand-built Tailwind components

Maximum control but duplicates difficult dialog, menu, select, popover, focus,
and keyboard work with little product advantage.

### Material UI, Ant Design, or Chakra UI

Broad component inventory, but a second runtime design abstraction is
unnecessary when shadcn source ownership and customization are explicitly
preferred.

### Radix-based shadcn

Mature and accessible, and remains the fallback. Base UI is selected for the
new project because it is now stable and the default maintained path in
shadcn/ui. Switching primitive bases later is treated as a migration, not a
casual style change.

### A private shadcn registry immediately

Useful when several applications or repositories need distribution. One web
application and one shared UI workspace do not yet justify operating a
registry. The repository itself is the source of truth.

## Consequences

- shadcn component files are our code; upstream changes are reviewed diffs, not
  automatic package-wide visual changes.
- Page code does not copy and restyle primitives independently.
- Domain/business logic and server authorization never move into UI
  components.
- A component inventory, token contract, examples, and accessibility tests are
  required during Phase 4.
- Future mobile applications reuse API/domain semantics and design tokens where
  practical, not React DOM component source.

## Migration and reversal path

Product screens import through the shared UI package and product-component
layer. Individual primitives can be replaced behind those exports. A complete
primitive-base migration requires a dedicated ADR, component interaction
regression suite, and visual/accessibility review.

## References

- [shadcn/ui installation](https://ui.shadcn.com/docs/installation)
- [shadcn/ui monorepo guidance](https://ui.shadcn.com/docs/monorepo)
- [shadcn/ui theming](https://ui.shadcn.com/docs/theming)
- [shadcn/ui components configuration](https://ui.shadcn.com/docs/components-json)
- [shadcn/ui July 2026 changes](https://ui.shadcn.com/docs/changelog)
- [Base UI accessibility](https://base-ui.com/react/overview/accessibility)

## Traceability

ADR-003; ADR-012; NFR-UX-001–006; NFR-MNT-001; screen inventory and
low-fidelity interaction designs.
