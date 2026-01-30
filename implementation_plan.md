# Implementation Plan - Sprint 1-2: Database & API Foundation

This plan covers the foundational schema and API work required to support the new modular chatbot features (E-commerce, Support, Enterprise).

## User Review Required

> [!IMPORTANT]
> **API Testing Strategy:** We will use `supertest` with `jest` for automated API testing. Please ensure `npm install --save-dev jest supertest mongodb-memory-server` is approved.

## Proposed Changes

### Backend (Database Models)

#### [NEW] [Product.js](file:///home/minipc/Desktop/minichat/backend/src/models/Product.js)
- Schema for E-commerce products (name, price, stock, variants).
- Linked to `Workspace`.

#### [NEW] [Order.js](file:///home/minipc/Desktop/minichat/backend/src/models/Order.js)
- Schema for Orders (customer, items, total, status).
- Linked to `Conversation` and `Workspace`.

#### [NEW] [Flow.js](file:///home/minipc/Desktop/minichat/backend/src/models/Flow.js)
- Schema for Conversation Flows (triggers, nodes, actions).
- Supports the "Conversation Flow Builder" module.

### Backend (Controllers & Routes)

#### [NEW] [productController.js](file:///home/minipc/Desktop/minichat/backend/src/controllers/productController.js)
- CRUD operations for products.
- `getProducts`, `getProduct`, `createProduct`, `updateProduct`, `deleteProduct`.

#### [NEW] [orderController.js](file:///home/minipc/Desktop/minichat/backend/src/controllers/orderController.js)
- Order creation and status management.

#### [NEW] [flowController.js](file:///home/minipc/Desktop/minichat/backend/src/controllers/flowController.js)
- CRUD for conversation flows.

#### [MODIFY] [server.js](file:///home/minipc/Desktop/minichat/backend/src/server.js)
- Register new routes: `/api/products`, `/api/orders`, `/api/flows`.

## Verification Plan

### Automated Tests
We will create a new test suite in `backend/tests/` (if not exists) or `backend/src/__tests__/`.

1.  **Product API Test:**
    - `POST /api/products` - Create a product (Expect 201).
    - `GET /api/products` - List products (Expect 200).
2.  **Order API Test:**
    - `POST /api/orders` - Create an order (Expect 201).

### Manual Verification
1.  Start backend: `npm run dev`
2.  Use `curl` or Postman to hit the new endpoints.
    ```bash
    # Create Product
    curl -X POST http://localhost:5000/api/products \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"name": "Test Product", "price": 100}'
    ```
