# ServiceLink Pro Backend/API Development — Master Prompt

Copy the prompt below into an implementation agent. It is written for the existing ServiceLink repository, not as a greenfield specification.

---

You are implementing the ServiceLink Pro (B2B) operations module in the existing ServiceLink monorepo. Work in the current codebase; do not create a separate Pro application or a parallel provider/service system.

## Objective

Turn the currently frontend-only ServiceLink Pro areas into one reliable, API-backed business operations workflow:

```text
Admin service catalogue
  -> Provider enables Pro visibility
  -> Provider Directory
  -> Organization Provider Pool
  -> Job Ticket
  -> Provider offer / accept or decline
  -> shared availability lock
  -> QR + geofence attendance
  -> controlled completion
  -> SLA metrics
  -> billing/payment record + invoice/receipt
  -> compliance + immutable audit history
  -> dashboard KPIs and alerts
```

The final system must support a business discovering eligible providers, approving them into a pool, creating a multi-provider job, assigning providers safely, verifying arrival, completing the job, and retaining operational/financial/compliance history.

## First: audit before changing anything

1. Read the existing backend architecture under `backend/src/main/java/com/servicelink/core`.
2. Reuse existing `Provider`, `ServiceCatalog`, `Category`, `ProviderService`, `ProviderAvailabilitySlot`, `ProviderScheduleSettings`, `AvailabilityException`, `Appointment`, `Organization`, `Workspace`, `TeamMember`, `ProviderPoolEntry`, subscription/payment, KYC/KYB, notification, storage, and security code whenever possible.
3. Inspect existing controller/service/repository/DTO/mapper naming before adding classes. Extend an equivalent existing feature instead of duplicating it.
4. Inspect the existing frontend Pro routes and components before changing the UI:
   - `app/dashboard/business/directory/page.tsx`
   - `app/dashboard/business/providerpool/page.tsx`
   - `app/dashboard/business/jobs/page.tsx`
   - `app/dashboard/business/sla/page.tsx`
   - `app/dashboard/business/billing/page.tsx`
   - `app/dashboard/business/compliance/page.tsx`
   - `components/dashboard/business/**`
5. Search Pro code for `mock`, `dummy`, `sample`, `hardcoded`, `TODO`, `placeholder`, `fake`, and static arrays. Replace relevant operational data with API-backed state; do not claim mocked data is complete.
6. Preserve existing C2C appointments, provider profiles/pricing, availability, media uploads, notifications, eSewa/Khalti integrations, and auth flows. Do not break them.

## Non-negotiable architecture rules

1. **One provider identity:** use the existing provider record. Never create a Pro-only provider duplicate.
2. **One service catalogue:** all provider-directory filters and Pro job service choices must derive from the existing admin-managed category/service catalogue. Never hard-code filters such as HVAC, Electrical, Plumbing, Cleaning, or Painting in the frontend.
3. **One availability source:** C2C appointments and accepted Pro assignments must be checked together. The backend—not the frontend—must reject overlapping time ranges.
4. **Pro visibility is provider-controlled:** a provider who disables Pro visibility must not appear for new Directory selection or new assignment. Their historic assignments, pool membership, billing, and audit history must remain visible.
5. **Directory is not Pool:** the Directory is the eligible ServiceLink network; the Pool is the organization’s approved/trusted list. Pool membership is organization-specific and must be unique per organization/provider.
6. **Offer is not assignment:** provider selection sends an offer. The provider sees service, date/time, location, instructions, and expected earning; acceptance creates the confirmed assignment and locks availability. Declining or expiring an offer leaves the job open and does not reject the entire job.
7. **Operational performance is separate from the global provider rating:** calculate Pro completed jobs, attendance rate, and on-time arrival rate only from Pro records. Do not overwrite global marketplace rating.
8. **Backend is authoritative:** all mutations must authenticate, authorize, validate membership/ownership, validate role, validate state transition, validate data, write audit history where required, and return meaningful structured errors.
9. **Use existing layered convention:** controller -> service -> repository -> entity/model -> DTO -> mapper. Keep critical operations transactional.
10. **MVP only:** do not add AI matching, ML scoring, payroll, ERP, microservices, complex dispatch, fleet tracking, advanced accounting, paid maps, enterprise SSO, production escrow, or a separate attendance/sidebar module.

