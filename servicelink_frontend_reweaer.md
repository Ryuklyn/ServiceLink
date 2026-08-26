# ServiceLink Frontend Architecture Reference

> **Scope.** This document describes the frontend implementation in `frontend/servicelink/`: its routing, layouts, components, state management, API clients, browser integrations, dependencies, and development constraints. It describes the code currently in the repository, including areas where parallel patterns coexist.

## 1. Frontend at a glance

ServiceLink's frontend is a TypeScript **Next.js 16.2.4** application using the App Router and React **19.2.4**. It is a multi-role web client for public marketplace pages, customer accounts, provider operations, platform administration, and ServiceLink Pro business operations.

```text
Browser
  |
  +-- Next.js App Router
  |     app/ pages + route groups + nested layouts
  |
  +-- React client components
  |     forms, dashboards, modals, maps, live notifications
  |
  +-- State
  |     Redux store feature slices + a BusinessSetup React context
  |
  +-- HTTP / real time
        Axios API clients ---> Spring Boot /api backend
        SockJS + STOMP ------> Spring Boot /ws notification endpoint
        Leaflet -------------> browser-rendered maps
```

**Runtime facts**

- Package name: `servicelink`; private application package.
- Development command: `npm run dev`; production build: `npm run build`; production server: `npm run start`; lint: `npm run lint`.
- TypeScript uses strict mode, no emitted JS (`noEmit: true`), bundler module resolution, and the `@/*` alias for the frontend root.
- Backend URL: `NEXT_PUBLIC_API_URL` when supplied; otherwise API clients default to `http://localhost:8080/api`.
- The root layout mounts the Redux provider and one global `react-toastify` toast container.

## 2. Source layout and responsibilities

```text
frontend/servicelink/
├── app/                         Next.js routes, route groups, layouts, global CSS
├── components/                  Reusable UI, grouped by business/role/feature
├── contexts/                    React Context for cross-step business setup state
├── data/                        Static app data (home and Nepal data)
├── hooks/                       Client hooks: logout, business setup, notifications
├── lib/
│   ├── api/                     Typed endpoint modules and Axios client implementation
│   ├── constants/               Shared constants
│   ├── hooks/                   Reusable async and portfolio hooks
│   ├── navigation/              Provider navigation definitions
│   └── validators/              Zod validation schemas
├── public/                      Static assets and application images
├── services/                    Feature service wrapper(s), e.g. appointments
├── store/                       Redux store, typed hooks, feature slices
├── types/                       Shared TypeScript domain types
├── utils/                       API compatibility helpers, payment helpers, display utilities
├── next.config.ts               Next.js remote image allow-list
├── globals.css                  Tailwind import, design tokens, global styling
└── package.json                 Scripts and dependency declarations
```

The normal UI request path is:

1. An App Router page renders within the route's matching layout.
2. A feature component reads local React state or Redux state, renders UI, and validates form input where relevant.
3. A thunk, API module, or service calls an Axios client.
4. The client resolves the configured backend base URL, attaches a browser-stored token when required, and converts failures into a typed `ApiError`.
5. Redux thunks update feature state, or the component updates local/context state.
6. The component shows UI feedback; the global toast container can surface notifications.

## 3. Routing architecture

### 3.1 Root layout

`app/layout.tsx` is the application shell. It imports global CSS and React Toastify styles, loads Geist/Geist Mono/Montserrat via `next/font`, wraps all routes in `store/Providers`, and renders the global toast container. This makes the Redux store available application-wide.

### 3.2 Public/main route group

`app/(main)/layout.tsx` provides the public marketing shell: shared `Navbar`, central `main`, and `Footer`. The parentheses make `(main)` a route group, so it does not appear in URLs.

| Routes | Purpose |
| --- | --- |
| `/` | Main landing page assembled from home-section components. |
| `/aboutus`, `/services`, `/becomeprovider`, `/servicelinkpro` | Public marketing and discovery pages. |
| `/login`, `/register` | Public account-entry choices. |

### 3.3 Account, registration, and callback routes

| Route family | Purpose |
| --- | --- |
| `/register/user`, `/register/provider` | Role-specific registration. |
| `/register/business` | Multi-step ServiceLink Pro setup, with payment success/failure pages. |
| `/login/user/**` | User sign-in, OTP verification, 2FA verification, password reset. |
| `/login/provider` | Provider authentication. |
| `/login/business/**` | Business sign-in, OTP, password reset, and team invitation acceptance. |
| `/oauth/callback` | OAuth redirect completion. |
| `/payment/callback` | Payment-return handling. |
| `/verify/[ref]`, `/kyc/status`, `/kyc/receipt` | Public KYC/reference and KYC receipt surfaces. |

