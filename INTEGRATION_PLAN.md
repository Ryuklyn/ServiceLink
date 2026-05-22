# 📋 ServiceLink Frontend-Backend Integration Plan

## Overview

Complete integration of the 5-step business onboarding flow with full payment processing and state management.

---

## 🔍 BACKEND ANALYSIS & REFACTORING NEEDED

### ✅ Current Working Endpoints

- `POST /api/business/organization` - Create organization
- `POST /api/business/workspace` - Create workspace
- `POST /api/business/pro-user/create` - Create pro user (admin)
- `POST /api/business/kyb/submit` - Submit business verification
- `POST /api/business/payment/subscription` - Create subscription
- `POST /api/business/payment/initiate` - Initiate payment (returns redirect URL)
- `GET /api/business/payment/esewa/callback` - eSewa callback handler
- `GET /api/business/payment/khalti/callback` - Khalti callback handler

### 🔧 Backend Refactoring Needed

#### 1. **PaymentTransaction Entity** - Missing @PrePersist Initialization

**Location:** `model/business/PaymentTransaction.java`
**Issue:** `initiatedAt` field not auto-populated on creation

```java
@PrePersist
protected void onCreate() {
    initiatedAt = LocalDateTime.now();
}
```

#### 2. **SubscriptionService** - Missing Return Statement

**Location:** `service/business/SubscriptionService.java`
**Issue:** `generateReferenceId()` and `toResponse()` methods incomplete
**Impact:** Subscription creation will fail

#### 3. **Payment Flow** - No Reference ID Persistence

**Location:** `payment/service/PaymentService.java`
**Issue:** Payment callback needs to link back to subscription
**Fix:** Ensure subscription.referenceId matches payment.referenceId

#### 4. **PaymentMapper** - Verify All Mappers Exist

**Location:** `mapper/business/PaymentMapper.java`
**Status:** Needs verification

---

## 📱 FRONTEND INTEGRATION ROADMAP

### Phase 1: State Management & Context Setup

Create a `BusinessSetupContext` to persist data across all 5 steps:

```typescript
{
  organizationId: number | null;
  workspaceId: number | null;
  workspaceName: string;
  subscriptionId: number | null;
  planType: string;
  paymentReferenceId: string;
  proUserId: number | null;
}
```

### Phase 2: Individual Component Integration

#### Step 1️⃣: **OrganizationStep.tsx**

Status: ✅ **DONE** - Already integrated

- Calls: `POST /api/business/organization`
- Returns: `organizationId`
- Persists to context

#### Step 2️⃣: **WorkspaceStep.tsx**

Status: ✅ **DONE** - Already integrated

- Calls: `POST /api/business/workspace`
- Requires: `organizationId`
- Returns: `workspaceId`
- Persists to context

#### Step 3️⃣: **AdminStep.tsx** (ProUser)

Status: ✅ **DONE** - Already integrated

- Calls: `POST /api/business/pro-user/create`
- Requires: `workspaceId`
- Returns: `proUserId`
- Persists to context

#### Step 4️⃣: **VerificationStep.tsx** (KYB)

Status: ❌ **NEEDS INTEGRATION**

- Calls: `POST /api/business/kyb/submit` (multipart FormData)
- Requires: `organizationId`
- Returns: `kybId, status`
- Payload Structure:
  ```typescript
  {
    organizationId: number;
    taxId: string;
    authorizedConfirmed: boolean;
    documentFile: File; // MultipartFile on backend
  }
  ```

#### Step 5️⃣: **PlanStep.tsx**

Status: ❌ **NEEDS INTEGRATION**

- Calls: `POST /api/business/payment/subscription`
- Requires: `workspaceId`, `planType` (STARTER/GROWTH/ENTERPRISE)
- Returns: `subscriptionId`
- Payload Structure:
  ```typescript
  {
    workspaceId: number;
    planType: "STARTER" | "GROWTH" | "ENTERPRISE";
    amountNpr: number; // 1999, 4999, etc.
  }
  ```

### Phase 3: Payment Flow Integration

#### **PaymentModal.tsx** (New/Refactor)

- Step 1: Create subscription → get `subscriptionId`
- Step 2: Call `POST /api/business/payment/initiate`
  - Payload:
    ```typescript
    {
      subscriptionId: number;
      paymentGateway: "ESEWA" | "KHALTI";
      amountNpr: number;
      successUrl: string;
      failureUrl: string;
    }
    ```
  - Response:
    ```typescript
    {
      referenceId: string;
      gatewayRedirectUrl: string;
      gateway: string;
      status: string;
    }
    ```
