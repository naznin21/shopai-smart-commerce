# Mini D-Mart — Full-Stack Grocery Retail & Store Operations Platform

> **Assessment Submission — Round 2 Full Stack Developer Practical Assessment**  
> *A production-grade, modular full-stack grocery web application featuring dynamic catalog management, atomic stock validation, smart pickup slot capacity reservation, order fulfillment queues, 7-day return/exchange workflows, and role-based access control (RBAC).*

### 🌐 Live Public Application
- **Live URL**: [https://e56c11847f050f.lhr.life](https://e56c11847f050f.lhr.life)
- **Local Fallback**: `http://localhost:8082`

---

## 📋 Table of Contents
1. [Executive Summary & Problem Statement](#executive-summary--problem-statement)
2. [Key Highlights & Creative Features](#key-highlights--creative-features)
3. [Architecture & System Design](#architecture--system-design)
4. [Database Design & Schema](#database-design--schema)
5. [Role-Based Access Control (RBAC) Matrix](#role-based-access-control-rbac-matrix)
6. [Comprehensive REST API Documentation](#comprehensive-rest-api-documentation)
7. [Business Logic & Edge Cases Enforced](#business-logic--edge-cases-enforced)
8. [Demo Credentials](#demo-credentials)
9. [Local Setup & Run Instructions](#local-setup--run-instructions)
10. [Deployment & Production Configuration](#deployment--production-configuration)
11. [Testing & Quality Assurance](#testing--quality-assurance)
12. [Security Architecture & Review](#security-architecture--review)
13. [Known Limitations & Future Roadmap](#known-limitations--future-roadmap)
14. [AI Usage Disclosure](#ai-usage-disclosure)

---

## 1. Executive Summary & Problem Statement

Mini D-Mart is designed as a full-fledged grocery e-commerce and retail fulfillment system. Beyond standard CRUD operations, it mirrors real-world retail workflows with:
- Dual-channel fulfillment: **1-Hour Express Store Pickup** (with real-time hourly capacity limits) and **Scheduled Home Delivery** (with dynamic free delivery thresholds).
- Multi-role internal operations: **Customer**, **Fulfillment Staff**, **Store Manager**, and **System Admin**.
- End-to-end order lifecycle management with live visual tracking timelines and strict state-machine validation.
- Complete return & replacement lifecycle governed by a strict 7-day return policy and inventory handling logic.

---

## 2. Key Highlights & Creative Features

### 🌟 Creative Feature 1: Smart Pickup Capacity Engine
- Store pickups are scheduled into discrete 1-hour time windows (e.g., `09:00 - 10:00`, `16:00 - 17:00`).
- Each slot has a maximum configurable capacity (default: **10 orders/slot**).
- Real-time slot availability is dynamically reported (e.g., `6 / 10 slots available`). When fully booked, slots are locked (`Fully booked`) and the backend prevents race conditions.
- If an order is cancelled, the slot capacity is released automatically.

### 🌟 Creative Feature 2: Smart Low-Stock & Critical Inventory Alerts
- **Customer View**: Dynamic badges warning *"Only 3 left!"* when stock falls below safety thresholds.
- **Staff / Admin View**: Centralized stock warning monitor with quick one-click restocking action.

### 🌟 Creative Feature 3: Interactive Multi-Stage Order Tracking Timeline
- Visual status progression matching fulfillment mode:
  - *Store Pickup*: `Order Placed` → `Confirmed` → `Preparing` → `Ready for Pickup` → `Picked Up` → `Completed`
  - *Home Delivery*: `Order Placed` → `Confirmed` → `Preparing` → `Out for Delivery` → `Delivered` → `Completed`

### 🌟 Creative Feature 4: Instant "Buy Again" One-Click Reordering
- The Customer Dashboard analyzes historical purchases and presents past favorite items with live stock status for rapid single-click replenishment.

### 🌟 Creative Feature 5: Smart Savings Meter & Free Delivery Threshold Engine
- Dynamic cart progress bar that calculates customer savings in real-time and shows the exact deficit required to unlock free delivery (`₹500 threshold`).

---

## 3. Architecture & System Design

Mini D-Mart follows a **Clean Modular Monolith Architecture** with separation of concerns between presentation, service orchestration, security validation, and persistence layers.

```
┌─────────────────────────────────────────────────────────────────┐
│                     React 18 + Vite SPA                         │
│   Tailwind CSS  •  Lucide Icons  •  Axios Interceptors  •  RBAC │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTP / REST / JWT Bearer
┌─────────────────────────────────▼───────────────────────────────┐
│                 Spring Boot 3.2.5 (Java 21) Monolith            │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Security Layer: Stateless JWT Auth & Method Security      │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ Controller Layer: REST Endpoints with DTO Validation      │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ Service Layer: Atomic Business Logic & Edge Enforcement   │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ Repository Layer: Spring Data JPA & Custom Queries        │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ Audit Logging Layer: Ledger of all sensitive mutations    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ JPA / Hibernate
┌─────────────────────────────────▼───────────────────────────────┐
│      Database: PostgreSQL (Production) / H2 In-Memory (Dev)     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. Database Design & Schema

### Entity-Relationship Structure
1. **`users`**: Authentication credentials, BCrypt password hashes, contact phone, delivery address, active flag, and `Role` (`CUSTOMER`, `STAFF`, `MANAGER`, `ADMIN`).
2. **`categories`**: Grocery aisle categories (e.g. *Fruits & Vegetables*, *Dairy & Bakery*, *Snacks & Beverages*, *Household Essentials*).
3. **`products`**: Item names, descriptions, original price, discount price, unit/pack size, stock quantity, low-stock threshold, Unsplash imagery.
4. **`carts` & `cart_items`**: One-to-one customer cart with quantity management.
5. **`orders`**: Unique order numbers (`ORD-YYYY-XXXXXXXX`), subtotal, discounts, delivery fees, order total, `OrderType` (`STORE_PICKUP` / `HOME_DELIVERY`), scheduled slot/date, `OrderStatus`, `PaymentMethod`, `PaymentStatus`, delivery timestamp.
6. **`order_items`**: Snapshot of product name, unit price, quantity, total price, and return flag at time of purchase.
7. **`pickup_slots`**: Date, time window string, max capacity, and booked count. Unique constraint on `(slot_date, time_slot)`.
8. **`return_exchange_requests`**: Return request numbers (`RET-` / `EXC-`), order & item references, `RequestType`, `ReturnReason`, replacement product reference, `ReturnStatus`, admin review notes.
9. **`audit_logs`**: Immutable ledger of all security, inventory, and status mutations with timestamp, actor email, action type, description, and IP address.

---

## 5. Role-Based Access Control (RBAC) Matrix

| Endpoint / Action | CUSTOMER | STAFF | MANAGER | ADMIN |
|---|:---:|:---:|:---:|:---:|
| Browse Products & Categories | ✅ | ✅ | ✅ | ✅ |
| View Pickup Slot Availability | ✅ | ✅ | ✅ | ✅ |
| Add to Cart & Checkout | ✅ | ❌ | ❌ | ❌ |
| View / Cancel Own Orders | ✅ (Own Only) | ❌ | ❌ | ❌ |
| Request 7-Day Return / Exchange | ✅ (Own Only) | ❌ | ❌ | ❌ |
| Customer Personalized Dashboard | ✅ | ❌ | ❌ | ❌ |
| View Store Fulfillment Queue | ❌ | ✅ | ✅ | ✅ |
| Advance Order Status (Prepare/Dispatch) | ❌ | ✅ | ✅ | ✅ |
| Process & Restock Returns/Exchanges | ❌ | ✅ | ✅ | ✅ |
| Quick Restock Low-Stock Items | ❌ | ✅ | ✅ | ✅ |
| Create / Edit Product & Pricing | ❌ | ❌ | ✅ | ✅ |
| Create / Edit Store Categories | ❌ | ❌ | ✅ | ✅ |
| Configure Pickup Slot Capacities | ❌ | ❌ | ✅ | ✅ |
| View Revenue & Store Analytics | ❌ | ❌ | ✅ | ✅ |
| Change User Roles (RBAC) | ❌ | ❌ | ❌ | ✅ |
| Enable / Disable User Accounts | ❌ | ❌ | ❌ | ✅ |
| Delete / Deactivate Products | ❌ | ❌ | ❌ | ✅ |
| View Immutable Security Audit Logs | ❌ | ❌ | ❌ | ✅ |

---

## 6. Comprehensive REST API Documentation

### 🔐 Authentication & Users
- `POST /api/auth/register` — Self-register new customer account (auto-creates empty cart).
- `POST /api/auth/login` — Authenticate and receive JWT Bearer token.
- `GET /api/users/me` — Retrieve authenticated user profile and permissions.
- `PUT /api/users/me` — Update personal contact details, saved address, or password.
- `GET /api/users` — *(Manager/Admin)* List all registered users.
- `PATCH /api/users/{id}/role` — *(Admin only)* Modify user RBAC role.
- `PATCH /api/users/{id}/toggle-status` — *(Admin only)* Toggle account enable/disable status.

### 🍎 Catalog & Categories
- `GET /api/categories` — List active categories for store navigation.
- `GET /api/categories/all` — *(Staff/Admin)* List all categories including inactive.
- `POST /api/categories` — *(Manager/Admin)* Create new category.
- `PUT /api/categories/{id}` — *(Manager/Admin)* Update category.
- `GET /api/products` — Filter products by `keyword`, `categoryId`, `minPrice`, `maxPrice`, `inStockOnly`, and `sortBy`.
- `GET /api/products/{id}` — Get single product details.
- `GET /api/products/featured` — Get featured items for showcase and reordering.
- `GET /api/products/low-stock` — *(Staff/Admin)* Get items below safety threshold.
- `POST /api/products` — *(Manager/Admin)* Create new grocery product.
- `PUT /api/products/{id}` — *(Manager/Admin)* Update product details and prices.
- `PATCH /api/products/{id}/stock` — *(Staff/Admin)* Update stock quantity.
- `DELETE /api/products/{id}` — *(Admin only)* Soft-deactivate product.

### 🛒 Cart & Checkout
- `GET /api/cart` — Get current customer's cart with server-side calculated totals, savings, and delivery fee.
- `POST /api/cart/items` — Add product to cart (validates available stock).
- `PUT /api/cart/items/{itemId}` — Update item quantity or remove item.
- `DELETE /api/cart/items/{itemId}` — Remove item from cart.
- `GET /api/pickup-slots` — Get smart pickup slots and capacity for a date.
- `GET /api/pickup-slots/upcoming` — Get slots for upcoming `N` days.
- `POST /api/pickup-slots` — *(Manager/Admin)* Configure slot capacity.
- `POST /api/orders/checkout` — Atomic stock validation, slot reservation, and order creation.

### 📦 Orders & Fulfillment
- `GET /api/orders` — Get current customer's order history.
- `GET /api/orders/{id}` — Get order details with ownership verification.
- `GET /api/orders/by-number/{orderNumber}` — Lookup order by order number.
- `POST /api/orders/{id}/cancel` — Cancel order (allowed only if `PLACED` or `CONFIRMED`).
- `GET /api/staff/orders` — *(Staff/Admin)* List fulfillment queue filtered by status/type.
- `PATCH /api/staff/orders/{id}/status` — *(Staff/Admin)* Update order status in fulfillment lifecycle.

### 🔄 Returns & Exchanges
- `POST /api/returns` — Submit return or exchange request (7-day delivery check).
- `GET /api/returns` — List current customer's return requests.
- `GET /api/returns/{id}` — Get single return request details.
- `GET /api/staff/returns` — *(Staff/Admin)* List all return requests.
- `PATCH /api/staff/returns/{id}/process` — *(Staff/Admin)* Approve, reject, or complete return with inventory restock option.

### 📊 Dashboards & Audit
- `GET /api/dashboard/customer` — Customer stats, active in-flight order, Buy Again suggestions.
- `GET /api/dashboard/staff` — Staff order counts, urgent orders queue, low-stock monitor.
- `GET /api/dashboard/admin` — Total revenue, today's revenue, order counts, audit log preview.
- `GET /api/admin/audit-logs` — *(Admin only)* Paginated immutable audit trail.
- `GET /api/admin/audit-logs/recent` — *(Admin only)* Recent security actions.

---

## 7. Business Logic & Edge Cases Enforced

1. **Atomic Stock & Price Validation**:
   - The frontend never dictates monetary totals or stock quantities.
   - During checkout, stock is locked and checked atomically. If stock changed while shopping, the order is safely rejected with a clear message.
2. **Pickup Capacity Limit**:
   - Slots track `bookedCount` vs `maxCapacity`. Once full, bookings are blocked.
   - If an order is cancelled, capacity is returned immediately.
3. **Strict Order Cancellation Rule**:
   - Orders can only be cancelled while in `PLACED` or `CONFIRMED` state.
   - Once store staff starts `PREPARING` or the order is `OUT_FOR_DELIVERY`, cancellation is blocked.
4. **7-Day Return Eligibility Window**:
   - Returns/exchanges are strictly rejected if the order is not yet delivered or if more than 7 days have elapsed since delivery.
   - Duplicate return requests on the same item are blocked.
5. **Exchange Replacement Stock Validation**:
   - When an exchange is approved, replacement stock is verified and reserved atomically.
6. **Backend Ownership Enforcement**:
   - Customer A attempting to access Customer B's order, cart, or return requests is rejected with **HTTP 403 Forbidden**.

---

## 8. Demo Credentials

The database auto-seeds these 4 demo accounts on initial launch:

| Role | Email | Password | Primary Capabilities |
|---|---|---|---|
| **ADMIN** | `admin@minidmart.com` | `Admin@123` | Full access, RBAC management, Security Audit Logs, Product catalog |
| **MANAGER** | `manager@minidmart.com` | `Manager@123` | Store Operations, Pricing, Revenue Analytics, Pickup Slot Capacity |
| **STAFF** | `staff@minidmart.com` | `Staff@123` | Order Fulfillment, Status Transitions, Return Inspection & Restocking |
| **CUSTOMER** | `customer@minidmart.com` | `Customer@123` | Grocery Shopping, Pickup Scheduling, Live Order Tracking, Returns |

*Note: New customers can also self-register at `/register`.*

---

## 9. Local Setup & Run Instructions

### Prerequisites
- **Java**: JDK 21
- **Node.js**: v18+ or v20+
- **Maven**: 3.8+ (or bundled)

### Step 1: Run Backend
```bash
cd backend
mvn spring-boot:run
```
- Backend starts at: `http://localhost:8080`
- Embedded H2 Console (PostgreSQL mode): `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:minidmartdb`, User: `sa`, Password: *blank*)
- Initial seed data (24 products, 4 roles, seed orders) loads automatically.

### Step 2: Run Frontend
```bash
cd frontend
npm install
npm run dev
```
- Frontend starts at: `http://localhost:5173`

---

## 10. Deployment & Production Configuration

### Environment Variables
Configure the following in production environments (e.g. Render, Railway, Vercel):

```env
# Backend Configuration
DATABASE_URL=jdbc:postgresql://<HOST>:<PORT>/<DB_NAME>
DATABASE_DRIVER=org.postgresql.Driver
DATABASE_USERNAME=<DB_USER>
DATABASE_PASSWORD=<DB_PASS>
JPA_DIALECT=org.hibernate.dialect.PostgreSQLDialect

# JWT Secret (Min 256 bits HMAC-SHA256)
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000

# CORS Allowed Origins
CORS_ALLOWED_ORIGINS=https://mini-dmart.vercel.app,http://localhost:5173

# Frontend Configuration
VITE_API_BASE_URL=https://mini-dmart-api.onrender.com/api
```

---

## 11. Testing & Quality Assurance

### Automated Backend Tests
Run the complete unit & integration test suite:
```bash
cd backend
mvn test
```
Tests include:
- `AuthServiceTest` — Registration, duplicate email rejection, invalid password rejection.
- `OrderServiceTest` — Checkout stock deduction, cancellation stock restoration, free delivery threshold calculations.
- `PickupSlotServiceTest` — Slot initialization, capacity limits, slot reservations, release on cancel.
- `ReturnExchangeServiceTest` — 7-day window enforcement, exchange replacement stock verification.
- `SecurityOwnershipTest` — Cross-customer resource access rejection (HTTP 403).

### Automated Frontend Type Checking & Production Build
```bash
cd frontend
npm run build
```

---

## 12. Security Architecture & Review

- **Stateless JWT Authentication**: Tokens signed using HMAC-SHA256 with 24-hour expiration.
- **BCrypt Password Hashing**: Passwords stored using industry standard BCrypt with strong salt rounds.
- **Method-Level Security**: `@PreAuthorize` annotations on sensitive administrative and staff controllers.
- **Ownership Verification**: Backend enforces user identity checks before returning order or return data.
- **SQL Injection Prevention**: Spring Data JPA parameterized queries and ORM mappings.
- **Audit Logging**: Immutable ledger records all auth attempts, role modifications, product updates, and order status transitions.

---

## 13. Known Limitations & Future Roadmap

1. **Payment Gateway Integration**: Currently simulates online payments with instant settlement and Cash on Delivery. Integration with Razorpay/Stripe can be plugged into `PaymentMethod`.
2. **Push Notifications**: Live status updates use REST polling; WebSocket / Server-Sent Events (SSE) can be added for instant push notifications to delivery personnel.
3. **Multi-Store Geofencing**: Currently configured for Branch #104; multi-store inventory routing can be layered on top of the existing `PickupSlot` model.

---

## 14. AI Usage Disclosure

In compliance with assessment requirements:
- AI tools (Antigravity Agent) were utilized as an accelerator for code auditing, writing automated unit tests, refactoring TypeScript interfaces, and standardizing markdown documentation.
- All core business rules, database constraints, capacity reservation logic, and security authorization boundaries were verified against the assessment guidelines.