## Existing roles and RBAC

Implement and enforce the Pro organization roles already represented by the business module. The required fixed MVP roles are:

| Role | Permissions |
| --- | --- |
| `ADMIN` | Full organization control: team, settings, subscription, pool, jobs, attendance, SLA, billing, compliance. |
| `MANAGER` | Operational control: directory, pool, create/manage jobs, provider offers/assignment/reassignment, attendance, SLA, active-job management. |
| `STAFF` | Create and view permitted/own service requests; view jobs, assigned providers, attendance, and status. No provider-pool/team/billing control. |
| `FINANCE` | Billing, payments, invoices, spending, financial records, and appropriate read-only compliance access. No provider assignment or scheduling changes. |

Hide unavailable UI actions for good UX, but enforce RBAC in Spring Security/service code. Never trust a hidden button as authorization.

## Phase 1 — Service catalogue and provider Pro participation

### Service catalogue

- Confirm that the current admin category/catalog APIs support an admin creating, updating, toggling, and listing service categories and subservices.
- If any needed operation is missing, extend the existing category/service catalogue backend rather than introducing a competing Pro catalogue.
- Provide a public/authenticated read endpoint appropriate for Pro directory/job filters, returning active categories with active subservices.
- Update the frontend Directory filter UI to fetch and render these categories dynamically.

### Provider Pro visibility

- Extend the existing provider model/profile/availability flow with the smallest appropriate fields, for example:
  - `proVisible` or `proWorkEnabled` (default false for existing providers unless existing requirements say otherwise);
  - optional Pro availability/preference days and time range only if not already expressible through shared availability.
- Add an authenticated provider endpoint so the provider can toggle Pro visibility from the existing `AvailabilityTab` (or the closest existing provider settings surface).
- Toggle changes must persist, return the updated provider profile, and trigger correct Directory eligibility behavior.
- Only active, verified, Pro-visible providers with relevant available services may be shown as selectable for new Pro work.

## Phase 2 — Provider Directory and Provider Pool

### Provider Directory

Extend the existing `ProviderDirectoryController` and `ProviderDirectoryService` if they are the current convention. Provide a paginated/filterable API for the wider eligible ServiceLink provider network.

Directory API must support at least:

- active category/service filter from `ServiceCatalog`;
- search/name where existing conventions support it;
- optional location and minimum-rating filters if current provider fields support them;
- only active, verified, Pro-visible providers for new selection;
- provider identity/display fields, primary service/category, location, global rating, experience, verification, Pro eligibility/visibility, current availability summary, and current organization pool state;
- no exposure of protected/private provider fields.

For `@dashboard/business/directory/page.tsx`:

- Fetch dynamic category/subservice filters from the backend.
- Fetch actual providers from the directory endpoint.
- Show verification, Pro eligibility, availability, Pro visibility, and whether they are already in the current organization’s pool.
- Use clear loading, empty, error, disabled, and success states.
- `Add to Pool` must call the real API; no local-only mutations.

### Provider Pool

Use/extend the existing `ProviderPoolEntry` and related controller/service/repository rather than creating a duplicate association table unless truly necessary.

Pool API must support:

- add a directory-eligible provider to the authenticated organization’s pool;
- list/filter the organization’s pool;
- view current provider availability and Pro participation state;
- deactivate/remove pool membership without deleting historical job/financial/audit records;
- reject duplicate active membership;
- expose calculated Pro performance: completed Pro jobs, attendance rate, on-time rate, and global rating separately;
- return meaningful errors such as `PROVIDER_NOT_ELIGIBLE`, `PROVIDER_NOT_PRO_VISIBLE`, `PROVIDER_NOT_VERIFIED`, `DUPLICATE_POOL_ENTRY`, and `FORBIDDEN`.

For `@dashboard/business/providerpool/page.tsx`, remove mock state and show provider/service, verification, Pro eligibility, availability, completed Pro jobs, attendance, on-time rate, global rating, and actions to view availability or deactivate/remove.

