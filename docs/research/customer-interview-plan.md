# Customer Interview and Pilot-Discovery Plan

Status: Optional future reference; not required by the active roadmap

The founder has chosen not to depend on direct venue-owner/staff outreach,
interviews, or recruited design partners. This document is retained only in
case voluntary access becomes easy later. The active alternative is the
[Solo-Founder Validation Plan](solo-founder-validation-plan.md).

## Objective

Validate the problem, current workflow, MVP boundary, adoption barriers, and
willingness to pay before committing to detailed technical architecture.

The interviews are not sales demonstrations. They should uncover what happened
recently in the real business.

## Stages

### Stage 1: Discovery interviews

Interview approximately:

- 5–8 owners or decision-makers
- 3–5 managers/reception/booking staff
- 5–8 players or team organizers

Prioritize depth and variation over a large survey.

### Stage 2: Workflow observation

Observe at least two venues during a busy period:

- How availability is checked
- How calls/messages are handled
- How payment evidence is verified
- How changes are recorded
- How staff hand over work
- How the day is reconciled

Do not record personal customer information without permission.

### Stage 3: Design-partner qualification

Select one venue willing to:

- Provide real schedules and price rules
- Import upcoming bookings
- Train staff
- Use the software as primary booking record
- Meet regularly for feedback
- Report problems honestly

## Recruitment profile

Seek variation:

- Football turf
- Badminton/indoor court
- Mixed-sport facility
- Owner-present and manager-operated venue
- Low and high booking volume
- Different Dhaka areas and, later, another city

Avoid recruiting only friends who want to encourage the founder.

## Interview rules

- Ask about the last real event, not an imagined future.
- Do not present the full feature list before understanding the workflow.
- Ask for examples, frequency, time, and financial impact.
- Let silence work; do not answer the question for the participant.
- Record contradictions.
- Ask permission before audio, photo, or document capture.
- Redact customer phone numbers and payment references from research notes.

## Owner/manager interview guide

### Business context

1. What sports, resources, and venues do you operate?
2. How many employees handle bookings?
3. Which days and times are busiest?
4. Walk me through yesterday's bookings.

### Booking

5. Where did the last ten booking requests come from?
6. Show me how you check whether a slot is available.
7. Tell me about the last booking mistake or argument.
8. How are pending reservations held?
9. What happens when two people want the same slot?
10. How often do customers reschedule, cancel, arrive late, or not appear?

### Payments

11. How much advance is normally required?
12. Show the process for bKash/Nagad verification without exposing customer
    secrets.
13. How are partial payments and dues recorded?
14. Tell me about the last refund or payment disagreement.
15. How do you reconcile cash and digital payments?

### Owner visibility

16. What numbers do you check daily and monthly?
17. How do you know whether an employee gave a discount?
18. How do you know which resource or time is underused?
19. What information do you request when you are away?

### Adoption

20. What software, notebooks, or spreadsheets have you tried?
21. Why did previous methods succeed or fail?
22. Which staff member would resist a new system and why?
23. What must continue working if the internet is unstable?

### Value and price

24. What does a booking error or empty peak slot cost?
25. Which outcome would justify paying monthly?
26. What existing business software do you pay for?
27. Who approves a software purchase?
28. Would you prefer monthly, annual, or usage-based billing? Why?

Avoid asking only “Would you pay?” Ask for the decision process and comparable
spending.

## Staff interview/observation guide

- Demonstrate creating a phone booking
- Demonstrate finding a returning customer
- Demonstrate recording advance and due
- Demonstrate shift handover
- Demonstrate cancellation/refund
- Identify the busiest 15 minutes of a normal day
- Identify information that must be visible immediately
- Identify actions that require manager permission
- Test whether a proposed quick-booking flow is faster

Measure time and errors, not only preference.

## Player/team-organizer guide

- Describe the last venue booking
- How many venues were contacted?
- Which channel was used?
- How was availability and price confirmed?
- Who collected money from teammates?
- What caused uncertainty?
- What cancellation/refund outcome was expected?
- Would OTP be acceptable?
- Which confirmation channel is trusted?
- Is account creation useful or annoying?
- Does the organizer need a reusable team or only a team name?

## Artifacts to request

With permission and redaction:

- Blank booking notebook format
- Spreadsheet column headings
- Slot/rate sheet
- Cancellation policy
- Example confirmation message
- Daily cash summary format
- Staff-role list
- Upcoming schedule

The structure matters more than copying personal data.

## Interview note template

```text
Date:
Participant role:
Venue type:
Location:
Resources:
Booking volume:

Observed facts:
Direct examples:
Current tools:
Pain frequency/impact:
Workarounds:
Desired outcomes:
Adoption risks:
Price/purchase evidence:
Contradictions:
Assumptions affected:
Follow-up:
```

## Design-partner scorecard

Rate 1–5:

- Problem intensity
- Booking volume
- Owner commitment
- Staff availability
- Workflow fit with pilot
- Data/configuration readiness
- Feedback quality
- Willingness to use one source of truth
- Commercial potential
- Customization risk, reverse-scored

Choose the strongest learning partner, not merely the largest venue.

## Synthesis

After each interview:

1. Update [assumptions](../planning/assumptions-and-validation.md).
2. Add new unresolved issues to [open questions](../planning/open-questions.md).
3. Note repeated feature demand in the [feature catalogue](../planning/feature-catalogue.md).
4. Do not change confirmed scope until evidence and consequences are reviewed.
5. Record approved changes in the [decision log](../planning/decision-log.md).

## Exit criteria before architecture lock

- At least five owner/manager interviews
- At least three staff workflow perspectives
- Evidence from real booking/payment artifacts
- One qualified design partner
- Confirmed fixed-slot fit for the first pilot
- Clear payment-verification workflow
- Initial language and notification decision
- Credible subscription price hypothesis
