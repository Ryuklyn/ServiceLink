# 🔧 TECHNICAL INTEGRATION SPECIFICATION

## Backend Refactoring Details

### ❌ Issue #1: PaymentTransaction Missing @PrePersist

**File:** `backend/src/main/java/com/servicelink/core/model/business/PaymentTransaction.java`
**Current:**

```java
@PrePersist
protected void create(){
    // EMPTY - BUG!
}
```

**Fix:**

```java
@PrePersist
protected void create(){
    initiatedAt = LocalDateTime.now();
}
```

### ❌ Issue #2: SubscriptionService Incomplete

**File:** `backend/src/main/java/com/servicelink/core/service/business/SubscriptionService.java`
**Missing Methods:**

1. `generateReferenceId()` - Should return format: "SLP-2026-019502"
2. `toResponse()` - Should map Subscription entity to SubscriptionResponse DTO

**Suggested Implementation:**

```java
private String generateReferenceId() {
    String ref = "SLP-" + Year.now().getValue() + "-"
        + String.format("%06d", REF_COUNTER.incrementAndGet());
    return ref;
}

private SubscriptionResponse toResponse(Subscription subscription) {
    return SubscriptionResponse.builder()
            .id(subscription.getId())
            .workspaceId(subscription.getWorkspace().getId())
            .planType(subscription.getPlanType())
            .amountNpr(subscription.getAmountNpr())
            .status(subscription.getSubscriptionStatus())
            .referenceId(subscription.getReferenceId())
            .trialEndsAt(subscription.getTrialEndsAt())
            .currentPeriodStart(subscription.getCurrentPeriodStart())
            .currentPeriodEnd(subscription.getCurrentPeriodEnd())
            .createdAt(subscription.getCreatedAt())
            .build();
}
```

### ✅ Issue #3: PaymentMapper - Likely Complete

**File:** `backend/src/main/java/com/servicelink/core/mapper/business/PaymentMapper.java`
**Status:** ✅ EXISTS - Verify completeness

---

## Frontend Integration Details

### 🎯 Step 4: VerificationStep Integration

**Current Issues:**

- No backend integration
- Form data not sent to server
- File upload not handled

**Required Changes:**

```typescript
const handleSubmit = async () => {
  const formData = new FormData();

  // Add JSON data as "data" part
  formData.append(
    "data",
    JSON.stringify({
      organizationId,
      taxId,
      authorizedConfirmed: true,
    }),
    { type: "application/json" },
  );

  // Add file as "document" part
  if (selectedFile) {
    formData.append("document", selectedFile);
  }

  await api.post("/business/kyb/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
```

**Backend Endpoint:**

- POST `/api/business/kyb/submit`
- Content-Type: multipart/form-data
- Parts: "data" (JSON), "document" (File, optional)

---

### 🎯 Step 5: PlanStep Integration

**Current Issues:**

- Plan selection doesn't persist
- PaymentModal hardcoded workspace name ("TRukesh")
- No subscription creation before payment

**Required Changes:**

**Step 5a - Create Subscription:**

```typescript
const handlePaymentClick = async () => {
  try {
    // 1. Create subscription
    const subResponse = await api.post("/business/payment/subscription", {
      workspaceId,
      planType: selectedPlan.id.toUpperCase(), // "STARTER" | "GROWTH"
      amountNpr: parseInt(selectedPlan.price.replace(/\D/g, "")),
    });

    const subscriptionId = subResponse.data.id;

    // 2. Open payment modal with subscription
    setIsPaymentOpen(true);
    setSubscriptionId(subscriptionId);
  } catch (error) {
    toast.error("Failed to create subscription");
  }
};
```

---

### 🎯 Payment Flow Integration

**Current Issues:**

- PaymentModal doesn't call initiate endpoint
- PaymentRedirecting doesn't actually redirect
- No callback handling
- Payment reference ID lost between steps

**Payment Sequence:**

**1. PaymentModal - Initiate Payment:**

```typescript
const handleInitiatePayment = async (gateway: "ESEWA" | "KHALTI") => {
  try {
    const response = await api.post("/business/payment/initiate", {
      subscriptionId,
      paymentGateway: gateway,
      amountNpr: plan.amountNpr,
      successUrl: `${window.location.origin}/register/business/payment/success`,
      failureUrl: `${window.location.origin}/register/business/payment/failed`,
    });

    const { gatewayRedirectUrl, referenceId } = response.data;

    // Store in localStorage for callback
    localStorage.setItem("paymentReference", referenceId);

    // Redirect to gateway
    window.location.href = gatewayRedirectUrl;
  } catch (error) {
    toast.error("Payment initiation failed");
  }
};
```

**2. Payment Gateway → Callback:**

- eSewa/Khalti will redirect user with `?data=<encoded>` or `?pidx=X&status=Y`
- Backend processes callback at:
  - `GET /api/business/payment/esewa/callback?data=...`
  - `GET /api/business/payment/khalti/callback?pidx=...`

**3. PaymentSuccess/Failure:**

- Frontend receives redirect with reference ID
- Display confirmation
- Offer dashboard navigation

---

## 🗂️ Files to Create/Modify

### NEW FILES

1. `contexts/BusinessSetupContext.tsx` - Global state management
2. `pages/register/business/payment/failed.tsx` - Payment failure page
3. `hooks/useBusinessSetup.ts` - Custom hook for context usage

### MODIFY FILES

