# Domain State Machines

Status: Phase 3 behavioral state baseline

## State-model rule

The system does not use one universal booking status. Commitment, capacity,
attendance, payment verification, financial balance, subscription, and
notification delivery are independent state dimensions.

## Booking commitment

```mermaid
stateDiagram-v2
    [*] --> Pending: requirement not yet met
    [*] --> Confirmed: no pending requirement / requirement met
    Pending --> Confirmed: confirmation requirement succeeds
    Pending --> Expired: deadline passes
    Pending --> CancelledCustomer: customer/staff cancellation
    Pending --> CancelledVenue: venue cancellation
    Confirmed --> CancelledCustomer: permitted customer/staff cancellation
    Confirmed --> CancelledVenue: venue cancellation
    Confirmed --> Confirmed: reschedule / reassign / extend revision
    Expired --> [*]
    CancelledCustomer --> [*]
    CancelledVenue --> [*]
```

Rules:

- completion and no-show do not change commitment state;
- cancellation does not itself imply refund, forfeiture, or zero due;
- a late payment after expiry follows an explicit resolution, never silently
  reactivates the expired booking;
- reschedule/reassignment/extension creates a revision while commitment may
  remain Confirmed or Pending according to explicit policy consequences.

## Checkout session and capacity claim

```mermaid
stateDiagram-v2
    state Checkout {
        [*] --> Active
        Active --> Completed: booking commits
        Active --> Expired: deadline wins
        Active --> Abandoned: explicit release
        Completed --> [*]
        Expired --> [*]
        Abandoned --> [*]
    }

    state CapacityClaim {
        [*] --> ActiveHold
        ActiveHold --> ActiveBooking: transfer owner atomically
        ActiveHold --> ReleasedExpired: expiry
        ActiveHold --> ReleasedAbandoned: abandon
        ActiveBooking --> ReleasedCancelled: cancellation
        ActiveBooking --> ActiveBooking: reschedule / reassign / extend
        ReleasedExpired --> [*]
        ReleasedAbandoned --> [*]
        ReleasedCancelled --> [*]
    }
```

The claim remains active during hold-to-booking transfer. There is no moment
when another transaction can acquire the interval.

## Attendance

```mermaid
stateDiagram-v2
    [*] --> NotStarted
    NotStarted --> CheckedIn: arrival recorded
    NotStarted --> InProgress: authorized direct start
    CheckedIn --> InProgress: session starts
    CheckedIn --> Completed: short/direct completion
    InProgress --> Completed: session finishes
    NotStarted --> NoShow: grace/policy permits
    CheckedIn --> NoShow: correct mistaken check-in with permission and audit
    Completed --> [*]
    NoShow --> [*]
```

Late is derived attention from scheduled start, grace, and absence of check-in;
it is not a terminal attendance state. Correcting completed/no-show history is a
sensitive audited correction, not a normal transition.

## Manual mobile-payment attempt

```mermaid
stateDiagram-v2
    [*] --> Submitted
    Submitted --> VerificationPending: manual MFS requires review
    Submitted --> Succeeded: method succeeds immediately
    Submitted --> Failed: validation/provider failure
    VerificationPending --> Succeeded: authorized verification
    VerificationPending --> Rejected: mismatch/duplicate/invalid evidence
    VerificationPending --> Expired: review window ends where configured
    Succeeded --> [*]
    Failed --> [*]
    Rejected --> [*]
    Expired --> [*]
```

A successful attempt creates one append-only payment transaction. Later
reversal or refund creates a new linked transaction; it does not move the
original attempt backward.

## Derived booking balance

```text
net paid =
  successful allocated collections
  - linked reversals
  - linked refunds

due = max(booking total - net paid, 0)
credit/overpayment = max(net paid - booking total, 0)
```

User-facing balance labels are derived:

```text
UNPAID | PARTIALLY_PAID | PAID | OVERPAID | REFUNDED_PARTIAL | REFUNDED_FULL
```

These labels are projections, not authoritative mutable states.

## Resource block

```mermaid
stateDiagram-v2
    [*] --> Active
    Active --> Active: edit reason/end with conflict re-evaluation
    Active --> Resolved: resource available again
    Resolved --> [*]
```

An active urgent block can have:

```text
0..n affected booking resolutions:
UNRESOLVED | REASSIGNED | VENUE_CANCELLED | KEPT_WITH_EXCEPTION
```

The block can be active before all resolutions complete.

## Business membership and invitation

```mermaid
stateDiagram-v2
    state Invitation {
        [*] --> Pending
        Pending --> Accepted
        Pending --> Expired
        Pending --> Revoked
        Accepted --> [*]
        Expired --> [*]
        Revoked --> [*]
    }

    state Membership {
        [*] --> Active
        Active --> Suspended
        Suspended --> Active
        Active --> Removed
        Suspended --> Removed
        Removed --> [*]
    }
```

Profile and venue-scope changes are versioned access changes while membership
is Active. They are not separate membership states.

## Subscription

```mermaid
stateDiagram-v2
    [*] --> Pilot
    Pilot --> Active: paid/approved plan begins
    Pilot --> Expired: pilot ends without continuation
    Active --> PastDue: payment deadline missed
    PastDue --> Active: payment verified
    PastDue --> Grace: grace policy begins
    Grace --> Active: payment verified
    Grace --> Restricted: grace expires
    Restricted --> Active: reactivated
    Restricted --> Suspended: administrative/safety escalation
    Suspended --> Active: authorized restoration
    Active --> Cancelled: owner cancellation at effective date
    Expired --> [*]
    Cancelled --> [*]
```

Data remains intact through PastDue, Grace, Restricted, and Suspended. Each
state maps to an entitlement policy; UI banners do not enforce it.

## Notification

```mermaid
stateDiagram-v2
    [*] --> Scheduled
    [*] --> Ready
    Scheduled --> Suppressed: source no longer eligible
    Scheduled --> Ready: scheduled time reached and eligible
    Ready --> Processing: worker claims attempt
    Processing --> Accepted: provider/in-app accepts
    Processing --> RetryScheduled: retryable failure
    RetryScheduled --> Processing
    Processing --> FailedPermanent: terminal failure
    Accepted --> Delivered: provider evidence where available
    Accepted --> [*]: delivery evidence unavailable
    Delivered --> [*]
    Suppressed --> [*]
    FailedPermanent --> [*]
```

`Accepted` is not displayed as `Delivered` without evidence. Each attempt is
append-only; retry updates the logical notification through a new attempt.

## Integration installation

```mermaid
stateDiagram-v2
    [*] --> PendingVerification
    PendingVerification --> Active
    PendingVerification --> Revoked
    Active --> Suspended: abuse/security/owner action
    Suspended --> Active: authorized restoration
    Active --> Revoked
    Suspended --> Revoked
    Revoked --> [*]
```

Credential rotation does not create a new installation; old credentials stop
working after the defined overlap/revocation point.

## Transition implementation rules

Every command:

1. authorizes actor/client and venue scope;
2. loads the current aggregate version;
3. validates the transition and domain preconditions;
4. commits state, audit, idempotency result, and outbox atomically where
   applicable;
5. returns the resulting independent state dimensions;
6. treats duplicate equivalent command as the same logical result.

The database uses check constraints/enums/reference tables where they improve
validity, but domain transition code remains the readable authority for why a
transition is allowed.
