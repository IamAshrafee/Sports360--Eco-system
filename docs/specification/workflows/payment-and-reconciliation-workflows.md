# Payment, Refund, and Reconciliation Workflows

Status: Approved behavioral baseline

## WF-PAY-001: Record advance, partial, or full payment

Priority: P0
Primary actor: Booking Staff
Scenarios: PAY-001 through PAY-005

### Preconditions

- Actor has collect-payment permission.
- Booking exists and amount/currency are visible.

### Main path

1. Actor selects booking and Add Payment.
2. Actor chooses configured method.
3. System displays total, net paid, refunded, and due.
4. Actor enters exact amount and method details.
5. System validates amount and method-specific fields.
6. Actor confirms.
7. System creates immutable successful/manual-pending transaction as appropriate.
8. Derived payment state and due update.
9. Booking confirmation may change only through configured confirmation policy.

### Rules

- Multiple payments are allowed.
- Existing payment is never overwritten.
- Overpayment is rejected or requires an explicit supported resolution; pilot
  does not create automatic venue credit.
- Attendance is not automatically changed.
- Retrying the same request does not duplicate the transaction.

## WF-PAY-002: Verify manual MFS payment

Priority: P0
Primary actor: Booking Staff or Manager according to permission
Scenarios: PAY-006, PAY-007, BKG-006

### Main path

1. Actor opens submitted manual payment.
2. System shows amount, method, transaction reference, sender suffix, receiving
   account, submitted time, and booking.
3. Actor compares with receiving account outside the system.
4. Actor marks Verified or Rejected with reason.
5. Verified transaction updates net paid and may satisfy confirmation.
6. Rejected transaction does not count as collected money.

### Exceptions

- Duplicate reference: require review; do not silently count twice.
- Payment arrives after booking expiry: send to exception resolution; do not
  silently reclaim unavailable slot.
- Evidence attachment without verifiable transaction: remains pending/rejected.

## WF-PAY-003: Reverse incorrect payment

Priority: P0
Primary actor: Manager or Finance/Reports
Scenarios: PAY-008, AUTH-003, RPT-009

### Main path

1. Authorized actor selects original payment.
2. System shows downstream booking/payment consequences.
3. Actor enters correction reason.
4. System creates linked reversal transaction.
5. Net paid, due, payment state, and relevant alerts recalculate.
6. Original and reversal remain visible.

### Rules

- No hard delete.
- Reversal cannot exceed un-reversed original amount.
- Booking confirmation is not silently cancelled; any resulting policy breach
  becomes an explicit exception.

## WF-PAY-004: Record refund

Priority: P0
Primary actor: Manager or Finance/Reports
Scenarios: PAY-009, PAY-010, BKG-009, BKG-010

### Main path

1. Actor opens cancellation/payment refund action.
2. System lists refundable original payments and method constraints.
3. Actor enters refund allocation, method, reason, and reference.
4. System validates total does not exceed refundable amount.
5. Actor records Requested/Completed manual refund as supported.
6. System updates net paid/refunded state and reports.
7. Customer confirmation is generated; delivery failure does not change refund
   record.

### Rules

- Partial and full refund are supported.
- Refund and cancellation are separate.
- Several original payments remain traceable.
- Gateway refund automation is future; pilot records verified/manual outcome.

## WF-PAY-005: Reconcile shift or operational day

Priority: P0
Primary actor: Booking Staff and Finance/Reports
Scenarios: PAY-012, OPS-015, RPT-001, RPT-002

### Main path

1. Actor opens reconciliation for venue/shift/date.
2. System calculates opening cash, cash payments, cash refunds, approved cash
   expenses, and expected closing.
3. Actor enters counted cash.
4. System calculates variance exactly.
5. Actor adds required explanation for non-zero variance.
6. Actor closes/submits.
7. Authorized Finance/Manager reviews and approves or returns for correction.

### Rules

- Digital methods are summarized separately.
- Closing can proceed with unresolved operational items if handover is recorded.
- Transaction dates and operational booking dates are not mixed.
- Editing submitted/approved reconciliation creates an audited correction.