Dynamic segments are represented by brackets. For example, `[ref]` captures a KYC reference and payment reschedule callbacks use `[appointmentId]/[gateway]`. The provider subscription `[[...status]]` route is an optional catch-all, allowing callback/status variants under one route.

### 3.4 Role dashboard route families

| Family | Layout and responsibilities | Main pages |
| --- | --- | --- |
| `/dashboard/user` | Client-side layout checks `localStorage.accessToken`, renders `UserSidebar`, mobile overlay/navigation, `SearchBar`, and `OnboardingGate`. | Home, explore/profile, map, bookings/review/track/reschedule callback, notifications, settings/security. |
| `/dashboard/provider` | Client-side provider shell loads profile/subscription data, starts live notifications, renders provider sidebar/navbar, and displays the onboarding wizard until complete. | Home, bookings, analytics, earnings, profile, referral, notifications, settings, subscription/callback. |
| `/dashboard/admin` | Responsive admin shell with `Sidebar` and `TopHeader`. | Admin home, KYC, categories, B2B, escrow, provider subscriptions. |
| `/dashboard/business` | Server-compatible ServiceLink Pro shell with `ProSidebar` and `ProNavbar`. | Pro home, jobs, provider pool/directory, compliance, SLA, billing, settings. |

## 4. Component architecture

Components are grouped primarily by product area, not by generic atomic-design tiers. This makes domain ownership apparent and lets each dashboard keep its own navigation, cards, modals, and forms.

| Directory | Responsibility |
| --- | --- |
| `components/home` | Landing-page sections: hero, categories, features, testimonials, CTA, ServiceLink Pro promotion. |
| `components/layout` | Public navigation and footer. |
| `components/ui` | Small shared display primitives such as `ServiceCard` and `StarRating`. |
| `components/shared` | Cross-area controls, currently including WhatsApp action behavior. |
| `components/forgetpassword` | Shared shell and progress indicator for password recovery. |
| `components/kyc` | KYC wizard steps, OTP input, status display, receipt modal/content/PDF utility. |
| `components/business` | Business registration wizard steps and payment presentation components. |
| `components/provider/auth` | Provider device-PIN set/verify UI. |
| `components/dashboard/user` | Customer dashboard, booking UX, provider discovery, profile booking UI, map, onboarding, and settings modals. |
| `components/dashboard/provider` | Provider dashboard, profile tabs, availability/services/security, booking UI, notification UI, onboarding wizard. |
| `components/dashboard/admin` | Admin layout/widgets, KYC decision/detail UI, category and subscription controls. |
| `components/dashboard/business` | ServiceLink Pro dashboard, operational cards, navigation, SLA/provider-health views. |

Feature-level composition is visible in the provider profile explorer: `ProfileHero`, credentials, reviews, pricing, portfolio, availability calendar, coverage map, issue description, and booking sidebar each own one subsection instead of concentrating a large provider-detail page in one file.

## 5. Layout, styling, assets, and rendering

### Global styling

`app/globals.css` imports Tailwind CSS v4 and defines application design tokens:

- primary brand: `#1e3a8a`;
- accent: `#e8683f`, with a darker hover color;
- body font: DM Sans with Geist fallback;
- heading font: Outfit;
- custom visual styles including progress bar, experience slider, and animation rules.

Components predominantly use Tailwind utility classes directly. Global CSS should be reserved for cross-cutting design tokens, typography, shared browser control styling, and globally reusable animations.

### Fonts and image policy

The root layout uses Next.js font optimization for Geist, Geist Mono, and Montserrat. `next.config.ts` allows optimized remote images only from Google profile-image hosting and the configured Supabase public-storage host/path. Add a remote host to `images.remotePatterns` before using it with `next/image`.

### Client-only map rendering

Leaflet depends on browser APIs, so maps are dynamically loaded with `next/dynamic` and `ssr: false`. This pattern appears in user map/tracking views, coverage map, booking sidebar, and provider account map usage. Any future browser-only integration should follow this pattern rather than being imported eagerly into a server-rendered route.

## 6. State management

### 6.1 Global Redux state

`store/index.ts` constructs one Redux store with `configureStore`; `store/Providers.tsx` is a client component that supplies it at the root. `store/hooks.ts` provides typed dispatch/selector hooks for components.

| Slice | State/function responsibility |
| --- | --- |
| `user` | Current user account/profile state. |
| `authFlow` | Temporary login/verification flow state. |
| `onboarding` | Customer onboarding UI/workflow state. |
| `kyc` | KYC submission/status flow. |
| `providerProfile` | Provider self-profile and onboarding-completion status. |
| `providerOnboarding` | Provider wizard progress. |
| `providerServices` | Provider service/category selections. |
| `providerAvailability` | Provider schedule, slots, and availability UI state. |
| `providerBookings` | Provider booking data and actions. |
| `providerSubscription` | Provider subscription state. |
| `notifications` | Paginated notification items, unread count, loading state, REST thunks, and real-time event reducer. |
| `proSession` | ServiceLink Pro/business session state. |
| `categoriesAdmin` | Admin category/catalog management. |
| `adminSubscription` | Provider-subscription administration state. |
| `providerDirectory`, `providerPool` | ServiceLink Pro directory and provider-pool state. |
| `ui` | Shared application UI state. |

