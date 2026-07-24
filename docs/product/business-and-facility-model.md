# Business and Facility Model

Status: Confirmed

## Core hierarchy

```text
Platform
└── Business
    └── Venue
        └── Resource
            └── Offering
                └── Booking
```

## Business

A Business is the SaaS tenant and subscription customer. It owns:

- Branding and business-wide settings
- Venue locations
- Employees and access
- Customers
- Reports
- Subscription and billing relationship

Tenant data must remain isolated from every other business.

## Venue

A Venue is one physical location. The interface may use “Venue” or “Branch”
based on user understanding.

A venue contains:

- Address, map location, and contacts
- Opening hours and operational-day configuration
- Resources and offerings
- Amenities
- Assigned staff
- Venue-specific policies

Every business has at least one venue internally. Single-venue businesses
should not see unnecessary branch-selection complexity.

## Activity

An Activity is what the customer intends to do:

- Football or futsal
- Cricket
- Badminton
- Table tennis
- Basketball
- Volleyball
- Swimming
- Coaching or training
- Private event

The platform supplies a standard catalogue and businesses may create custom
activities. “Activity” is broader than “Sport.”

## Resource

A Resource is a physical space or asset whose time must be reserved:

- Football turf
- Badminton court
- Cricket net
- Table-tennis table
- Swimming lane
- Training room
- Entire ground or stadium

Each resource belongs to one venue and may define:

- Name and type
- Description and photos
- Capacity
- Indoor/outdoor classification
- Supported activities
- Availability schedule
- Active/inactive state
- Resource blocks
- Amenities

The interface can display field, pitch, court, table, lane, or room while the
domain uses Resource consistently.

## Offering

An Offering defines how a resource is sold for an activity.

Example:

```text
Resource: Main Football Turf
├── 5-a-side football, 60 minutes
├── 7-a-side football, 90 minutes
├── Coaching session, 120 minutes
└── Corporate event, custom duration later
```

An offering may define:

- Activity
- Duration rules
- Default price
- Advance requirement
- Confirmation mode
- Cancellation policy
- Booking window
- Available channels
- Included services

This keeps commercial rules separate from the physical resource.

## Amenities

Amenities describe the venue or resource but do not normally reserve capacity:

- Parking
- Washroom
- Changing room
- Drinking water
- Gallery
- Air conditioning
- Floodlights

## Add-ons

Add-ons are selectable products or services:

- Ball or racket rental
- Jersey or bib set
- Referee
- Coach
- Extra lighting
- Locker
- Refreshments

Add-ons may be free, paid, optional, or required. Inventory-aware add-ons are
deferred.

## Availability

Availability is calculated:

```text
Operating schedule
+ Resource schedule
+ Offering rules
- Existing reservations and holds
- Resource blocks and closures
= Available booking times
```

Available slots are generally generated rather than stored permanently.

### Fixed-slot mode

The venue defines exact start/end options. This is the private-pilot mode.

### Flexible-duration mode

The customer selects a start time and permitted duration. This is deferred until
fixed-slot operations are stable.

## Schedule inheritance

```text
Venue schedule
└── Resource override
    └── Offering restrictions
```

Lower-level configuration is required only when it differs from the parent.

## Blocks and closures

Temporary unavailability is represented as a time-based block, not permanent
resource deactivation.

Block examples:

- Maintenance
- Weather
- Cleaning
- Private use
- Event preparation
- Management hold
- Emergency closure

Saving a block that affects existing bookings must show those bookings and
require explicit resolution.

## Divisible and combined resources

Future examples:

```text
Full Field
├── Half A
└── Half B
```

A full-field reservation blocks both halves; a half reservation blocks the
full-field option but may leave the other half available.

The data model should permit future resource relationships and conflict groups,
but the private pilot supports independent resources only.

## Initial booking rule

> Every private-pilot booking reserves one offering on one primary independent
> resource.

Composite, recurring, and tournament reservations build on this foundation
later.

