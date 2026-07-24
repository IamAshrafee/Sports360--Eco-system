# Future Product Blueprint

Status: Directional, not implementation commitment

## Why this exists

The private-pilot MVP is deliberately small, but the product vision is not. A
simple “Later” label is insufficient because engineering decisions made today
can either preserve or block important future capabilities.

This blueprint records what later capabilities are intended to accomplish,
their likely workflows and rules, and which MVP seams should remain open. It
does not assign dates or promise that every idea will survive validation.

## Three levels of specification

### Level 1: Product direction

Explains why a capability may belong in the product and which product horizon
it supports. Every future capability receives this level.

### Level 2: Capability brief

Describes:

- Problem and value
- Actors
- Representative workflows
- Core business rules
- Dependencies
- Data/domain implications
- Required MVP seam
- Validation and promotion trigger

The documents in this directory are Level 2.

### Level 3: Delivery specification

Includes detailed user stories, acceptance criteria, screens, state machines,
API/data design, failure behavior, security, and rollout.

Level 3 is written shortly before implementation, after validation. Writing it
for every long-term idea now would create false certainty and maintenance work.

## Product horizons

| Horizon | Purpose | Commitment |
|---|---|---|
| H0: Private Pilot | Prove one venue can operate from one source of truth | Confirmed scope |
| H1: Commercial Core | Make onboarding, payment, support, and multi-venue use repeatable | Directional; validation-led |
| H2: Venue Growth Platform | Help venues retain customers, sell new products, and manage deeper operations | Capability blueprint |
| H3: Ecosystem and Enterprise | Connect venues, players, partners, devices, and international operations | Long-term option |

Horizons are outcome bands, not release dates. A validated H2 capability may
move earlier; an unvalidated H1 capability may move later.

## Capability map

| ID | Capability group | Likely horizon | Brief |
|---|---|---|---|
| FC-100 | Flexible, recurring, composite, waiting-list, and offline booking | H2–H3 | [Advanced booking and capacity](advanced-booking-and-capacity.md) |
| FC-200 | Memberships, packages, loyalty, credit, teams, and player community | H2–H3 | [Memberships, teams, and community](memberships-teams-and-community.md) |
| FC-300 | Tournaments, leagues, classes, academies, and private events | H2 | [Tournaments, academies, and events](tournaments-academies-and-events.md) |
| FC-400 | Gateway automation, campaigns, marketplace, payouts, and accounting connections | H1–H3 | [Commerce, marketplace, and finance](commerce-marketplace-and-finance.md) |
| FC-500 | Workforce, inventory, maintenance, incidents, and facility automation | H2–H3 | [Workforce, equipment, and facility operations](workforce-equipment-and-facility-operations.md) |
| FC-600 | Chains, enterprise access, white label, integrations, and internationalization | H1–H3 | [Platform, enterprise, and international expansion](platform-enterprise-and-international.md) |
| FC-700 | Advanced reports, forecasting, pricing automation, and anomaly detection | H2–H3 | [Analytics, automation, and intelligence](analytics-automation-and-intelligence.md) |

## Rules for future capabilities

1. A future capability does not enter the MVP because it has been documented.
2. MVP domain design should preserve an explicit seam, not implement unused
   complexity.
3. Promotion requires evidence, dependencies, product impact, and revised
   acceptance criteria.
4. Capabilities that introduce regulated money, sensitive data, automated
   decisions, or physical safety require professional review.
5. The feature catalogue remains the release-scope source; this directory
   explains future intent.

## Promotion process

```text
Future direction
→ Evidence from customers/pilot
→ Horizon and priority review
→ Decision-log entry
→ Level-3 specification
→ Architecture review
→ Delivery backlog
```