Async Redux work uses `createAsyncThunk`. The notification slice is a representative pattern: it fetches a paginated list/unread count, marks notifications read, and unshifts WebSocket-delivered notifications via `receiveRealtimeNotification`.

### 6.2 Business setup context

`BusinessSetupContext` is a separate React Context for the sequential business-registration wizard. It holds organization, workspace, Pro-user, KYB, subscription, and payment identifiers/statuses. It reloads from local/session storage after client mount, writes draft state to `localStorage`, calculates the current registration step, and clears all related browser storage on reset.

Use this context for transient wizard coordination. Use Redux for shared domain state that needs to be accessed independently by multiple feature areas or refreshed from the backend.

### 6.3 Local component state

Responsive drawer state, modal visibility, filters, form fields, and other page-local concerns use React `useState`/`useEffect`. Dashboard layouts illustrate the boundary: the sidebar open/close value is local; profile, subscription, notifications, and backend-derived onboarding state live in Redux.

## 7. API layer and browser authentication

### 7.1 API modules

`lib/api` groups calls by backend domain: authentication, OTP, KYC, providers, subscriptions, organization/business, storage, portfolio, device/PIN, onboarding, public/private endpoints, and smart estimator. `services/appointmentService.ts` covers appointment-specific behavior. API modules provide TypeScript request/response contracts and keep endpoint literals out of page components.

### 7.2 Two Axios implementations currently coexist

The repository has two different client paths. New code should choose deliberately and avoid mixing their storage assumptions in a single feature.

| Client location | Design | Token behavior |
| --- | --- | --- |
| `lib/api/client.ts` | Exposes authenticated, public, and status Axios instances. | Reads `token`, then `adminAccessToken` or `accessToken`; an authenticated 401 clears tokens and redirects. It does **not** perform refresh-token retry. |
| `utils/axios.ts` | Exports one default Axios instance (also re-exported as `statusClient`). | Selects normal/admin tokens based on route context, uses `accessToken`/`refreshToken` or admin equivalents, queues concurrent 401s, calls `/api/auth/refresh-token`, retries the original request, and redirects on refresh failure. |

Both default to `NEXT_PUBLIC_API_URL + /api` or `http://localhost:8080/api`, use a 15-second timeout, normalize failures into `ApiError`, and attach `Authorization: Bearer <token>` to authenticated requests. `lib/api/client.ts` additionally has a `statusClient` that adds `X-Provider-Token`.

**Maintenance rule:** Prefer a single API-client abstraction per feature. Before moving a feature between these clients, reconcile its token-key names (`token`, `accessToken`, `refreshToken`, `adminAccessToken`, `adminRefreshToken`) and its expected 401 behavior. A future consolidation should retain the queued refresh behavior while preserving public/upload/callback needs.

### 7.3 Client-side route protection

The user dashboard layout checks for `accessToken` in `localStorage` after mount and redirects missing sessions to `/login`. Other protection is handled through authentication-aware client/API logic and role-oriented backend authorization. This is a UX safeguard rather than server-side authorization; the backend remains the authoritative security layer.

Browser persistence is used for access/refresh tokens and business-setup drafts. Any code that accesses `window`, `localStorage`, or `sessionStorage` must execute in a client component or inside an effect/event handler to avoid server-render failures.

## 8. Real-time notifications

`hooks/useNotificationSocket.ts` bridges the backend notification system into Redux:

1. The provider dashboard obtains the authenticated provider profile and selects `profile.userId` as the recipient id.
2. It calls `useNotificationSocket(recipientId, "PROVIDER")`.
3. The hook opens SockJS at `http://localhost:8080/ws` and builds a STOMP client with a five-second reconnect delay.
4. On connection, it subscribes to `/user/{recipientId}/queue/notifications` and dispatches `receiveRealtimeNotification` for each JSON message.
5. `ADMIN` and `PRO` roles additionally subscribe to `/topic/admin-alerts`.
6. The effect deactivates the STOMP client on unmount or recipient/role change.

The WebSocket URL is currently hard-coded to the local backend. It should be derived from environment configuration for staging/production deployments, consistent with the HTTP API URL.

## 9. Major frontend workflows

### Customer discovery and booking