## Phase 3 — Shared availability and conflict protection

Create a reusable backend availability/conflict service. Do not duplicate slot logic across job, pool, and appointment services.

The service must evaluate:

- existing active C2C `Appointment` time windows for the same provider;
- accepted/confirmed/in-progress Pro job assignments for the same provider;
- provider schedule settings, availability slots, exceptions, and Pro visibility/preferences where applicable;
- requested date, start time, end time/duration, and timezone handling consistent with the existing project.

Critical behavior:

- The provider can be listed as potentially available before an offer.
- A pending offer must not permanently lock time.
- At provider acceptance, re-check conflicts inside a transaction before writing a confirmed assignment.
- A confirmed Pro assignment must block a later overlapping C2C booking.
- A C2C appointment must block a later conflicting Pro assignment.
- Use optimistic locking/DB constraints/repository locking where practical to protect race conditions; never leave partial assignment state when a conflict is discovered.

Return a stable `SCHEDULE_CONFLICT` error with a safe, understandable message.

## Phase 4 — Job Ticket domain and APIs

Build this as an organization-owned Pro domain, separate from a C2C appointment but linked to the shared provider/service/availability source.

### Suggested entities (adapt names and extend existing models when possible)

```text
Organization
  -> JobTicket
       -> JobRequirement (optional; use if a ticket needs multiple service/worker groups)
       -> JobAssignment
            -> Provider
            -> AttendanceRecord
       -> ProJobPayment / BillingRecord
       -> InvoiceReceiptRecord
       -> ProAuditEvent
```

Do not create duplicate Provider, Category, ServiceCatalog, or availability tables.

### Job Ticket required fields

- organization/workspace;
- service catalog/category;
- required workers (support one ticket with multiple providers; model requirements cleanly if multiple service types are supported);
- date, start time, end time or duration;
- location/address plus latitude/longitude for attendance geofence;
- description/instructions;
- pricing model: `PER_DAY` and `PER_JOB` MVP models;
- business price, platform/service fee where applicable, and expected provider earning/rate;
- optional priority, notes, special instructions.

### Statuses

Keep job ticket state distinct from assignment state.

Job status:

```text
DRAFT -> REQUESTED -> ASSIGNING -> PARTIALLY_ASSIGNED -> ASSIGNED
-> IN_PROGRESS -> COMPLETED

Exceptions: CANCELLED, ESCALATED, UNFULFILLED
```

Assignment/offer status:

```text
OFFERED -> ACCEPTED | DECLINED | EXPIRED | CANCELLED
```

Add explicit allowed transitions in backend domain code. Completed/cancelled tickets cannot restart or complete again. Do not let a UI button choose an arbitrary status.

### APIs

Follow current route naming and existing controller conventions. Prefer domain-oriented endpoints such as:

```text
/api/pro/jobs
/api/pro/jobs/{id}
/api/pro/jobs/{id}/offers
/api/pro/jobs/{id}/assignments
/api/pro/jobs/{id}/attendance
/api/pro/jobs/{id}/complete
/api/pro/jobs/{id}/cancel
/api/pro/jobs/{id}/activity
```

Provider-facing offer actions must be under an authenticated provider route consistent with existing provider route conventions, for example:

```text
/api/providers/me/pro-job-offers
/api/providers/me/pro-job-offers/{assignmentId}/accept
/api/providers/me/pro-job-offers/{assignmentId}/decline
```

Use request/response DTOs, validation annotations, pagination/filtering where lists need it, mappers, and `@Transactional` service operations.

### Assignment flow

1. Authorized Staff/Manager/Admin creates a job ticket.
2. Manager/Admin selects an eligible pool/directory provider and creates an offer; provider sees service, date/time, location, instructions, and expected earning before deciding.
3. Provider accepts, declines, or offer expires.
4. On acceptance, the backend performs the shared availability check in the same transaction, locks the agreed provider earning, creates/updates the assignment, records audit history, recalculates ticket staffing state, and notifies stakeholders.
5. One decline leaves the job in assigning/partially-assigned state; it does not reject the job ticket.
6. The job becomes `PARTIALLY_ASSIGNED`, `ASSIGNED`, or `UNFULFILLED` based on required versus accepted worker count.

