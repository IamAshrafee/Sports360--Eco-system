# Customers, Players, and Teams

Status: Confirmed

## Principle

One person may use one platform account, while every venue business owns and
sees only its private customer relationship with that person. Registration is
optional for booking.

## User account

The global identity may contain:

- Verified phone
- Optional email
- Name and profile
- Language
- Authentication and notification preferences

The same account may book at several businesses, join teams, and hold business
memberships without mixing tenant data.

## Business customer

A tenant-local customer record contains:

- Customer code and contact
- History with that business
- Payments and dues
- Cancellations and no-shows
- Tags and internal notes
- Memberships/packages later
- Business-level restriction

Business A cannot see activity, notes, or dues from Business B.

## Guest customers

Staff can create a guest with minimal contact information for phone, message,
and walk-in bookings. A guest may later link to a verified account through a
safe claim process.

Registration must not slow reception operations.

## Phone identity

Bangladesh numbers are accepted in familiar formats and normalized internally,
for example to `+8801712345678`.

A matching number may suggest an existing record but must not automatically
merge or expose history because numbers may be shared, mistyped, or reassigned.

Online guest booking may use:

```text
Enter name and phone
→ Verify OTP
→ Complete booking
→ Optionally finish account setup
```

## Roles inside a booking

These may differ:

- Booker
- Booking contact
- Customer responsible for the booking
- Team or organization
- Participants
- Payer or payers

The private pilot requires one responsible booking contact, not registration of
every participant.

## Individual and organization booking

Support:

- Individual
- Informal team
- School/university
- Company
- Academy
- Club or organization

The pilot records organization/team name, contact person, phone, and participant
count where relevant.

## Team model

Future reusable teams may have Organizer, Co-organizer, and Member
responsibilities. Those are scoped to the team, not the venue business.

Pilot team support is intentionally simple:

- Team name
- Organizer/contact
- Expected participants
- Booking history with the venue

Rosters, invitations, split payments, matchmaking, and public profiles are
deferred.

## Booking contact snapshot

Bookings preserve customer name, phone, team/organization name, and accepted
policy as used at booking time. The live profile may change without obscuring
historical records.

## Duplicate handling

Search normalized phone and other identifiers before creating a customer.
Potential duplicates are suggested within the business.

Authorized merge:

- Shows both records
- Preserves bookings and payments
- Resolves conflicting data explicitly
- Records the actor
- Supports administrative correction

Cross-business merging or disclosure is prohibited.

## Notes and tags

Internal notes are separate from customer-visible messages.

Example tags:

- Regular customer
- Corporate
- Academy
- Requires advance
- Payment follow-up
- Tournament organizer

Important restrictions rely on explicit status and rules, not only labels.

## Restrictions

Business-specific status:

```text
Active → Restricted → Blocked
```

Restriction conditions may require full advance, manager approval, debt
clearance, or staff-created booking.

Record reason, duration, actor, and audit history. A business restriction does
not create platform-wide punishment. Platform suspension is reserved for
platform abuse, security, or legal requirements.

## Transparent history

Show factual completed bookings, cancellations, no-shows, dues, refunds, and
last visit. Opaque automated risk scores are deferred.

## Membership-related concepts

Keep separate:

- Membership: time-based relationship and benefits
- Package: purchased usage entitlement
- Loyalty: earned reward
- Venue credit: money-like liability

These are deferred and must not be combined into one ambiguous balance.

## Communication and consent

Separate:

- Transactional booking messages
- Payment/refund messages
- Schedule changes
- Marketing

Marketing consent is not implied by receiving booking confirmations.

## Privacy and retention

- Collect necessary information only
- Isolate tenant data
- Mask contact data where roles do not need it
- Restrict and audit exports
- Protect internal notes
- Archive rather than casually delete history
- Support appropriate anonymization while retaining required financial/audit
  records

Bangladesh-specific privacy and retention policies require professional review
before launch.

## Private-pilot coverage

Included:

- Guest and optional registered customers
- Phone normalization and OTP
- Tenant-local profiles and returning-customer search
- Individual/team/organization booking
- History, notes, tags, duplicate warnings, restrictions

Deferred:

- Full rosters and invitations
- Matchmaking and player ratings
- Family accounts
- Marketing automation
- Loyalty, packages, memberships, wallets
- Cross-business reputation

