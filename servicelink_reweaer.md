# ServiceLink Backend Ecosystem Reference

> **Scope.** This document describes the backend currently present in `backend/`. It is an implementation-oriented guide: it records the deployed code structure, boundaries, principal request flows, supporting services, dependencies, and operational configuration. It does not describe frontend implementation details except where the frontend is a backend client.

## 1. Backend at a glance

ServiceLink Core is a modular Spring Boot application serving a Nepal-focused C2C service marketplace and a B2B **ServiceLink Pro** workflow. It exposes REST endpoints under `/api`, uses a stateless JWT security model, persists durable state in MySQL through JPA/Hibernate, and uses Redis for short-lived state such as refresh tokens, PIN attempts, and business-registration sessions.

```text
Next.js client / external OAuth provider
        │ HTTP, multipart/form-data, OAuth redirect, SockJS/STOMP
        ▼
Spring Boot application (com.servicelink.core)
  controllers → services → repositories → MySQL
        │          │             │
        │          ├─────────────┼── Redis (tokens, throttling, registration state)
        │          ├──────────────── Supabase Storage (media objects)
        │          ├──────────────── eSewa / Khalti (payments)
        │          ├──────────────── Google Calendar (provider calendar)
        │          └──────────────── SMTP / Twilio / WhatsApp (messages and OTP)
        └──────────── STOMP broker → real-time notification subscribers
```

**Runtime facts from the build configuration**

- Maven artifact: `com.servicelink:core:0.0.1-SNAPSHOT`.
- Java target: **17** (`pom.xml`).
- Spring Boot parent: **4.0.4**.
- Main class: `com.servicelink.core.CoreApplication`; it uses `@SpringBootApplication` and `@EnableAsync`.
- Development defaults: backend dependencies expect MySQL and Redis on `localhost`; the frontend URL defaults to `http://localhost:3000`.

## 2. Source layout and responsibility

```text
backend/
├── pom.xml                                      Maven build and dependencies
├── mvnw, mvnw.cmd                               Maven wrapper
├── src/main/resources/application.properties    Runtime defaults and environment placeholders
└── src/main/java/com/servicelink/core/
    ├── CoreApplication.java                     Application bootstrap; async support
    ├── config/                                  Security, CORS, WebSocket, Redis, payment properties, admin seed
    ├── controller/                              HTTP boundary, grouped by domain
    ├── dto/                                     Request, response, and cache payload contracts
    ├── exception/                               Domain errors and global HTTP error serialization
    ├── mapper/                                  Entity ↔ DTO mapping
    ├── model/                                   JPA entities and domain enums
    ├── payment/                                 Gateway adapters and payment orchestration
    ├── repository/                              Spring Data JPA persistence interfaces
    ├── security/                                JWT filter/service and OAuth2 success handler
    ├── service/                                 Domain use cases, transaction boundaries, integrations
    └── storage/                                 Storage abstraction and Supabase implementation
```

The intended request path is:

1. A controller receives HTTP input, validates a request DTO, and reads the authenticated principal where applicable.
2. A domain service applies authorization, ownership checks, workflow rules, and `@Transactional` persistence.
3. Repositories query or save JPA entities in MySQL.
4. Mappers build response DTOs, keeping entity implementation details out of the API.
5. Side effects—email, provider gateway calls, storage uploads, calendar actions, or WebSocket events—are invoked from the relevant service.
6. Exceptions are normalized by `GlobalExceptionHandler` into a JSON body containing `status`, `code`, `message`, optional `details`, and an ISO-8601 `timestamp`.

## 3. Domain modules