## Phase 5 — Attendance, QR check-in, and controlled completion

Attendance is a capability inside Job Ticket details, not a sidebar module.

### Attendance requirements

- Generate a job-specific QR/check-in token. Store only a safe token/hash/expiry, never treat a predictable id alone as valid proof.
- The authenticated provider submits QR/token, device geolocation, and check-in action.
- Backend validates provider identity, job, accepted assignment, ticket state, time window, and location.
- Use browser/device geolocation plus a server-side distance calculation (Haversine is sufficient). Do not require paid map APIs.
- Store expected arrival, check-in time, attendance status (`PRESENT`, `LATE`, `MISSING`, `REJECTED`, `CHECKED_OUT`), verified location flag, distance from job location, rejection reason, and optional check-out time.
- Transition the job to `IN_PROGRESS` only when the defined attendance/assignment conditions are satisfied.
- Support manager-visible exceptions/replacement handling without building a dispatch engine.

Return stable errors including `ATTENDANCE_REQUIRED`, `CHECK_IN_TOO_EARLY`, `CHECK_IN_TOO_LATE`, `LOCATION_OUTSIDE_RADIUS`, `INVALID_QR`, `ASSIGNMENT_NOT_ACCEPTED`, and `JOB_INVALID_STATE`.

### Completion requirements

- Provider cannot arbitrarily complete a job.
- Require an accepted assignment, valid applicable attendance/check-in, job `IN_PROGRESS`, and a provider completion submission.
- Require Manager/Staff confirmation if that is the selected business workflow; make the authorization and transition explicit.
- Completion records timestamps, recalculates SLA, opens/finalizes billing workflow, writes audit events, notifies stakeholders, and refreshes dashboard aggregates.

## Phase 6 — SLA, billing, compliance, dashboard, notifications

### SLA

Build a simple measured SLA service/API. Do not invent scores with insufficient history.

Calculate from real Pro records:

- on-time arrival rate;
- late attendance count/rate;
- missing/failed attendance;
- completion rate;
- cancelled and escalated job counts;
- provider-level Pro metrics for Provider Pool;
- organization-level metrics for the SLA page/dashboard.

Compare expected arrival against check-in time to determine on-time/late. Expose clearly labeled totals, periods, and unavailable/insufficient-history states.

### Billing

This is not a full accounting or escrow system. Create durable job-level billing/payment records with:

- job reference;
- organization and provider/assignment;
- estimated and final amount;
- business price;
- provider earning (locked after acceptance);
- service/platform fee if used;
- status;
- transaction id/reference;
- payment method;
- payment date;
- invoice/receipt reference and timestamps.

Use existing eSewa/Khalti sandbox gateway services where actual payment verification is implemented. Do not replace them or add paid payment services. A simulated/recorded transaction flow is acceptable only if it is explicit and does not claim verified payment.

Lifecycle:

```text
Job created -> estimated cost -> price confirmed -> service completed
-> payment initiated/verified -> payment recorded -> invoice/receipt
```

### Compliance and audit

Make compliance consume actual backend data:

- organization KYB/verification, PAN/VAT, and business document summary;
- provider verification/KYC state, Pro eligibility, and participation state;
- job/transaction references, provider, amount, payment state, invoice, completion time, timestamps;
- simple append-only activity/audit timeline.

Audit at least provider added/removed from pool, job created/updated/cancelled/escalated, offer created/accepted/declined/expired, assignment confirmed, check-in/out, completion submitted/confirmed, payment recorded, and invoice generated.

### Dashboard

Wire `app/dashboard/business/page.tsx` and dashboard components to actual APIs. Show concise operational information, not decorative chart filler:

- active providers;
- pending approvals/offers where available;
- jobs this month;
- jobs in progress;
- SLA/on-time rate;
- monthly spend;
- today’s expected/present/late/missing workforce;
- recent job tickets with service, assignment state, job state, SLA state, amount/payment state;
- alerts: under-staffed, pending offer, missing/late provider, SLA risk, payment pending, compliance missing.

