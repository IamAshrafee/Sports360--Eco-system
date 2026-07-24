# V-06: Future Multi-Venue Operator

Status: Synthetic architecture-pressure archetype
Purpose: Preserve multi-venue growth without expanding private-pilot UI

## Business profile

**Synthetic name:** MetroSports Group
**Business shape:** One tenant, two venues
**Pilot availability:** Only Venue A is active for ordinary pilot workflows
**Future pressure:** Venue B tests domain, authorization, entitlement, and report seams

This archetype is not a promise to deliver multi-venue operations in the pilot.
It verifies that foundational records and permissions do not assume one venue
forever.

## Venue A: Uttara Sports Hub

- Two football turfs
- Three badminton courts
- Active in simulated pilot
- Local manager and booking staff

## Venue B: Mirpur Court House

- Four badminton courts
- Configuration exists in architecture fixtures
- Inactive or entitlement-restricted during pilot
- Must not leak into Venue A staff access

## People and scope

| Person | Access |
|---|---|
| Group Owner | All venues |
| Group Finance | Financial reports across business |
| Uttara Manager | Venue A only |
| Uttara Booking Staff | Venue A only |
| Mirpur Manager | Venue B only |
| Platform Administrator | Tenant administration under platform policy |
| Shared customer | Separate tenant-local relationship, bookings at both venues later |

## Architecture-pressure rules

- Every booking, payment, resource, block, shift, expense, and report record has
  tenant and venue context.
- Access Profile and Venue Scope are separate.
- Venue A staff cannot search Venue B bookings or customers.
- Group Finance can view authorized money without managing schedules.
- Business-wide defaults may later be overridden per venue.
- Subscription entitlement determines number of active venues.
- Downgrade never deletes Venue B history.
- Aggregated owner reporting must drill into venue-level records.

## Synthetic future workflow

```text
Owner upgrades entitlement
→ Activates Venue B
→ Assigns Mirpur Manager
→ Copies selected business defaults
→ Configures resources/prices
→ Publishes Venue B
→ Owner and Finance see consolidated reporting
```

This workflow is future-only; pilot tests foundation and denial behavior.

## Required pilot-safe tests

- Venue A user cannot access Venue B by guessed identifier.
- Business Owner can see tenant configuration and inactive venue metadata.
- Platform entitlement prevents activating another venue.
- Inactive venue records remain intact.
- Group-level customer concept does not reveal data across different businesses.
- Report queries always apply tenant and allowed-venue scope.
- Audit identifies venue context.

## Required scenario groups

- AUTH-001 through AUTH-012
- SUB-001 through SUB-009
- RPT-001 through RPT-012
- NFR-001 through NFR-012

## Known future pressures

- Venue-template copying
- Regional manager role
- Business-wide customers and memberships
- Inter-venue resource alternatives
- Consolidated cash/settlement
- Custom roles and approval thresholds
- Multiple currencies/timezones only in later international expansion

## MVP seam

Implement:

- Tenant and Venue as distinct concepts
- Scoped memberships
- Venue foreign keys/context where operationally required
- Central entitlements
- Venue-aware audit and reporting

Do not implement:

- Full multi-venue navigation
- Cross-venue booking
- Venue transfer
- Regional hierarchy
- Consolidated multi-venue dashboard beyond architecture tests

## Success condition

The single-active-venue pilot remains simple while automated authorization and
data tests prove that adding another venue will not require redefining tenant,
role, booking, payment, or report ownership.
