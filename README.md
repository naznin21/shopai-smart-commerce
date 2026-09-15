# ShopAI — Next-Gen AI-Powered E-Commerce & Grocery Retail Platform

> **Production-Grade AI E-Commerce Platform**  
> *A full-stack grocery e-commerce platform built with Spring Boot 3, MongoDB NoSQL, React 18, TypeScript, Tailwind CSS, and an integrated dual-mode AI engine (Google Gemini 1.5 Flash REST API + built-in Heuristic Fallback Engine).*

---

## 📋 Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [AI Capabilities & Features](#2-ai-capabilities--features)
3. [Core E-Commerce Features](#3-core-e-commerce-features)
4. [Architecture & System Design](#4-architecture--system-design)
5. [MongoDB NoSQL & String ID Migration](#5-mongodb-nosql--string-id-migration)
6. [Security & Dual-Mode Fallback Architecture](#6-security--dual-mode-fallback-architecture)
7. [Comprehensive REST API Overview](#7-comprehensive-rest-api-overview)
8. [Demo Credentials](#8-demo-credentials)
9. [Environment Variables](#9-environment-variables)
10. [Local Setup & Run Commands](#10-local-setup--run-commands)
11. [Build & Test Verification Results](#11-build--test-verification-results)

---

## 1. Executive Summary

**ShopAI** transforms standard e-commerce into an intelligent, conversational, and context-aware shopping experience. Beyond robust retail features (1-Hour Express Store Pickup, Scheduled Delivery, 7-Day Returns, and RBAC governance), ShopAI introduces **artificial intelligence** across the shopping journey:

- **For Customers**: Conversational shopping assistance, natural language search ("healthy snacks under ₹300"), and smart contextual recommendations.
- **For Merchants & Managers**: Automated AI product description generation and intelligent inventory insight.
- **Resilient Fallback**: Designed with a **Dual-Mode AI Engine** so that shopping, checkout, and search continue seamlessly even when third-party AI keys are unavailable.

---

## 2. AI Capabilities & Features

### 🤖 A. AI Conversational Shopping Assistant
- **Endpoint**: `POST /api/ai/chat`
- **UI Component**: Floating `AIChatWidget` accessible across all pages with quick prompt chips.
- **Capabilities**: Answers product inquiries, category locations, recipe ingredient suggestions, dietary guidance (vegan, gluten-free, low-carb), and order policy questions.
- **Direct Add-to-Cart**: Chat replies embed real-time product preview cards with 1-click "Add to Cart" integration.

### 🌟 B. Contextual Smart Recommendations Carousel
- **Endpoint**: `POST /api/ai/recommendations`
- **UI Component**: `AIRecommendationCarousel` embedded on the Landing Page and Product Detail pages.
- **Capabilities**: Suggests complementary items (e.g., milk when viewing tea, brown bread when viewing butter) based on product category, selected item, and live stock availability.

### 🔍 C. Natural Language Product Search
- **Endpoint**: `POST /api/ai/search`
- **UI Component**: Rebranded Navbar search with quick natural query chips (`Healthy breakfast under ₹300`, `Dairy products`, `Affordable vegetables`).
- **Capabilities**: Converts complex human queries into structured filter criteria (price bounds, keyword matches, category mapping) and returns real MongoDB product matches.

### 📝 D. Admin AI Product Description Generator
- **Endpoint**: `POST /api/ai/generate-description`
- **UI Component**: "AI Generate Description" button in the Manager/Admin Product Modal.
- **Capabilities**: Takes product title, category, price, and pack size to generate a persuasive, SEO-ready product description with tagline and highlights.

---

## 3. Core E-Commerce Features

- **Express Pickup Slot Capacity**: discrete 1-hour time slots with configurable capacity caps (default: 10 orders/slot).
- **Multi-Role RBAC System**: `CUSTOMER`, `STAFF`, `MANAGER`, and `ADMIN`.
- **Order Lifecycle Timeline**: Live status progression (`PLACED` → `CONFIRMED` → `PREPARING` → `READY_FOR_PICKUP` / `OUT_FOR_DELIVERY` → `DELIVERED` / `PICKED_UP` → `COMPLETED`).
- **7-Day Return & Exchange Workflow**: Strict delivery window checks, replacement stock verification, and staff audit notes.
- **Savings Meter**: Cart progress bar calculating customer savings and free delivery thresholds (₹500).

---

## 4. Architecture & System Design

ShopAI uses a clean separation of concerns with dual-mode AI orchestration:

```
┌─────────────────────────────────────────────────────────────────┐
│              React 18 + TypeScript + Tailwind CSS SPA           │
│   AIChatWidget • AIRecommendationCarousel • Natural Search UI   │
└─────────────────────────────────┬───────────────────────────────┘
                                  │ HTTP / REST / JWT Bearer
┌─────────────────────────────────▼───────────────────────────────┐
│                 Spring Boot 3.2.5 (Java 21) Backend             │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Security: Stateless JWT & Method-Level RBAC Security     │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ AI Engine (AIService): Dual Mode                          │  │
│  │   • Live Gemini REST API (gemini-1.5-flash)              │  │
│  │   • Built-in Smart Heuristic Engine (MongoDB Queries)   │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │ Core Services: Order, Cart, Product, Return, Slot         │  │
│  └────────────────────────────────┬──────────────────────────┘  │
└───────────────────────────────────┼─────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         │                                                     │
┌────────▼───────────────────────┐            ┌────────────────▼───────────────┐
│     MongoDB NoSQL Database     │            │    Google Gemini LLM REST API  │
│    (shopaidb / String IDs)     │            │   (v1beta / generateContent)   │
└────────────────────────────────┘            └────────────────────────────────┘
```

---

## 5. MongoDB NoSQL & String ID Migration

The backend and frontend are completely migrated to MongoDB:
- **Entities**: `@Document(collection = "...")` replacing JPA relational entities.
- **Identifiers**: All IDs use 24-character hexadecimal MongoDB `String` IDs (e.g. `66d0a1b2c3d4e5f678901234`).
- **Repositories**: `MongoRepository<T, String>` with custom Spring Data Mongo queries.
- **Frontend Types**: `frontend/src/types/index.ts` models use `string` for all entity IDs (`Product`, `Cart`, `Order`, `User`, `Category`, `PickupSlot`, `ReturnExchangeRequest`).

---

## 6. Security & Dual-Mode Fallback Architecture

### 🛡️ Security
1. **Zero Key Leakage**: Third-party API keys are never exposed to the client bundle. All AI requests proxy through `AIController` with JWT authentication.
2. **Stateless JWT Authorization**: Bearer tokens with HMAC-SHA256 signatures and 24-hour expiration.
3. **Role Enforcement**: Administrative and AI generation endpoints require `MANAGER` or `ADMIN` authority.

### 🔄 Fallback Resiliency
If `GEMINI_API_KEY` is not provided or the remote API is unreachable:
- `AIService` automatically engages the **Smart Heuristic Engine**.
- The engine uses direct MongoDB `MongoTemplate` queries, regex matching, and price filtering to fulfill chat, recommendations, search, and descriptions.
- The application **never crashes** and normal store browsing, cart, and checkout remain 100% operational.

---

## 7. Comprehensive REST API Overview

### 🤖 AI Endpoints
| Endpoint | Method | Role | Description |
|---|---|---|---|
| `/api/ai/chat` | `POST` | Public / Customer | AI shopping assistant chat |
| `/api/ai/recommendations` | `POST` | Public | Contextual product recommendations |
| `/api/ai/search` | `POST` | Public | Natural language product search |
| `/api/ai/generate-description` | `POST` | Manager / Admin | AI product description generator |

### 🔐 Auth & Core Endpoints
| Endpoint | Method | Description |
|---|---|---|
| `/api/auth/register` | `POST` | Register new customer account |
| `/api/auth/login` | `POST` | Sign in and retrieve JWT Bearer token |
| `/api/products` | `GET` | List/Search products with string filters |
| `/api/cart` | `GET` / `POST` | Customer cart management |
| `/api/orders/checkout` | `POST` | Atomic checkout and pickup slot reservation |
| `/api/returns` | `POST` | Submit 7-day return request |

---

## 8. Demo Credentials

The MongoDB database auto-seeds these 4 demo accounts on initial startup:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **ADMIN** | `admin@minidmart.com` | `Admin@123` | Full security, RBAC, audit logs |
| **MANAGER** | `manager@minidmart.com` | `Manager@123` | Store ops, AI generator, aisle management |
| **STAFF** | `staff@minidmart.com` | `Staff@123` | Order fulfillment, status progression |
| **CUSTOMER** | `customer@minidmart.com` | `Customer@123` | Shopping, AI Assistant, checkout, returns |

*One-click quick fill buttons are available directly on the `/login` screen.*

---

## 9. Environment Variables

### Backend (`backend/src/main/resources/application.properties` or OS Env)
```env
PORT=8082
MONGODB_URI=mongodb://localhost:27017/shopaidb
JWT_SECRET=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
JWT_EXPIRATION_MS=86400000
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# AI Configuration (Optional - Fallback Engine activates automatically if key omitted)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
```

### Frontend (`frontend/.env` or OS Env)
```env
VITE_API_BASE_URL=http://localhost:8082/api
```

---

## 10. Local Setup & Run Commands

### Prerequisites
- Java JDK 21
- Node.js v18+
- MongoDB instance running locally on `localhost:27017` (or remote MongoDB Atlas URI)

### Start Backend
```bash
cd backend
mvn spring-boot:run
```
*Backend runs on `http://localhost:8082`*

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173`*

---

## 11. Build & Test Verification Results

### Backend Test Suite
```bash
cd backend
mvn test
```
- **Results**: `Tests run: 15, Failures: 0, Errors: 0, Skipped: 0` (`BUILD SUCCESS`)

### Frontend Production Build
```bash
cd frontend
npm run build
```
- **Results**: `tsc && vite build` completed cleanly with zero TypeScript errors. Output saved to `dist/`.