Prioritize actionable exceptions and return empty/loading/error states.

### Notifications

Use the existing notification architecture (database + WebSocket; existing email/Twilio only where appropriate). Notify the relevant customer/provider/business role for provider offer, accept/decline, job update, assignment change, check-in, late/missing attendance, completion, payment, and invoice events.

## Frontend integration and UI quality

Use strong TypeScript types, centralized API contracts, and existing API/client patterns. Refactor Pro UI where needed; do not merely attach APIs to misleading screens.

The UI must clearly show:

- what happened;
- who is responsible;
- which status is current;
- the next permitted action;
- why an action is unavailable.

For Job Ticket detail, render a lifecycle conceptually like:

```text
Created -> Assignment -> Assigned -> Attendance -> In Progress
-> Completion -> SLA -> Billing -> Compliance
```

Only current/completed stages should look active. Action controls must derive from backend status and role. Use consistent badges, confirmation dialogs, pagination where needed, loading/empty/error/success states, disabled controls, and understandable API-error messages.

## Database and transaction requirements

- Prefer extending current models; introduce only focused new Pro domain entities/repositories when needed.
- Use foreign keys, enum state fields, uniqueness constraints, indexes, and optimistic locking where appropriate.
- Prevent duplicate active pool membership, duplicate assignment, duplicate check-in, and overlapping confirmed assignments.
- Preserve historical job, assignment, billing, and compliance records even if pool membership or Pro visibility later changes.
- For critical flows—offer acceptance, availability lock, assignment state, completion, payment verification—validate first, mutate inside one transaction, then commit. No partial state on conflict/failure.
- Add a migration strategy consistent with the repository. Do not depend on destructive schema recreation.

## Required negative tests

Demonstrate/test all of the following:

1. An admin-created service/subservice appears in dynamic Directory filters and job creation choices.
2. An active verified provider with Pro visibility ON appears in the Directory; visibility OFF removes them from new selection but preserves history.
3. An unverified, inactive, hidden, or unavailable provider cannot enter new Pro assignment.
4. Duplicate pool entry is rejected.
5. Finance cannot assign providers; Staff cannot edit the pool; frontend route hiding cannot bypass backend RBAC.
6. A C2C appointment blocks an overlapping accepted Pro assignment and an accepted Pro assignment blocks an overlapping C2C booking.
7. Declined/expired offer leaves the job open; accepted offers lock rate and availability.
8. Completed/cancelled job cannot restart or complete again.
9. A provider cannot check in to another provider’s job; invalid QR, invalid time, and invalid geofence are rejected.
10. Payment cannot be marked successful without valid sandbox verification/explicit supported record flow.
11. Completion produces SLA, billing/compliance/audit data and dashboard aggregates update.

## Delivery expectations

Implement in this order, committing coherent vertical slices where the project workflow expects commits:

1. Architecture audit and service-catalog normalization.
2. Provider Pro visibility.
3. Directory backend/UI.
4. Pool backend/UI.
5. Shared availability conflict checker and C2C integration.
6. Job Ticket domain/API/UI.
7. Offers, acceptance, assignment, and rate locking.
8. Attendance/QR/geofence and controlled lifecycle.
9. SLA API/UI.
10. Billing/payment record/invoice API/UI.
11. Compliance/audit API/UI.
12. Dashboard aggregates/alerts and notifications.
13. Integration tests and cleanup of relevant mocked data.

At the end, provide a concise, evidence-based report containing:

1. Architecture and database/entity changes.
2. New/modified API routes with authorization rules.
3. Changed frontend pages/components and removed mock data.
4. Directory, Pool, Job Ticket, assignment, attendance, SLA, billing, compliance, notification, and shared-availability behavior.
5. Test commands and exact end-to-end flow exercised.
6. Known limitations or deferred MVP scope.

Do not claim that a page is implemented when it still uses static/mock data. The success standard is a believable, consistent ServiceLink Pro operational system—not a collection of visually complete screens.
