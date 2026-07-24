# Money, Time, Audit, Idempotency, and Outbox Design

Status: Phase 3 cross-cutting integrity baseline

## Money representation

### Storage

```text
amount_minor: bigint
currency_code: ISO 4217 code
```

For BDT, the configured exponent is two decimal places. Domain code uses
`bigint`/an exact Money value object. JSON APIs encode `amountMinor` as a
decimal string to avoid JavaScript’s safe-integer limit across current and
future clients:

```json
{
  "amountMinor": "150000",
  "currency": "BDT"
}
```

The UI formats this as `৳1,500.00` or a locale-appropriate representation.
Display formatting never becomes calculation input.

### Rates and percentages

Percentage/rate values use exact scaled integers or fixed decimal, never float.
The initial recommendation is parts-per-million for configuration:

```text
100% = 1,000,000 ppm
25% = 250,000 ppm
```

Rules:

- percentage advance is rounded up to the next minor unit so the configured
  minimum is actually met;
- percentage discount is rounded using the documented commercial rule (initial
  proposal: half-up at the affected line/booking calculation point);
- allocation remainders are assigned deterministically and recorded;
- snapshot includes rate, calculation basis, rounding mode, and result.

These rounding proposals become test vectors before payment implementation.

### Booking price snapshot

The booking stores immutable:

- currency;
- base line(s);
- add-on lines;
- discount lines and reason/actor;
- future service/tax lines when introduced;
- total;
- price-rule identifiers/version;
- calculation/rounding version.

Reports do not reconstruct old price from current configuration.

### Transaction sign convention

Financial transaction rows store a positive magnitude and an explicit type:

```text
COLLECTION
REVERSAL
REFUND
```

The ledger projection assigns direction. This avoids mixing negative input
conventions across clients.

```text
net collected =
  COLLECTION allocations
  - REVERSAL allocations
  - REFUND allocations
```

A transaction and all allocations use one currency. The MVP rejects
cross-currency allocation.

## Payment attempt versus transaction

```text
PaymentAttempt = effort/claim/provider interaction
PaymentTransaction = successful append-only financial fact
PaymentAllocation = exact application of that fact to a booking
```

Manual bKash/Nagad:

1. submission creates PaymentAttempt in verification-pending state;
2. verification may create one COLLECTION transaction;
3. rejection creates no COLLECTION;
4. correction appends REVERSAL/REFUND linked to the original transaction;
5. duplicate reference fingerprint and idempotency/provider identity prevent
   repeated collection.

The actual external refund may be manual in MVP. The system separately records
requested, externally executed/confirmed where applicable, and ledger-recorded
facts so “refund recorded” does not falsely claim provider settlement.

## Time model

### Exact instants

System events use PostgreSQL `timestamptz` and API RFC 3339 instants. The
database/session operates with UTC defaults; an instant is displayed using the
venue’s IANA timezone.

Examples:

```text
scheduled_start_at
scheduled_end_at
created_at
payment_occurred_at
payment_recorded_at
checked_in_at
```

Occurred time and recorded time are separate when staff may enter an event
later.

### Local scheduling rules

Weekly hours, local slot anchors, and local price windows are stored as local
date/time plus an effective IANA timezone context. They are converted to exact
candidate instants for each date.

Even though Bangladesh currently does not use daylight-saving transitions, the
conversion layer must define behavior for future international venues:

- nonexistent local time: reject or apply explicit configured policy;
- repeated local time: require/derive a specific offset and retain it;
- timezone change after a booking: existing exact scheduled instants remain
  unchanged unless explicitly rescheduled.

### Operational date

Each venue has an operational-day boundary. A booking/session snapshots its
operational date from the venue rule applying at commitment:

```text
calendar instant: 25 Jul 00:30 Asia/Dhaka
operational date: 24 Jul
```

Reports state whether they use scheduled operational date, service completion
date, payment occurrence date, or record date.

### Range semantics

All capacity intervals are:

```text
[start_at, end_at)
```

Start is included, end excluded. Duration is computed from instants; local
labels are presentation.

## Audit design

### What audit is

Audit is protected accountability for sensitive actions, not a copy of every
debug log.

Required logical fields:

```text
audit ID
business and venue scope
actor type and ID (user, integration, system, platform admin)
effective access profile/scope reference
action code
subject type and ID
reason code/text where required
before/after summary or revision/source references
occurred_at
request/correlation ID
idempotency/command reference
IP/device risk metadata only where justified
schema version
```

Sensitive content is minimized. Full customer notes, OTPs, secrets, and raw
payment references do not enter general audit payloads.

### Immutability

- Application roles have INSERT/SELECT-as-authorized only; no UPDATE/DELETE.
- Corrections append a new audit event referring to the earlier event.
- Database deployment/retention operations are separate privileged paths and
  themselves operationally audited.
- Partition/archival later preserves integrity and query traceability.
- Cryptographic tamper-evidence may be added if threat/regulatory evidence
  justifies it; it is not substituted with a misleading “blockchain” claim.

## Idempotency

### Client mutations

Required for:

- booking/hold/checkout completion;
- reschedule, reassignment, extension, cancellation;
- payment submission/verification;
- refund/reversal;
- subscription payment/reactivation;
- partner API mutations.

Identity:

```text
credential/caller scope
+ business
+ operation
+ client Idempotency-Key
+ canonical request hash
```

Processing:

1. Begin transaction and attempt to create/lock the identity.
2. If completed with same hash, return stored logical result.
3. If same key has another hash, reject.
4. If valid in-progress lease exists, return/await a defined in-progress result.
5. Execute command.
6. Store response reference/status in the same commit as domain changes.
7. On unknown network outcome, client safely retries the same key.

Retention duration follows the longest plausible client/provider retry window
and the risk of duplicate effect. Money/provider identities may require longer
retention than ordinary commands.

### Provider/webhook identity

Provider event/transaction IDs are unique within provider/account scope.
Signature verification occurs before processing. A duplicate delivery returns
the prior accepted result.

## Transactional outbox

Problem:

```text
database commit succeeds
→ process crashes before queue publish
→ notification/job is silently lost
```

Solution:

1. Domain mutation and OutboxMessage insert commit together.
2. Worker claims available outbox rows with safe concurrent locking.
3. Worker publishes/handles idempotently.
4. Completion/attempt is persisted.
5. Failure retries with backoff; poison messages enter visible terminal/dead
   handling without deleting their evidence.

The outbox is at-least-once. “Exactly once” is achieved only as one logical
business effect through consumer idempotency.

### Event envelope

```json
{
  "eventId": "evt_...",
  "eventType": "booking.confirmed",
  "schemaVersion": 1,
  "businessId": "opaque-id",
  "aggregateType": "booking",
  "aggregateId": "opaque-id",
  "aggregateVersion": 3,
  "occurredAt": "2026-07-24T13:05:00Z",
  "correlationId": "req_...",
  "causationId": "cmd_...",
  "payload": {}
}
```

Internal payload includes only what consumers need. External webhook payload is
a separately versioned, privacy-reviewed projection.

## Concurrency/version control

- Database constraints and row locks protect hard invariants.
- Mutable configuration/booking records use an incrementing version for stale
  edit detection.
- API returns an ETag/version where a client edit can become stale.
- `If-Match` or explicit expected version rejects lost updates.
- Financial/audit/event history is append-only and does not use last-write-wins.

## Reporting reconciliation

Every financial metric defines:

- source tables/transaction types;
- date basis;
- tenant/venue scope;
- state filters;
- sign and rounding behavior;
- drill-down key;
- projection freshness/checkpoint if not live.

Reconciliation tests assert aggregate total equals the exact sum of its
drill-down population under the same definition.

## Cross-cutting test vectors

Required fixtures include:

- ৳0.01 and very large safe/unsafe-JavaScript-integer amounts;
- percentage requiring fractional-minor-unit rounding;
- multiple partial payments, partial refund, full refund, reversal;
- duplicate manual/payment/provider callback;
- midnight-crossing Asia/Dhaka booking;
- simulated DST gap/fold in a non-Dhaka timezone;
- timezone configuration change after committed booking;
- idempotency retry before/during/after commit;
- outbox worker crash after external acceptance but before local attempt update;
- audit read/write attempts from every role;
- report totals after corrections and customer merge.
