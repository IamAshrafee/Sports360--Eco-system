# Product Vision

Status: Confirmed
Initial market: Bangladesh
Product type: Multi-tenant B2B SaaS with customer-facing booking

## Vision

Build the operating system for sports-venue businesses: one dependable place
for resources, schedules, bookings, customers, payments, daily operations, and
owner decision-making.

The product is broader than a turf marketplace. Online booking is one connected
module inside a business management system used throughout the working day.

## Product statement

> A SaaS platform for Bangladeshi sports-venue businesses to manage facilities,
> schedules, bookings, customers, payments, staff, and business performance
> while allowing players and teams to reserve available playing time easily.

## Initial product promise

> No booking should be lost, forgotten, or double-booked; staff should know what
> is happening today; and the owner should know what was booked, collected,
> refunded, discounted, and left due.

## Primary customer

The primary paying customer is the venue business. The primary beneficiary is
the owner, while managers and booking staff are the daily operators. Players,
team organizers, and other bookers are customer-side users.

## Strategic position

- Bangladesh-first, international-ready.
- Subscription SaaS before marketplace commission.
- Venue revenue belongs directly to the venue in the initial model.
- Staff-assisted and online bookings use the same source of availability.
- One product should support turfs, courts, pitches, tables, lanes, rooms, and
  other reservable sports spaces.
- The interface should use familiar venue terminology while the domain model
  uses consistent internal concepts.

## Problems being solved

Venue businesses commonly need to coordinate bookings received through calls,
messages, walk-ins, and online channels. Manual coordination can lead to:

- Lost or duplicated bookings
- Unreliable availability
- Weak advance-payment control
- Confusing payment screenshots and transaction references
- Unrecorded discounts, refunds, or dues
- Poor visibility when the owner is away
- Time-consuming daily reconciliation
- Scattered customer history
- Dependence on individual employees or notebooks

Players and team organizers may face:

- Repeated calls or messages to discover availability
- Delayed confirmation
- Unclear prices and policies
- Uncertainty about whether a slot is secured
- No dependable booking or payment history

## Value delivered

The business is buying:

- Booking control
- Protection against preventable revenue leakage
- Faster reception operations
- Remote owner visibility
- Easier payment and due tracking
- More dependable customer service
- Actionable resource and revenue reporting

## Product boundaries

The first product is not:

- A full accounting system
- Payroll or human-resources software
- A social network for players
- A tournament-management suite
- A white-label enterprise platform
- A general-purpose ERP

These areas may connect later, but must not dilute the initial operating
promise.

## Long-term direction

The architecture may eventually support:

- Multiple venues and chains
- Memberships, packages, loyalty, and venue credit
- Reusable teams and participant tools
- Tournaments, leagues, academies, and coaching
- Marketplace discovery and venue distribution
- Composite or divisible playing spaces
- Equipment inventory and maintenance planning
- Integrations, embedded booking, and APIs
- International currencies, languages, and regional policies

Long-term compatibility does not authorize those features for the private
pilot.

The intended value, workflows, rules, dependencies, and MVP design seams for
these areas are developed in the [Future Product Blueprint](../future/README.md).

## Product principles

1. The venue calendar is the operational source of truth.
2. A booking is never confirmed without server-side conflict protection.
3. Financial events are traceable and are not silently overwritten.
4. Registration is not required for every customer or participant.
5. Each venue business sees only its own customer relationship and data.
6. Default workflows are simple; advanced capability appears only when needed.
7. Reports use documented definitions and drill down to source records.
8. Subscription problems do not immediately destroy or hide operational data.
9. Real venue validation outranks attractive but untested feature ideas.

## Success definition

The product succeeds when venue staff use it as their primary booking record,
owners trust its operational and financial summaries, players receive reliable
confirmation, and pilot businesses demonstrate continued usage and credible
willingness to pay.
