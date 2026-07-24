# Identity, Onboarding, and Venue Setup Workflows

Status: Approved behavioral baseline

## WF-IAM-001: Register owner and create business

Priority: P0
Primary actor: Business Owner
Scenarios: SUB-001, CFG-001, NFR-004

### Preconditions

- Phone number is not actively rate-limited.
- No authenticated session is required.

### Main path

1. Owner enters Bangladesh phone number.
2. System normalizes the number and sends an expiring OTP.
3. Owner submits valid OTP.
4. System creates or authenticates the global User.
5. Owner enters name, business name, and first venue basics.
6. System creates Business, primary-owner membership, Subscription/Pilot
   relationship, and first Venue in Draft.
7. Owner enters the setup checklist.

### Exceptions

- Invalid/expired OTP: no tenant is created; retry guidance and rate limits
  apply.
- Existing user: reuse global identity; create new business relationship only
  after explicit confirmation.
- Duplicate business name: allowed with warning; names are not global identity.
- Interrupted setup: save created draft and resume safely.

### Postconditions

- Exactly one primary owner exists.
- Business and venue have BDT and `Asia/Dhaka` defaults.
- No public booking is available.
- Creation is audited.

## WF-IAM-002: Invite and activate employee

Priority: P0
Primary actor: Business Owner
Supporting actor: Invited employee
Scenarios: CFG-008, AUTH-007, AUTH-008

### Main path

1. Owner enters phone/email.
2. Owner selects curated Access Profile and Venue Scope.
3. System shows effective access summary.
4. Owner sends expiring invitation.
5. Recipient verifies identity and accepts.
6. System creates active Business Membership with selected profile/scope.
7. Both creation and acceptance are audited.

### Exceptions

- Existing membership: show current access and offer authorized edit.
- Expired/revoked invitation: cannot accept.
- Owner attempts to grant access outside own authority: deny.
- Owner removes employee: revoke sessions/access without deleting historical
  actor references.
- Attempt to remove last primary owner: deny until ownership transfer.

## WF-CFG-001: Configure first venue for internal booking

Priority: P0
Primary actor: Business Owner or authorized Manager
Scenarios: CFG-002 through CFG-008, CFG-012

### Main path

1. Complete venue contact, address, hours, and operational cutoff.
2. Select/create Activity.
3. Create independent Resource.
4. Create Offering linking Resource and Activity.
5. Configure fixed-slot duration and recurring availability.
6. Configure default and recurring day/time price.
7. Configure optional specific-date override.
8. Configure confirmation, advance, cancellation, and rescheduling policy.
9. Add amenities and optional add-ons.
10. Preview generated internal slots and prices.
11. Create a test/internal booking or mark setup section complete.

### Validation

- Slot is inside effective venue/resource schedule.
- Resource and Offering belong to same venue/tenant.
- One time period cannot resolve ambiguous equal-priority price rules.
- Money and percentage inputs satisfy exact configured bounds.
- Resource deactivation with future bookings requires resolution.

### Postconditions

- Authorized staff can create internal bookings.
- Public page remains Draft until WF-CFG-002.
- Configuration changes are audited/versioned where commercial history needs it.

## WF-CFG-002: Preview and publish public booking

Priority: P0
Primary actor: Business Owner
Scenarios: CFG-009, CFG-010, SUB-002

### Main path

1. Owner opens publish readiness.
2. System checks venue contact, published resources/offerings, schedules, prices,
   confirmation/payment policy, and cancellation terms.
3. Owner reviews customer preview.
4. Owner explicitly publishes.
5. System exposes only active published venue/resource/offering information.
6. Publication is audited.

### Exceptions

- Missing requirement: publication is blocked with direct link to correction.
- Subscription/entitlement does not permit publication: show status and allowed
  recovery.
- Resource becomes inactive later: remove future public availability without
  altering historical bookings.
- Unpublish: prevent new public checkout while preserving staff operation and
  existing customer links.

