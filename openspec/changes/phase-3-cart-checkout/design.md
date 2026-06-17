## Context

Phase 2 created the product catalog. Customers can browse products but cannot purchase. The `carts` and `orders` tables exist from Phase 1 schema. SSLCommerz is the target payment gateway for Bangladesh.

## Goals / Non-Goals

**Goals:**
- Persistent cart (database-backed, survives logout/login)
- Checkout with saved addresses or new address entry
- Atomic order creation with stock deduction
- SSLCommerz payment flow (init → pay → IPN → confirm)
- Order history and detail for customers
- Order management for admins

**Non-Goals:**
- Guest checkout (auth required)
- Refund processing
- Multiple shipping methods
- Discount codes / coupons
- Email notifications (Phase 6)

## Decisions

### 1. Database cart over localStorage

**Decision**: Cart stored in `carts` table, not localStorage.

**Rationale**: Users may switch devices. Cart persistence across sessions is expected in BD e-commerce.

### 2. Server Actions over API routes for cart

**Decision**: Use Next.js Server Actions for cart mutations (add, update, remove). API route only for SSLCommerz webhook.

**Rationale**: Server Actions are simpler for form-based mutations. Webhook needs a raw HTTP endpoint.

### 3. Single-page checkout over multi-step

**Decision**: One page with sections (address → review → pay) instead of separate pages per step.

**Rationale**: Reduces friction. Users see everything at once. Simpler to implement.

### 4. SSLCommerz hosted payment page

**Decision**: Redirect to SSLCommerz hosted page, not inline iframe.

**Rationale**: Hosted page is PCI-compliant, handles all card/bKash/Nagad flows, simpler integration.

## Risks / Trade-offs

- **Risk**: SSLCommerz IPN may be delayed → **Mitigation**: Also check payment status on return URL
- **Risk**: Stock overselling during concurrent orders → **Mitigation**: Check stock before order creation, deduct atomically