| Module | Core concepts | Backend function |
| --- | --- | --- |
| Identity and users | `User`, roles, OTP, refresh token, 2FA, OAuth | Registration, login, token refresh/logout, profile management, password and phone/email verification. |
| Provider marketplace | `Provider`, category, service catalog, provider service, reviews, portfolio | Provider onboarding and public discovery; providers maintain services, profile, reviews, portfolio, availability, referral and PIN security. |
| Scheduling and bookings | `Appointment`, availability slot, schedule setting, exception, reschedule token | Customers book provider time slots; providers manage booking states and availability; conflicts and paid reschedules are handled as domain workflows. |
| Payments | Payment transactions, provider subscriptions, business subscriptions | Generates gateway payment requests and verifies eSewa/Khalti results before changing payment/subscription state. |
| Trust and compliance | KYC submission/status, KYB verification, admin review | User KYC submission/status tracking and admin review/video-audit operations; business KYB document flow. |
| ServiceLink Pro | Organization, workspace, Pro user, team member, provider pool/directory | Enterprise setup, team invitations, workspace configuration, subscription lifecycle, and sourcing providers in bulk. |
| Notifications | `Notification`, notification category | Persists notifications, exposes read/unread operations, and pushes immediate events over STOMP/WebSocket. |
| Media/storage | User images, provider portfolio media, KYC/KYB attachments | Uses a storage interface with Supabase implementation; database entities retain references/URLs rather than raw binary data. |

## 4. API surface by controller group

The endpoint paths below are controller contracts, not an OpenAPI replacement. Springdoc OpenAPI UI is included in the dependency set and should be the live source when the service is running.

| API area | Base route(s) | Principal operations |
| --- | --- | --- |
| Auth/account | `/api/auth` | Register/login, refresh token, logout, current-user profile, avatar, password reset, phone/email OTP, customer/provider verification, and login 2FA. |
| User management | `/api/users` | Read/update users, password and profile-image changes, account deletion, onboarding state, and two-factor setup/disable. |
| Providers | `/api/providers` | Public provider/category/catalog retrieval; provider self-profile, service selection, onboarding, portfolio, reviews, referrals, and provider device PIN actions. |
| Provider availability | `/api/providers/...` | Schedule settings, available slots, and exception/blackout-date management through dedicated availability controllers. |
| Provider subscriptions | `/api/providers/subscription` | Checkout, verification/status, subscription lifecycle, and callback-oriented subscription handling. |
| Appointments | `/api/appointments` | Customer creation/list/detail/cancel/statistics; provider lists, details, status transitions, calendar and statistics. |
| Appointment rescheduling | `/api/appointments/{id}/reschedule`, `/api/appointments/reschedule-tokens` | Standard/token reschedule, payment initiation/verification, and current token balance. |
| KYC and admin KYC | `/api/kyc`, `/api/admin/kyc` | Submit and query KYC, public status-by-reference lookup, admin pending/detail/approve/reject/video-audit functions. |
| Business identity | `/api/auth/business` | Email OTP verification, login verification, and password reset for business users. |
| ServiceLink Pro | `/api/business/**`, `/api/pro/**` | Organization, KYB, workspace, team, registration session, Pro users, billing/subscriptions, provider pool, and provider directory. |
| Business payments | `/api/business/...` | Payment initiation and verification for business subscriptions/workflows. |
| Administration | `/api/admin/providers`, `/api/admin/subscriptions` | Manage service categories/catalog and administer provider-subscription status, history, extension, revocation, and statistics. |
| Notifications | `/api/notifications` | Create/list notifications, get unread count, mark one/all read. |
| File APIs | `/api/storage`, `/api/media` | Multipart upload endpoints; storage abstraction sends supported objects to Supabase. |

## 5. Major workflow steps

### 5.1 Authentication, authorization, and session lifecycle

1. The client calls public `/api/auth/**` routes for registration, credentials login, OTP work, or OAuth2 entry.
2. `AuthService`, OTP services, `PhoneOtpService`, `TwoFactorAuthService`, and `RefreshTokenService` execute the workflow. Passwords are encoded using `BCryptPasswordEncoder`.
3. `JwtService` creates and validates JWTs; `JwtAuthenticationFilter` runs before Spring Security's username/password filter and establishes the authenticated principal for valid bearer tokens.
4. Refresh-token information is stored through `RefreshTokenService` in Redis, allowing logout/revocation and expiration independent of the access token.
5. `SecurityConfig` applies a stateless session policy. Method guards such as `@PreAuthorize("hasRole('CUSTOMER')")`, `hasRole('PROVIDER')`, and `hasRole('ADMIN')` add domain-level authorization to controller operations.
6. Google OAuth2 uses the configured client registration and `OAuth2LoginSuccessHandler` to complete the external login handoff.

