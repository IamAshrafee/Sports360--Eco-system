# Platform, Enterprise, and International Expansion

Status: Future capability brief
Likely horizon: H1–H3

## Purpose

The pilot targets one venue. The platform may later support chains, enterprise
governance, branded distribution, external integrations, and markets outside
Bangladesh.

## FC-601: Multi-venue chains

### Value

Lets one organization control several locations while preserving local
operation.

### Representative workflow

```text
Create/acquire venue
→ Apply business templates
→ Assign regional and venue staff
→ Operate locally
→ Compare and consolidate centrally
```

### Core rules

- Business-wide defaults can be overridden at venue/resource/offering level.
- Membership access and report scope are explicit.
- Customer relationship may be business-wide while notes/restrictions can have
  venue scope.
- Transfers between venues preserve history.
- Consolidated reports use consistent timezone/currency rules.

### Dependencies

- Existing tenant/venue boundary
- Scoped access
- Configuration inheritance
- Branch comparison
- Plan entitlements

### MVP seam

Every operational record includes tenant and venue context even when the pilot
has only one active venue.

### Promotion trigger

Commercial customers need more than one active venue and H0 workflows are
stable.

## FC-602: Custom roles and approval policies

### Value

Supports larger organizations with specialized duties and financial controls.

### Representative workflow

```text
Clone/default role
→ Select permitted actions and scopes
→ Assign membership
→ Configure approval threshold
→ Review access and audit
```

### Core rules

- Deny by default.
- Sensitive permissions are clearly grouped and warned.
- Role changes do not erase historical actor context.
- Approval policy distinguishes requester and approver.
- Emergency access is time-limited and audited.
- Owners cannot accidentally remove the last ownership/recovery path.

### Dependencies

- Action/scope permission model
- Approval request
- Access review
- Strong authentication

### MVP seam

Curated profiles map to underlying granular permission identifiers rather than
one admin flag.

### Promotion trigger

Multiple larger customers cannot safely operate with the curated profiles.

## FC-603: Enterprise identity and governance

Possible capabilities:

- SSO through standard identity protocols
- Enforced multi-factor authentication
- User provisioning/deprovisioning
- IP/device/session policies
- Data export/retention policies
- Security event integration
- Formal support/SLA controls

Dependencies include enterprise customer demand, security program maturity,
administrative recovery, and contractual/legal readiness.

The MVP seam is a global identity plus tenant membership model and auditable
session/access events.

## FC-604: White label, custom domains, and embeds

### Value

Allows venues/chains to present booking under their brand.

### Representative workflow

```text
Configure brand/theme/domain
→ Verify domain ownership
→ Preview
→ Publish booking experience
→ Monitor certificate/delivery
```

### Core rules

- Branding never hides the legal/payment merchant identity.
- Accessibility and security cannot be disabled by theme.
- Domain verification and safe redirect rules are required.
- Platform/version/support boundaries remain clear.
- Embed communicates securely with the booking service.

### Dependencies

- Stable public booking
- Tenant branding/theme tokens
- Domain/certificate automation
- Abuse/content policy

### MVP seam

Separate tenant content/brand configuration from core booking components.

### Promotion trigger

Paying customers show willingness to upgrade for owned distribution.

## FC-605: APIs, webhooks, and integrations

### Value

Connects websites, accounting, access control, CRM, messaging, and partner
marketplaces.

### Core rules

- Versioned contracts and deprecation policy
- Tenant-scoped credentials
- Least-privilege scopes
- Idempotency and webhook signing
- Delivery/retry/dead-letter visibility
- Rate limits and audit
- Data minimization

### Candidate events

- Availability changed
- Hold created/expired
- Booking confirmed/changed/cancelled/completed
- Payment/refund verified
- Resource blocked
- Customer restriction changed

### Dependencies

- Stable domain events
- Developer documentation
- Credential management
- Integration monitoring/support

### MVP seam

Keep external adapters outside core invariants and use durable internal event/
outbox patterns when architecture is designed.

### Promotion trigger

Repeated high-value integration demand or strategic distribution partnership.

## FC-606: Reseller and partner administration

### Value

May allow agencies, franchise operators, or regional partners to onboard and
support several tenant businesses.

### Core rules

- Partner access is explicit, tenant-approved, limited, and audited.
- Billing/referral/reseller ownership is separate from venue ownership.
- Support access expires/revokes cleanly.
- Partner cannot aggregate private tenant data without contract and consent.

### Dependencies

- Mature tenant administration
- Delegated support access
- Commercial agreements
- Partner billing

### Promotion trigger

Direct founder-led sales/support no longer scales and qualified partners provide
measurable distribution.

## FC-607: Internationalization

### Capability areas

- Language and translation
- Currency and exact minor-unit differences
- Timezone and daylight-saving behavior
- Address/phone formats
- Week start and holiday calendars
- Taxes, invoices, and payment methods
- Data residency and privacy
- Sport/resource terminology

### Core rules

- Currency is explicit on every monetary record.
- Historical transactions do not change currency.
- Display timezone never changes stored instant.
- Tax/policy adapters are jurisdiction-specific and reviewed.
- Translation includes operational terminology and message templates.
- Cross-currency settlement is a separate financial capability.

### MVP seam

- BDT is explicit, not implied.
- `Asia/Dhaka` is configured, not hardcoded into timestamps.
- User-facing text uses localization-ready resources when implementation starts.
- Phone normalization uses country-aware parsing.

### Promotion trigger

Bangladesh product-market fit is credible and a specific second market has
validated demand, payment, legal, and support feasibility.

## Enterprise boundary

Enterprise capability should not turn the core into customer-specific forks.
Configuration and documented extension points are preferred; custom code enters
the product only when it represents a repeatable segment need.
