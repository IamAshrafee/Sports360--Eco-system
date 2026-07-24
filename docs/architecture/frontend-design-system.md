# Frontend Design-System Architecture

Status: Accepted Phase 3 amendment

## Objective

Create one consistent, accessible, responsive interface system for staff,
owners, customers, and platform administration without making every screen
look like an unrelated collection of Tailwind classes.

shadcn/ui is the foundation, not the finished product design. The product still
needs its own tokens, domain components, information hierarchy, workflows, and
quality gates.

## Foundation

| Concern | Decision |
|---|---|
| Component source | shadcn/ui source owned in the repository |
| Primitive base | Base UI; Radix is the tested fallback |
| Style preset | `base-nova` |
| Base palette | Neutral |
| Styling | Tailwind CSS with semantic CSS variables |
| Icons | Lucide; every ambiguous icon has an accessible name/tooltip where appropriate |
| Source package | `packages/ui` |
| First consumer | `apps/web` |
| Direction | LTR initially; logical properties preserve future RTL capability |
| Theme | Light production theme first; token structure permits dark mode later |

These initialization choices are recorded in both the web and UI workspace
`components.json` files. Style, base, icon library, and base color must match.

## Component hierarchy

### 1. Tokens

Semantic tokens describe purpose, not a literal color:

```text
background / foreground
surface / surface-foreground
primary / primary-foreground
secondary / secondary-foreground
muted / muted-foreground
accent / accent-foreground
success / warning / destructive / information
border / input / ring
booking state tokens
payment state tokens
attendance state tokens
```

Booking, payment, verification, and attendance remain visually independent.
For example, “booking confirmed” cannot imply “fully paid” through one green
badge.

Hard-coded page colors, arbitrary radius values, and one-off shadows are
prohibited where a semantic token exists.

### 2. shadcn primitives

Install only components needed by approved screens. Likely early primitives:

```text
Button, Input, Label, Field, Textarea, Checkbox, Radio Group
Select/Combobox, Dialog/Alert Dialog, Sheet/Drawer, Popover
Dropdown Menu, Tabs, Tooltip, Badge, Card, Table, Pagination
Calendar/Date Picker, Skeleton, Spinner, Alert, Empty, Toast
Sidebar, Breadcrumb, Separator
```

The CLI output is reviewed before merge. Direct modifications remain small and
intentional; reusable behavior belongs in composition layers.

### 3. Product components

Product components encode recurring presentation behavior, not server truth:

| Component family | Responsibility |
|---|---|
| `MoneyDisplay` / `MoneyInput` | BDT formatting and exact input behavior |
| `BangladeshPhoneInput` | Display/input normalization guidance without claiming verification |
| `BookingStateBadge` | Commitment state only |
| `PaymentSummary` | Paid/due/refunded/verification states |
| `AttendanceBadge` | Scheduled/checked-in/completed/no-show state |
| `SlotPicker` | Available/held/unavailable selection and keyboard behavior |
| `BookingSummary` | Stable price, contact, policy, resource, and time review |
| `OperationalDataTable` | Responsive sort/filter/action patterns |
| `ConflictNotice` | Clear stale/conflict recovery actions |
| `PermissionNotice` | Explain unavailable action without exposing sensitive policy |
| `AsyncState` | Loading, empty, error, stale, offline, and retry presentation |

Components never calculate authoritative availability, price, permission, or
financial totals.

### 4. Feature and route composition

Features own API use, workflow state, and route-specific composition. They
reuse product components and do not fork primitive styling for convenience.

## Responsive strategy

- Design core workflows mobile-first from 320 CSS px.
- Today and public booking keep primary actions reachable without hover.
- Dense tables switch to selected responsive row/card or horizontal strategies;
  important fields are never silently removed.
- Dialogs may become sheets/drawers on small screens only when focus,
  navigation, and action placement remain equivalent.
- Touch targets, virtual keyboards, sticky actions, and low-bandwidth loading
  are tested on real mobile dimensions.

## Forms and feedback

- Every field has a programmatic label and associated description/error.
- Required/optional meaning is explicit.
- Server conflict, validation, permission, provider, and unknown errors have
  different user recovery.
- A submit button loading state does not erase the submitted values.
- Destructive actions use confirmation proportional to reversibility.
- Toasts supplement visible page state; they are not the only evidence of a
  booking or payment result.
- API/domain error codes map to centralized presentation messages.

## Localization

- User-facing copy is not embedded inside low-level primitives.
- Layouts allow longer Bangla and English strings.
- Date, time, number, and BDT formatting use locale-aware application helpers.
- Icons do not replace necessary text.
- Physical left/right meaning is avoided where start/end is intended.
- Bangla font and rendering checks enter the browser matrix before a Bangla
  release, even if English ships first.

## Accessibility and quality gates

Every shared interactive component requires:

1. semantic/accessible name and description behavior;
2. keyboard interaction and visible focus;
3. light-theme contrast validation;
4. reduced-motion behavior where animated;
5. narrow/mobile rendering;
6. loading, empty, disabled, invalid, and error examples;
7. automated component/accessibility tests where useful;
8. inclusion in a real workflow E2E test.

Core flows additionally receive manual keyboard and screen-reader walkthroughs.
The primitive library reduces implementation risk but never replaces these
tests.

## Performance rules

- Prefer server-rendered/static markup until client interaction is required.
- A shadcn component becomes a client component only when its behavior needs
  it.
- Install components individually; do not import an entire registry.
- Avoid unnecessary animation and large icon/chart packages.
- Virtualize only measured long lists; ordinary tables retain simpler,
  accessible markup.
- Loading skeletons reflect stable layout and do not conceal prolonged failure.

## Governance

- No competing general-purpose UI library without an ADR.
- No unreviewed third-party shadcn registry in production code.
- Upstream component refreshes are deliberate code reviews with interaction and
  visual regression tests.
- Shared primitives stay domain-neutral.
- Product components may know display vocabulary but cannot authorize or own
  business invariants.
- Design tokens and interaction decisions are documented alongside the
  component, not reconstructed from scattered pages.

## Phase 4 frontend foundation gate

Before feature implementation:

- initialize shadcn consistently in `apps/web` and `packages/ui`;
- commit the token theme and component aliases;
- prove one form, dialog, popover/select, table, mobile sheet, toast, and
  accessible error summary;
- prove product state badges can represent independent booking/payment/
  attendance combinations;
- run keyboard, automated accessibility, responsive, and bundle checks;
- document the component-add/update workflow.

Passing this thin vertical UI foundation is preferable to installing every
component before a real screen needs it.
