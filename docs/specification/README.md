# Phase 2: Detailed MVP Specification

Status: Complete

## Purpose

Phase 2 converts confirmed product direction and simulation scenarios into a
delivery-ready behavioral specification. It defines what users must accomplish
and what the system must guarantee before technical architecture is selected.

## Outputs

1. [Workflow catalogue](workflows/README.md)
2. [Epics and user stories](epics-and-user-stories.md)
3. [Acceptance criteria](acceptance-criteria.md)
4. [Screen inventory and navigation](screen-inventory-and-navigation.md)
5. [Low-fidelity interaction designs](low-fidelity-interaction-designs.md)
6. [Scripted cognitive walkthroughs](cognitive-walkthroughs.md)
7. [Notification matrix](notification-matrix.md)
8. [Non-functional requirements](non-functional-requirements.md)
9. [Traceability matrix](traceability-matrix.md)

## Traceability chain

```text
Product decision
→ Product/domain document
→ Simulation scenario
→ Workflow
→ Epic and user story
→ Acceptance criterion
→ Screen/API/background behavior
→ Test
```

No delivery story should exist without an approved MVP outcome or an explicit
scope decision.

## Identifier conventions

| Artifact | Format | Example |
|---|---|---|
| Workflow | `WF-{AREA}-{NNN}` | `WF-BKG-001` |
| Epic | `EP-{AREA}` | `EP-BKG` |
| User story | `US-{AREA}-{NNN}` | `US-BKG-004` |
| Acceptance criterion | `AC-{AREA}-{NNN}` | `AC-BKG-012` |
| Screen | `SCR-{AREA}-{NNN}` | `SCR-OPS-001` |
| Notification | `NTF-{AREA}-{NNN}` | `NTF-PAY-002` |
| Non-functional requirement | `NFR-{AREA}-{NNN}` | `NFR-SEC-001` |

Simulation scenarios retain their existing identifiers such as `BKG-004` or
`PAY-009`.

## Priority

| Priority | Meaning |
|---|---|
| P0 | Tenant isolation, security, money, booking invariant, or release blocker |
| P1 | Required complete MVP workflow |
| P2 | Valuable secondary behavior that may follow core completion |

## Specification rules

- Describe externally observable behavior before implementation.
- Keep booking, payment, and attendance states separate.
- Specify actor, venue scope, precondition, normal path, exception path, and
  audit consequence.
- Include exact money and time consequences where relevant.
- Avoid selecting framework, database, or hosting technology in Phase 2.
- Future capabilities stay referenced only as seams.
- Every important error explains what happened and what the user can do next.
- A hidden UI control is not authorization; server behavior remains specified.
- Notifications never become the source of truth.

## Definition of ready for architecture

Phase 2 is complete when:

- Every pilot outcome maps to an end-to-end workflow.
- Every P0/P1 simulation scenario maps to acceptance behavior.
- Every MVP actor has a coherent navigation path.
- Core staff tasks can be completed through the low-fidelity design.
- State, permission, money, time, and retry exceptions are explicit.
- Notifications have triggers, recipients, channels, and retry semantics.
- Non-functional requirements are testable.
- No unresolved ambiguity blocks domain/data architecture.