1. The customer enters `/dashboard/user/explore` and uses provider/category/filter components backed by provider API data.
2. The profile page composes public provider details, reviews, services, portfolio, coverage map, availability calendar, issue description, and booking sidebar.
3. Booking actions use appointment APIs; subsequent booking/review/tracking/rescheduling screens handle the lifecycle.
4. Gateway returns are processed through the dynamic appointment-and-gateway callback route.

### Provider operations

1. The provider layout loads profile and subscription records into Redux.
2. If onboarding is incomplete, `OnboardingWizard` overlays the dashboard and refreshes the profile after completion.
3. Profile, services, availability, booking, earnings/referral, and subscription pages use the provider-specific components/slices/API modules.
4. The layout primes notification REST data and maintains its STOMP subscription for live updates.

### Business (ServiceLink Pro) setup

1. Business registration components step through verification, organization, workspace, administrator, plan, and payment stages.
2. `BusinessSetupContext` persists server-created ids and status values as the user proceeds.
3. Payment redirect/success/failure views restore and render the relevant result.
4. Signed-in business users use the ServiceLink Pro dashboard for provider sourcing, billing, compliance, jobs, provider pool/directory, SLA, and settings.

### Administration

1. The admin login route creates the admin session expected by the API client.
2. The admin dashboard shell supplies sidebar/header navigation.
3. KYC, category/catalog, business/escrow, and provider-subscription views combine admin slices, API helpers, tables, status badges, and confirmation/detail modals.

## 10. Dependencies and why they are used

| Dependency | Role |
| --- | --- |
| `next`, `react`, `react-dom` | App Router framework and React UI runtime. |
| `typescript` | Strict static typing. |
| `tailwindcss`, `@tailwindcss/postcss` | Utility-first styling and Tailwind v4 integration. |
| `axios` | HTTP client, interceptors, token attachment, retry/error normalization. |
| `@stomp/stompjs`, `sockjs-client` | Browser STOMP subscription over SockJS for real-time notifications. |
| `leaflet`, `react-leaflet`, `@types/leaflet` | Interactive maps and map type definitions. |
| `zod` | Runtime form/input schema validation, including KYC schemas. |
| `lucide-react`, `react-icons` | Icon libraries. |
| `react-toastify` | Global toast notifications. |
| `eslint`, `eslint-config-next` | Linting baseline. |

The source also imports `@reduxjs/toolkit` and `react-redux` for application state. Verify they are declared in the frontend dependency manifest/lockfile before a clean install or CI build; they are required by the current store implementation.

## 11. Configuration and local startup

1. Install dependencies from `frontend/servicelink`: `npm install`.
2. Define `NEXT_PUBLIC_API_URL` if the backend is not `http://localhost:8080`. The value should omit the `/api` suffix because the clients append it.
3. Start the backend and ensure its CORS development policy permits the Next.js origin.
4. Run `npm run dev` and open `http://localhost:3000`.
5. Use `npm run lint` before delivery and `npm run build` to catch route/type/build issues.

For production, set the public HTTP API URL and WebSocket endpoint for the deployed backend, allow those frontend origins in backend CORS/WebSocket configuration, and update `next.config.ts` if new remote image domains are introduced.

## 12. Contributor guidance and constraints

- Place route-specific page composition in `app`; put reusable, domain-oriented pieces under the appropriate `components` feature folder.
- Use the `@/` alias rather than long relative import paths for frontend-root modules.
- Keep backend calls in `lib/api`, `services`, or Redux thunks rather than embedding Axios setup directly in presentation components.
- Preserve dynamic imports with `ssr: false` for Leaflet or any browser-only library.
- Treat client-side guards and local storage as user-experience mechanisms, not security controls. The backend must authorize every sensitive operation.
- Keep `NEXT_PUBLIC_*` values non-secret: they are intentionally embedded in browser-delivered code.
- Do not introduce a third token-storage convention or Axios client. Prefer consolidating the existing two paths with a migration plan.
- Protect responsive behavior in the dashboard layouts: user/provider/admin sidebars are designed for a fixed desktop rail and mobile overlay/drawer behavior.
- Update remote image patterns when adding a new optimized external image origin; otherwise Next.js image rendering will reject it.

## 13. Recommended reading order

1. `package.json`, `tsconfig.json`, `next.config.ts`, and `app/layout.tsx` for runtime, compiler, global-state, and image rules.
2. `app/(main)/layout.tsx` and the four dashboard layouts for navigation boundaries and client/server assumptions.
3. `store/index.ts`, typed hooks, and the slice closest to your feature.
4. The corresponding `lib/api` module or `services` file, then the selected Axios client implementation.
5. The feature page and its component directory.
6. `globals.css` and public assets for visual work; `useNotificationSocket` for any feature that needs live notification behavior.

Following this order maintains the existing separation between route composition, feature UI, global state, network access, and browser-only integrations.
