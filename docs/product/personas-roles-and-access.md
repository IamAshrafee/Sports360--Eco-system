# Personas, Roles, and Access

Status: Confirmed

## Design principle

A job title is not automatically a software role.

The access model separates:

- **Person:** The global identity
- **Relationship:** Connection to a business or team
- **Access profile:** Permitted actions
- **Scope:** The venues or branches where access applies
- **Contextual responsibility:** Captain, coach, referee, or event organizer

One person may own one venue, work at another, and book as a player using the
same account.

## People groups

### Platform team

The initial platform role is **Platform Administrator**. Support, sales,
platform finance, and technical-administrator profiles can be separated later.

### Business team

Default access profiles:

| Profile | Purpose | Default scope |
|---|---|---|
| Business Owner | Ownership, configuration, oversight, subscription | Entire business |
| Manager | Daily operations and controlled administration | Assigned venues or business |
| Booking Staff | Reception, bookings, customers, collections | Assigned venues |
| Finance/Reports | Payments, refunds, expenses, exports | Assigned venues or business |

### Customer side

- Guest customer
- Registered customer/player
- Team or organization booking contact
- Team organizer, as a team-level responsibility

### Operational participants

Coaches, referees, instructors, maintenance workers, and equipment attendants
are assignments or job descriptions until their access needs justify a distinct
profile.

## Default business permissions

### Business Owner

Can:

- Configure business, venues, resources, schedules, and policies
- Invite, remove, and scope staff
- View all authorized bookings, customers, payments, and reports
- Approve sensitive adjustments
- Manage the SaaS subscription
- Transfer ownership

Each business has one primary owner. Multiple managers may have broad access
without becoming the legal or subscription owner.

### Manager

Can normally:

- Manage daily operations
- Configure assigned venues and resources
- Manage bookings and customers
- Record and review payments
- Apply permitted discounts or refunds
- View operational and branch reports
- Manage assigned employees where authorized

Cannot by default:

- Transfer ownership
- Delete the business
- Manage subscription ownership
- Access unassigned venues
- Perform unrestricted financial actions

### Booking Staff

Can normally:

- View the assigned venue calendar
- Create phone, message, walk-in, and direct bookings
- Search and create customers
- Record permitted payments
- Check in and complete sessions
- Reschedule or cancel within policy
- Send or share confirmations

Cannot by default:

- Change global pricing and policy
- Export customer lists
- Delete or reverse completed payments
- Issue unrestricted refunds
- Manage permissions
- View business-wide financial performance

### Finance/Reports

Can normally:

- Review payments, refunds, dues, expenses, and settlements
- Reconcile transaction summaries
- View and export authorized financial reports

Cannot by default manage resources, schedules, staff, or daily bookings.

## Scope model

Access is:

```text
Business relationship + Access profile + Venue scope
```

Examples:

- Manager of the Bashundhara venue
- Booking Staff at two Uttara venues
- Finance/Reports across the entire business
- Owner across all current and future venues

Venue names must not be encoded into role definitions.

## Permission model

Internally, access profiles map to actions:

```text
Bookings: view, create, edit, cancel
Payments: view, collect, reverse, refund
Customers: view, create, edit, restrict, merge, export
Resources: view, configure, block
Staff: view, invite, edit, remove
Reports: operational, financial, export
Settings: venue, business, subscription
```

Each permission also has a scope such as own, assigned venue, entire business,
or platform.

The private pilot exposes curated profiles, not a custom permission designer.

## Sensitive actions

These require explicit permission, reason, and audit history:

- Refund or payment reversal
- Large discount or complimentary booking
- Editing a completed booking
- Exporting customer or financial data
- Changing staff access
- Merging customer records
- Restricting a customer
- Transferring ownership
- Changing subscription information

A genuine scheduling collision is not an ordinary override. The system should
prevent impossible simultaneous use.

## Team responsibilities

Team Organizer and Co-organizer are scoped to one team. They are not venue
business roles. A person can organize one team and be an ordinary member of
another.

## Technical relationship model

```text
User
├── Business Membership
│   ├── Access Profile
│   └── Venue Assignments
├── Business Customer Relationships
└── Team Memberships
    └── Team Responsibility
```

A guest customer can exist without a User account and may be linked safely
after later verification.

## Deferred

- Custom access-profile builder
- Multi-stage approval chains
- Biometric attendance
- Payroll roles
- Shared manager PINs
- Automated employee performance scoring

