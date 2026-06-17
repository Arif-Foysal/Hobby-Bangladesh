## Why

Phase 2 gave us a product catalog. Customers can browse but cannot buy. Without cart and checkout, there is no revenue. This phase builds the purchasing flow: persistent cart, checkout with address collection, order creation, and SSLCommerz payment integration for Bangladesh.

## What Changes

- Cart: API routes for add/update/remove/view, cart page with quantity controls
- Checkout: Multi-step flow — shipping address → order review → payment
- Orders: Atomic order creation (cart items → order items, clear cart)
- Payment: SSLCommerz integration (init, IPN webhook, success/fail/cancel)
- Account: Order history, order detail, address book

## Capabilities

### New Capabilities

- `cart`: Persistent database-backed cart with API routes and UI
- `checkout`: Multi-step checkout flow with address collection
- `orders`: Order creation, history, and detail views
- `payment-sslcommerz`: SSLCommerz payment gateway integration

### Modified Capabilities

- `product-detail`: Add-to-cart button now functional

## Impact

- New routes: `/cart`, `/checkout`, `/checkout/success`, `/checkout/fail`, `/account/orders`, `/account/addresses`
- New API routes: `/api/cart/*`, `/api/checkout`, `/api/webhook/sslcommerz`
- Env vars: `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_IS_LIVE`