- Step 3: Redirect to `gatewayRedirectUrl`

#### **PaymentRedirecting.tsx**

- Show loading spinner while redirecting
- Display order summary (workspace name, plan, amount, reference ID)
- **No backend call needed** - just UI state

#### **PaymentSuccess.tsx**

- Triggered when: `/payment/success?reference_id=<ref>&status=COMPLETE`
- Backend will handle callback auto-verification
- Show:
  - ✅ Success checkmark
  - Order details from context
  - Receipt download button
  - Dashboard navigation button

#### **PaymentFailure.tsx** (New Component)

- Triggered when: `/payment/failed?reference_id=<ref>&status=FAILED`
- Show: Error message + Retry button
- Call: `POST /api/business/payment/initiate` again

---

## 🛠️ Integration Steps Breakdown

### Step 1: Backend Refactoring (5 minutes)

1. Fix PaymentTransaction @PrePersist
2. Complete SubscriptionService methods
3. Verify PaymentMapper exists and is complete

### Step 2: Create Context Provider (10 minutes)

Create `BusinessSetupProvider.tsx` with:

- State for all 5 steps
- Methods to update each step
- localStorage persistence

### Step 3: Integrate VerificationStep (15 minutes)

- Add FormData handling for file upload
- Call KYB endpoint
- Handle multipart request

### Step 4: Integrate PlanStep (10 minutes)

- Call Subscription endpoint
- Store subscriptionId in context
- Pass data to PaymentModal

### Step 5: Integrate Payment Flow (25 minutes)

- PaymentModal: Initiate payment request
- PaymentRedirecting: Handle redirect
- PaymentSuccess/Failure: Handle callbacks
- Setup callback URL routing

### Step 6: State Management & Navigation (15 minutes)

- Connect all components with context
- Handle localStorage persistence
- Setup navigation between steps
- Handle error fallbacks

### Step 7: Testing & Validation (20 minutes)

- Test each endpoint with Postman first
- Test full flow in browser
- Verify payment redirect works
- Test callback handling

---

## 📝 Backend Endpoint Summary

| Endpoint                             | Method           | Payload                | Response                   | Notes    |
| ------------------------------------ | ---------------- | ---------------------- | -------------------------- | -------- |
| /api/business/organization           | POST             | OrganizationRequest    | OrganizationResponse       | Step 1   |
| /api/business/workspace              | POST             | WorkspaceRequest       | WorkspaceResponse          | Step 2   |
| /api/business/pro-user/create        | POST             | ProUserRequest         | ProUserResponse            | Step 3   |
| /api/business/kyb/submit             | POST (multipart) | KybRequest + File      | KybResponse                | Step 4   |
| /api/business/payment/subscription   | POST             | SubscriptionRequest    | SubscriptionResponse       | Step 5a  |
| /api/business/payment/initiate       | POST             | PaymentInitiateRequest | PaymentInitiateResponse    | Step 5b  |
| /api/business/payment/esewa/callback | GET              | query params           | PaymentTransactionResponse | Callback |

---

## 🎯 Data Flow Diagram

```
OrganizationStep
    ↓ organizationId
WorkspaceStep
    ↓ workspaceId, workspaceName
AdminStep
    ↓ proUserId
VerificationStep
    ↓ kybId
PlanStep
    ↓ subscriptionId, planType
PaymentModal
    ↓ initiates payment
PaymentRedirecting
    ↓ redirects to gateway
[eSewa/Khalti Payment Page]
    ↓ callback
PaymentSuccess/Failure
    ↓ completes setup
Dashboard
```

---

## ⚠️ Important Notes

1. **Reference IDs**: Must be consistent across Subscription and PaymentTransaction
2. **State Persistence**: Use localStorage to survive page refresh
3. **Error Handling**: Implement retry logic for failed payments
4. **Redirect URLs**: Must match frontend URLs in payment config
5. **CORS**: Ensure backend allows frontend origin
6. **Timestamps**: All entities auto-track createdAt/updatedAt

---

## 📊 Status Checklist

- [ ] Backend refactoring complete
- [ ] Context provider created
- [ ] VerificationStep integrated
- [ ] PlanStep integrated
- [ ] PaymentModal refactored
- [ ] PaymentRedirecting completed
- [ ] PaymentSuccess handler implemented
- [ ] PaymentFailure component created
- [ ] Full end-to-end testing passed
- [ ] Postman tests documented
