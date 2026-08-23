# Security Policy & Architecture Audit — Mini D-Mart

This document outlines the security architecture, threat model mitigations, authentication mechanisms, and authorization boundaries implemented in the **Mini D-Mart** application.

---

## 1. Authentication & Identity Management

### 1.1 Stateless JWT Architecture
- Authentication uses stateless **JSON Web Tokens (JWT)** signed via HMAC-SHA256 (`Keys.hmacShaKeyFor`).
- Tokens include user subject (email), role authority claim, issued-at timestamp, and strict expiration date (default: 24 hours).
- The `JwtAuthenticationFilter` intercepts incoming requests, verifies signature integrity against `app.jwt.secret`, validates non-expiration, and loads the `UserPrincipal` into Spring Security's `SecurityContextHolder`.

### 1.2 Password Security
- All user passwords are encrypted using **BCrypt** (`org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder`) with secure salting before storage in the database.
- Raw passwords are never logged, transmitted in responses, or stored in plaintext.
- Registration enforces a minimum password length of 6 characters with client and server-side validation.

---

## 2. Role-Based Access Control (RBAC)

The application enforces a 4-tier hierarchical Role-Based Access Control model:
- `CUSTOMER` — Public browsing, shopping cart, checkout, viewing own orders, submitting own return requests.
- `STAFF` — Store order fulfillment queue, advancing order statuses (`PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `DELIVERED`), inspecting returns, restocking items.
- `MANAGER` — Product creation and pricing updates, category management, pickup slot capacity configuration, revenue analytics.
- `ADMIN` — System-wide control, user role elevation/demotion, account suspension, product deletion, immutable security audit log access.

### 2.1 Defense-in-Depth Authorization
Authorization is enforced at multiple layers:
1. **Spring Security URL Filter Matchers** (`SecurityConfig.java`):
   - `/api/auth/**` — Permit all
   - `/api/products/**` (GET), `/api/categories/**` (GET), `/api/pickup-slots/**` (GET) — Permit all
   - `/api/staff/**` — Requires `hasAnyRole('STAFF', 'MANAGER', 'ADMIN')`
   - `/api/manager/**` — Requires `hasAnyRole('MANAGER', 'ADMIN')`
   - `/api/admin/**` — Requires `hasRole('ADMIN')`
2. **Method-Level Annotations**:
   - `@EnableMethodSecurity` with `@PreAuthorize` on individual controller methods.
3. **Frontend Route Guards**:
   - `ProtectedRoute` and `RoleRoute` prevent unauthorized UI navigation.

---

## 3. IDOR Prevention & Resource Ownership Validation

To prevent **Insecure Direct Object References (IDOR)**, the backend strictly verifies ownership before returning or modifying customer data:
- `OrderService.getOrderById(id)`: Verifies that the order belongs to `SecurityUtils.getCurrentUserEmail()` unless the caller possesses `STAFF` or higher role.
- `OrderService.cancelOrder(id)`: Enforces that customers can only cancel their own orders.
- `ReturnExchangeService.createRequest()`: Verifies that the order and item belong to the calling customer.
- `CartService.updateCartItemQuantity()`: Enforces that the item belongs to the caller's active cart.

Attempts by Customer A to query or mutate Customer B's resources are rejected immediately with **HTTP 403 Forbidden**.

---

## 4. Input Validation & Error Handling

- **DTO Validation**: Controller request bodies are validated using Jakarta Validation annotations (`@NotNull`, `@NotBlank`, `@Email`, `@Min`, `@Valid`).
- **Atomic Operations & Concurrency**:
  - Stock updates and reservations during checkout execute within `@Transactional` boundaries to prevent race conditions and overselling.
- **Global Exception Handling** (`GlobalExceptionHandler.java`):
  - Returns standardized, sanitized JSON error payloads (`ErrorResponse`) without leaking internal stack traces or database structures.
  - Correct HTTP status codes are mapped: `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `409 Conflict`, `500 Internal Server Error`.

---

## 5. Network & Cross-Origin Security (CORS)

- CORS is explicitly configured in `SecurityConfig.java` via `UrlBasedCorsConfigurationSource`.
- Allowed origins are dynamically loaded from `CORS_ALLOWED_ORIGINS` (defaults to trusted local and production frontend hosts).
- Allowed HTTP methods: `GET, POST, PUT, PATCH, DELETE, OPTIONS`.
- Exposed headers are limited to `Authorization`.
- CSRF is disabled appropriately for the stateless REST API.

---

## 6. Immutable Security Audit Logging

All sensitive administrative, authentication, and inventory operations are recorded in the `audit_logs` ledger:
- Events logged: `USER_REGISTER`, `USER_LOGIN`, `USER_UPDATE`, `ROLE_CHANGE`, `PRODUCT_CREATE`, `PRODUCT_UPDATE`, `PRODUCT_DELETE`, `STOCK_UPDATE`, `ORDER_CREATE`, `ORDER_STATUS_CHANGE`, `ORDER_CANCEL`, `RETURN_REQUEST`, `RETURN_APPROVE`, `RETURN_REJECT`, `RETURN_COMPLETE`, `EXCHANGE_REQUEST`, `EXCHANGE_APPROVE`, `EXCHANGE_REJECT`, `EXCHANGE_COMPLETE`.
- Attributes recorded: Timestamp, Actor Email, Action, Entity Type, Entity ID, Human-readable Description, Client IP Address.
- Accessible only by users with the `ADMIN` role.

---

## 7. Automated Security Test Coverage

Automated tests verify security boundaries:
- `AuthServiceTest` — Invalid password rejection, duplicate email collision checks.
- `SecurityOwnershipTest` — Cross-customer order access rejection (HTTP 403 Forbidden).
- `ReturnExchangeServiceTest` — 7-day return expiration rejection, replacement availability check.
- `PickupSlotServiceTest` — Capacity limit enforcement.

---

## 8. Summary of Security Best Practices

| Security Domain | Implementation |
|---|---|
| Password Storage | BCrypt (adaptive salted hashing) |
| Token Mechanism | Stateless HMAC-SHA256 JWT |
| Access Control | 4-Tier RBAC + Method Security |
| Ownership Checks | Strict server-side caller email verification |
| Injection Mitigation | Parameterized Spring Data JPA queries |
| Error Masking | Centralized GlobalExceptionHandler |
| Audit Trail | Real-time immutable audit ledger |