### 5.2 Booking and appointment lifecycle

1. A customer reads public provider data and provider availability.
2. The customer sends an appointment request to `/api/appointments`; the customer role is required.
3. `AppointmentService` resolves provider/service data, validates the requested slot, persists the appointment, and handles booking conflicts through `BookingConflictException`.
4. Providers retrieve only their appointment views and update permitted status transitions through provider-authorized routes.
5. `AppointmentPricingService` determines reschedule/payment pricing. `AppointmentRescheduleService` handles normal or token reschedules and guards its state changes with transactions.
6. Where a reschedule requires payment, the payment endpoint creates a gateway initiation response; only subsequent verification updates the relevant payment/appointment records.
7. Email and persisted/WebSocket notifications communicate relevant booking events to users.

### 5.3 Provider lifecycle

1. Provider registration creates/associates the provider identity (`ProviderRegistrationService`).
2. The provider authenticates and may establish a device PIN using `ProviderPinService`; Redis-backed `PinAttemptService` tracks/rate-limits attempts.
3. The provider completes profile fields, categories, offered services, schedule settings, availability slots, exceptions, portfolio entries, and onboarding completion through the authenticated `/api/providers/me/**` surface.
4. Public provider catalog endpoints expose discovery data while self-management endpoints require a valid provider principal. Security ordering intentionally places `/api/providers/me/**` before public `/{providerId}` matching so the literal `me` route cannot be exposed as a public id.
5. Provider subscriptions are managed through `ProviderSubscriptionService`; administrative subscription review/override occurs under `/api/admin/subscriptions`.

### 5.4 ServiceLink Pro registration and organization operations

1. A business user verifies email through `/api/auth/business`; transient registration progress is represented by `RegistrationSession` and stored by `BusinessRegistrationSessionService` in Redis.
2. The authenticated business creates an organization, adds KYB details/documents, and configures workspace and Pro-user information.
3. `TeamMemberService` creates invitations. Only invitation detail lookup and invitation acceptance are public in SecurityConfig; other `/api/business/**` operations require authentication.
4. Subscription/payment services create and verify business payments, then maintain `Subscription`, payment-transaction, workspace, and organization state.
5. A business uses provider-directory and provider-pool services to browse/import/manage providers for enterprise sourcing.

### 5.5 Payment flow

1. The application creates a local transaction record before redirecting/returning a gateway initiation payload.
2. `PaymentService` (appointment/payment domain) and business subscription payment services delegate to `EsewaGatewayService` or `KhaltiGatewayService`.
3. The gateway redirect/callback returns to the frontend URL configured as `app.frontend-url`; client callback pages call the backend verification endpoint.
4. The backend validates the transaction against the configured gateway verification endpoint and secret credentials, then marks local transaction/subscription/appointment records accordingly. Payment write operations use `@Transactional` so related records change atomically.

## 6. Persistence and data boundaries

### Durable data: MySQL

Spring Data JPA repositories cover the principal aggregate families: users, KYC, appointments and payments, provider profile/services/reviews/portfolio/availability/PIN/subscriptions, notifications, and business organizations/KYB/workspaces/teams/subscriptions/payment/provider pool.

The configured JDBC database is `servicelink` on MySQL. Current local configuration uses `spring.jpa.hibernate.ddl-auto=update`, which lets Hibernate evolve the schema during development. This is convenient locally but is not a controlled production-migration strategy; production should use versioned migrations and a non-destructive DDL policy.

### Transient data: Redis

`RedisConfig` uses Lettuce and configures `RedisTemplate<String, String>` with string key/value serializers. Current consumers include:

- refresh-token storage/revocation;
- provider PIN attempt tracking;
- business registration-session serialization.

Redis is therefore an operational dependency for authentication/session-adjacent workflows even though business records remain in MySQL.

### DTO and mapper boundary

Request DTOs live under `dto/request`, responses under `dto/response`, and cache-specific payloads under `dto/cache`. Mappers are organized broadly by user, appointment, business, and admin KYC domains. This pattern is the backend's API compatibility layer: controllers should return response DTOs rather than JPA entities.

## 7. Security model and exposure rules

