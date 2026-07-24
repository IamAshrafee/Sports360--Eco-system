# Assumptions and Validation

Product decisions are approved directions. Market and behavior claims remain
assumptions until evidence supports them.

## Validation states

| State | Meaning |
|---|---|
| Untested | No meaningful evidence |
| Desk-supported | Repeated public examples or third-party observations |
| Interview-supported | Repeated interview evidence |
| Behavior-supported | Observed real usage |
| Validated | Sufficient evidence for the current decision |
| Rejected | Evidence contradicts the assumption |

## Assumption register

| ID | Assumption | Current state | Validation method | Decision affected |
|---|---|---|---|---|
| A-001 | Owners experience meaningful pain from fragmented manual booking. | Desk-supported | Public claims/reviews, then organic usage | Product promise |
| A-002 | Phone, message, and walk-in bookings remain important. | Desk-supported | Public booking instructions, then organic channel telemetry | Unified calendar |
| A-003 | One-location venues with several resources are willing to pay. | Untested | Organic trial-to-paid and renewal behavior | ICP/pricing |
| A-004 | Staff can adopt a mobile-responsive web app during busy periods. | Untested | Scripted walkthroughs, then organic completion/error telemetry | Today UX |
| A-005 | Fixed slots cover the majority of initial venues. | Untested | Public schedule/rate samples and organic configuration | Booking scope |
| A-006 | Cash plus manual bKash/Nagad is sufficient for initial operation. | Desk-supported | Public payment instructions and organic method usage | Payment scope |
| A-007 | Owners value remote visibility enough to change behavior. | Untested | Organic owner-dashboard use and retention | Reporting |
| A-008 | Venue owners prefer predictable subscription pricing over per-booking fees. | Untested | Transparent pricing experiment and paid behavior | SaaS model |
| A-009 | English is sufficient for initial users. | Untested | Organic completion, language requests, and feedback | Localization |
| A-010 | A booking usually needs one responsible contact, not registered participants. | Untested | Public flows and organic booking behavior | Customer scope |
| A-011 | Users will make the product their primary booking calendar. | Untested | Organic repeat use and booking completeness where observable | Product success |
| A-012 | Self-service onboarding and asynchronous support are workable for one founder. | Untested | Internal simulation and organic support volume | Pilot operation |
| A-013 | One active venue is sufficient for the first organic beta. | Untested | Organic account configuration and requests | Pilot scope |
| A-014 | Businesses can obtain merchant arrangements for future gateway use. | Untested | Provider research and organic merchant onboarding | Online payment |
| A-015 | Basic operational reporting is more valuable initially than advanced accounting. | Untested | Organic report usage and feature requests | MVP reports |

## Desk-evidence update: 2026-07-24

- EV-001 through EV-005 show direct public examples of time-band prices,
  fixed-duration products, advance/full-payment choices, WhatsApp fallback,
  cancellation windows, after-midnight slots, field-size options, and
  multi-location structure.
- EV-006 through EV-010 show that Bangladesh-facing products repeatedly claim
  multi-channel booking, OTP/holds, partial/manual payments, dues, blocks,
  reports, owner dashboards, and marketplace separation.
- A-001, A-002, and A-006 are therefore Desk-supported.
- A-005 remains Untested because a few fixed-slot examples do not prove that
  fixed slots cover the majority of the intended segment.
- A-008 remains Untested because public competitor pricing is inconsistent and
  cannot prove customer preference.
- A-009 remains Untested; bilingual/localized competitor interfaces indicate
  relevance but not required launch coverage.
- A-015 remains Untested because competitor emphasis proves category relevance,
  not that reporting outranks accounting for buyers.

See [Public Evidence Register](../research/public-evidence-register.md).

## Evidence collection rules

- Record source and access date for public examples.
- Separate observed fact, vendor/customer claim, and our inference.
- Separate owner, manager, staff, and player perspectives.
- Prefer organic behavior over public claims when it becomes available.
- Record contradictory evidence.
- Do not mark a market assumption validated through simulation alone.
- Update affected decisions when evidence is strong enough.

## Organic beta measurements

Where privacy and product policy permit, measure:

- Bookings by channel
- Time to create a standard booking
- Conflict/double-book incidents
- Payment reconciliation differences
- Number of manual support interventions
- Owner/manager dashboard use
- Staff use by shift/day
- Cancellations, no-shows, and unverified payments
- Optional in-product feedback
- Return use, trial continuation, and paid behavior

## Validation review cadence

- Review research after every competitor/public-evidence batch.
- Review scenario coverage during detailed specification and simulation.
- Review behavior periodically after organic beta opens.
- Do not add a feature merely because one organic user requests it; determine
  whether it reflects a repeatable segment need.