1. `components/business/VerificationStep.tsx` - Add KYB integration
2. `components/business/PlanStep.tsx` - Add Subscription integration
3. `components/business/payment/PaymentModal.tsx` - Add Payment initiate
4. `components/business/payment/PaymentRedirecting.tsx` - Add redirect logic
5. `components/business/payment/PaymentSuccess.tsx` - Add callback handling
6. `app/register/business/page.tsx` - Wrap with BusinessSetupProvider
7. (Backend) `PaymentTransaction.java` - Fix @PrePersist
8. (Backend) `SubscriptionService.java` - Complete methods

---

## API Request/Response Examples

### 1. Create Organization

```json
POST /api/business/organization
{
  "companyName": "Tech Corp",
  "businessType": "OFFICE",
  "companySize": "SIZE_11_50",
  "workEmail": "ops@techcorp.com",
  "contactNumber": "+977-9812345678"
}

RESPONSE:
{
  "id": 1,
  "companyName": "Tech Corp",
  "businessType": "OFFICE",
  ...
}
```

### 2. Create Workspace

```json
POST /api/business/workspace
{
  "organizationId": 1,
  "name": "Operations Hub",
  "primaryBranchLocation": "Kathmandu, Nepal",
  "preferredServices": ["HVAC", "Electrical"]
}

RESPONSE:
{
  "id": 2,
  "organizationId": 1,
  "name": "Operations Hub",
  ...
}
```

### 3. Create ProUser

```json
POST /api/business/pro-user/create
{
  "workspaceId": 2,
  "fullName": "John Doe",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}

RESPONSE:
{
  "id": 3,
  "workspaceId": 2,
  "fullName": "John Doe",
  ...
}
```

### 4. Submit KYB

```http
POST /api/business/kyb/submit
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="data"; filename="blob"
Content-Type: application/json

{"organizationId": 1, "taxId": "PAN123456", "authorizedConfirmed": true}

--boundary
Content-Disposition: form-data; name="document"; filename="doc.pdf"
Content-Type: application/pdf

[binary file data]
--boundary--

RESPONSE:
{
  "id": 4,
  "organizationId": 1,
  "taxId": "PAN123456",
  "status": "PENDING",
  ...
}
```

### 5. Create Subscription

```json
POST /api/business/payment/subscription
{
  "workspaceId": 2,
  "planType": "GROWTH",
  "amountNpr": 4999
}

RESPONSE:
{
  "id": 5,
  "workspaceId": 2,
  "planType": "GROWTH",
  "amountNpr": 4999,
  "status": "TRIAL",
  "referenceId": "SLP-2026-019502",
  ...
}
```

### 6. Initiate Payment

```json
POST /api/business/payment/initiate
{
  "subscriptionId": 5,
  "paymentGateway": "ESEWA",
  "amountNpr": 4999,
  "successUrl": "http://localhost:3001/register/business/payment/success",
  "failureUrl": "http://localhost:3001/register/business/payment/failed"
}

RESPONSE:
{
  "referenceId": "SLP-2026-019502",
  "gatewayRedirectUrl": "https://esewa.com.np/api/epay/main/v2/form?amount=4999&...",
  "gateway": "ESEWA",
  "status": "INITIATED"
}
```

### 7. Payment Callback (eSewa)

```http
GET /api/business/payment/esewa/callback?data=eyJ0cmFuc2FjdGlvbl91dWlkIjoiU0xQLTIwMjYtMDE5NTAyIiwic3RhdHVzIjoiQ09NUExFVEUiLCAidHJhbnNhY3Rpb25faWQiOiI0NjM2In0=

RESPONSE:
{
  "id": 6,
  "referenceId": "SLP-2026-019502",
  "status": "SUCCESS",
  "completedAt": "2026-05-22T10:30:00"
}
```

---

## 🔐 Error Handling

### Common Errors & Solutions

| Error                    | Cause                                    | Solution                             |
| ------------------------ | ---------------------------------------- | ------------------------------------ |
| 400 Bad Request          | Invalid payload                          | Verify field types & required fields |
| 404 Not Found            | organizationId/workspaceId doesn't exist | Check IDs from previous steps        |
| 409 Conflict             | Duplicate subscription for workspace     | Only one subscription per workspace  |
| 422 Unprocessable Entity | Multipart format wrong                   | Use FormData API correctly           |
| 500 Server Error         | Backend exception                        | Check backend logs                   |

### Frontend Error Handling Pattern

```typescript
try {
  const response = await api.post(endpoint, payload);
  // handle success
} catch (error) {
  if (error.response?.status === 400) {
    toast.error("Validation failed: " + error.response.data.message);
  } else if (error.response?.status === 404) {
    toast.error("Resource not found");
  } else {
    toast.error("An error occurred: " + error.message);
  }
}
```

---

## Testing Checklist

### Unit Tests

- [ ] OrganizationStep validates input
- [ ] WorkspaceStep validates input
- [ ] AdminStep validates password strength
- [ ] VerificationStep handles file upload
- [ ] PlanStep calculates amounts correctly

### Integration Tests

- [ ] Full flow: Org → Workspace → ProUser → Verification → Plan
- [ ] Subscription creation with correct amounts
- [ ] Payment redirect URL generated correctly
- [ ] Payment callback processed successfully

### Manual Testing

- [ ] Submit with valid data end-to-end
- [ ] Test with invalid data (field validation)
- [ ] Test network errors (backend down)
- [ ] Test payment abort/return from gateway
- [ ] Test localStorage persistence on refresh
