# Synthetic Venue Simulations

Status: Active Phase 1 work

## Purpose

These fictional venue businesses provide consistent, realistic pressure on the
product model without pretending to be interviewed customers.

They are used for:

- Product workflow design
- Acceptance criteria
- Seed and demo data
- Permission and tenant-isolation tests
- Booking conflict and payment simulations
- Report reconciliation
- Mobile and Today-workspace walkthroughs
- Architecture boundary checks

## Evidence status

Every venue, person, price, volume, and transaction in this directory is
synthetic unless a source is explicitly cited.

The archetypes test internal completeness. They do not validate:

- Market size
- Actual venue behavior
- Willingness to pay
- Staff usability
- Legal or accounting compliance

## Archetypes

| ID | Archetype | Primary pressure |
|---|---|---|
| V-01 | [Single High-Volume Football Turf](v01-single-football-turf.md) | Fast team bookings and peak pricing |
| V-02 | [Multi-Court Badminton Venue](v02-multi-court-badminton.md) | Parallel resources, walk-ins, equipment |
| V-03 | [Mixed-Sport Complex](v03-mixed-sport-complex.md) | Several activities, roles, and operational breadth |
| V-04 | [Cricket Practice Facility](v04-cricket-practice-facility.md) | Coaching pressure and future flexible duration |
| V-05 | [Late-Night Urban Venue](v05-late-night-urban-venue.md) | Midnight boundaries, shifts, and reconciliation |
| V-06 | [Future Multi-Venue Operator](v06-future-multi-venue-operator.md) | Multi-venue architecture without pilot UI expansion |

## Shared simulation rules

- Currency: BDT
- Default timezone: `Asia/Dhaka`
- Prices are fictional test values, not market recommendations.
- Phone numbers use reserved-looking synthetic patterns and must never target
  real people.
- Financial amounts use exact arithmetic.
- Booking intervals use `[start, end)`.
- Historical records are not silently deleted or rewritten.
- Every operational record belongs to a tenant and venue.
- Every sensitive action has an actor and audit result.
- The pilot supports independent resources and fixed slots only.
- Future pressure is documented but not implemented in pilot scenarios.

## Shared actors

Each archetype may instantiate:

- Business Owner
- Manager
- Booking Staff
- Finance/Reports user
- Guest customer
- Registered player
- Team/organization contact
- Platform Administrator

The same global user may hold different relationships, but tenant data remains
isolated.

## Scenario catalogue

The [MVP Scenario Catalogue](mvp-scenario-catalogue.md) defines the normal,
exceptional, authorization, financial, reporting, and reliability behaviors
that these archetypes must exercise.

## Promotion into engineering

When implementation begins:

1. Convert archetype configuration into deterministic seed fixtures.
2. Convert P0/P1 scenarios into acceptance and automated tests.
3. Preserve expected financial/report totals in fixture assertions.
4. Keep future-only pressures as architecture tests or documented constraints,
   not unused production functionality.