- **CORS:** Development origin patterns allow `http://localhost:3000` and `http://localhost:3001`; methods include GET/POST/PUT/PATCH/DELETE/OPTIONS; credentials are allowed.
- **CSRF:** Disabled because the API is built around stateless bearer-token authentication.
- **Public routes:** `/api/auth/**`, `/oauth2/**`, `/error`, WebSocket handshake `/ws/**`, KYC routes (including public status-by-reference), storage upload, selected provider GET catalog routes, and the two public business-invite actions.
- **Protected routes:** All `/api/business/**` routes other than the explicit invitation exemptions require authentication. Appointment routes require authentication and add customer/provider method guards. `/api/admin/**` requires `ADMIN`.
- **Role defense:** Category/catalog administration has both URL-level `hasRole("ADMIN")` policy and controller `@PreAuthorize` protection.
- **Current security consideration:** the WebSocket/SockJS handshake is intentionally public because it does not transport the HTTP JWT header. The implementation comments indicate private routing is performed using recipient/queue routing. Verify STOMP-level authorization and destination ownership before treating private notification queues as strongly authenticated.

## 8. Real-time, async, and external integrations

### WebSocket notifications

`WebSocketConfig` exposes a SockJS endpoint at `/ws`, accepts the local Next.js origin, uses `/app` as the application prefix, and enables Spring's in-memory broker for `/topic` and `/queue`. `NotificationService` writes a notification to MySQL first and then uses `SimpMessagingTemplate` to publish real-time updates. Because the simple broker is in-process, it is suitable for a single application instance; horizontal scaling would need an external broker or another shared messaging strategy.

### Asynchronous email

`@EnableAsync` activates asynchronous work, and multiple `EmailService` methods use `@Async`. The configured task executor has a core size of 2 and maximum size of 5. Email uses Gmail SMTP/TLS settings sourced from `MAIL_USERNAME` and `MAIL_PASSWORD`.

### Storage

`StorageService` is an abstraction implemented by `SupabaseStorageService`. Runtime configuration takes `SUPABASE_URL`, `SUPABASE_BUCKET`, and `SUPABASE_API_KEY`. Multipart limits are 10 MB per file and 10 MB per request.

### Identity and communications

- Google OAuth2 client login requires `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
- Google Calendar integration uses the Google Calendar API and optional `GOOGLE_CALENDAR_REFRESH_TOKEN`.
- Twilio communication requires `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, sender/content IDs; WhatsApp configuration is also present.
- Sparrow SMS is scaffolded with token/from settings; the current properties file leaves its token blank.

## 9. Maven dependencies and what they do

| Dependency | Purpose in this backend |
| --- | --- |
| `spring-boot-starter-web` | REST controllers, JSON serialization, multipart HTTP support. |
| `spring-boot-starter-data-jpa` + `mysql-connector-j` | ORM persistence and MySQL connectivity. |
| `spring-boot-starter-validation` | Bean-validation support for API request DTOs. |
| `spring-boot-starter-security` (transitive through project use/configuration) | Security filter chain, authorization and password encoding infrastructure. |
| `io.jsonwebtoken:jjwt-*` | JWT creation and verification. |
| `spring-boot-starter-data-redis` | Redis access via Lettuce and `RedisTemplate`. |
| `spring-boot-starter-websocket` | STOMP/SockJS WebSocket messaging. |
| `spring-boot-starter-mail` | SMTP email notifications. |
| `spring-boot-starter-oauth2-client` | Google OAuth2 client login. |
| `com.google.apis:google-api-services-calendar` and Google auth library | Google Calendar integration and OAuth token handling. |
| `com.twilio.sdk:twilio` | Twilio-based WhatsApp/OTP messaging. |
| `dev.samstevens.totp:totp` | Time-based one-time-password support for 2FA. |
| `org.springdoc:springdoc-openapi-starter-webmvc-ui` | OpenAPI documentation/UI support. |
| `org.apache.httpcomponents.client5:httpclient5` | HTTP client used for remote API/gateway interaction. |
| `commons-codec` | Encoding/cryptographic utility support. |
| `me.paulschwarz:spring-dotenv` | Optional `.env` import for local development. |
| `lombok` | Boilerplate-reduction annotations during compilation. |
| `spring-boot-devtools` | Optional development-time reload tooling. |
| `spring-boot-starter-data-jpa-test` | Test-scoped JPA test support. |

## 10. Configuration checklist

Create `backend/.env` or provide equivalent process environment variables. `application.properties` imports `.env` optionally, so missing values may fail only when the relevant feature initializes or is invoked.

| Area | Required/configured values |
| --- | --- |
| MySQL | `DB_PASSWORD`; set the JDBC URL/user if local defaults differ. |
| JWT | `JWT_SECRET_KEY`, `JWT_EXPIRATION`, `JWT_REFRESH_EXPIRATION`. |
| Email | `MAIL_USERNAME`, `MAIL_PASSWORD`. |
| Google login/calendar | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, optionally `GOOGLE_CALENDAR_REFRESH_TOKEN`. |
| Supabase storage | `SUPABASE_URL`, `SUPABASE_BUCKET`, `SUPABASE_API_KEY`. |
| eSewa | `ESEWA_MERCHANT_CODE`, `ESEWA_BASE_URL`, `ESEWA_VERIFY_URL`, `ESEWA_SECRET_KEY`. |
| Khalti | `KHALTI_SECRET_KEY`, `KHALTI_BASE_URL`, `KHALTI_VERIFY_URL`, `KHALTI_WEBSITE_URL`. |
| Twilio/WhatsApp | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `TWILIO_WHATSAPP_CONTENT_SID`, optionally `WHATSAPP_BUSINESS_NUMBER`. |
| Redis | Host/port default to `localhost:6379`; change `spring.data.redis.*` for a remote instance. |

Never commit actual values for credentials, database passwords, JWT secrets, gateway secrets, or storage API keys.

## 11. Local startup and verification

1. Start MySQL and create the `servicelink` database (or change the configured datasource URL).
2. Start Redis on the configured host and port.
3. Set the environment variables above for the features you intend to exercise.
4. From `backend`, run `./mvnw spring-boot:run` on Unix-like shells or `./mvnw.cmd spring-boot:run` in PowerShell/Windows.
5. Start the Next.js client from `frontend/servicelink` with `npm run dev` if testing browser flows.
6. Check the generated Springdoc/OpenAPI endpoint/UI in the running application, then smoke-test public auth/catalog endpoints before protected flows.
7. For authenticated routes, send `Authorization: Bearer <access-token>` and use the correct role. Test payment flows only against sandbox credentials.

## 12. Maintenance notes and implementation constraints

- The global error handler intentionally translates validation, business/application, conflict, missing-resource, unsupported-method, data-integrity, and generic exception classes to stable client responses.
- The codebase uses `@Transactional` heavily in appointment, payment, provider, KYC, notification, and business workflows. Keep database mutations inside service-level transactions rather than controllers.
- Local configuration enables verbose SQL/security logging (`TRACE` security and SQL/binding logging). Reduce those levels outside development to avoid noisy logs and sensitive operational detail.
- CORS and the WebSocket allowed origin are local-development values. Replace them with explicit production origins during deployment.
- `ddl-auto=update` is intended for developer convenience; introduce Flyway/Liquibase-style migrations before production schema evolution.
- The top-level README states Java 21, but the backend Maven property is Java 17. Treat `pom.xml` as the current source of truth unless the build is deliberately upgraded.

## 13. Suggested reading order for backend contributors

1. `CoreApplication`, `application.properties`, and `pom.xml` for the runtime/dependency baseline.
2. `SecurityConfig`, `JwtAuthenticationFilter`, `JwtService`, and `OAuth2LoginSuccessHandler` for request identity and route exposure.
3. A controller/service/repository/DTO/mapper set in the feature you are changing.
4. The related JPA entities and enums before altering workflow behavior.
5. `GlobalExceptionHandler` before adding a new error type.
6. `PaymentService` plus the relevant gateway service for payment changes; `NotificationService` and `WebSocketConfig` for user-visible events.

This order keeps changes aligned with the existing layered architecture and prevents accidentally exposing protected routes, returning entities directly, or bypassing payment/notification workflow rules.
