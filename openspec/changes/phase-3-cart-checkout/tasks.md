## 1. Cart

- [ ] 1.1 Create `app/cart/page.tsx` — cart page with items, quantities, subtotal, checkout button
- [ ] 1.2 Create `app/cart/actions.ts` — server actions: addToCart, updateQuantity, removeFromCart, getCart
- [ ] 1.3 Create `components/add-to-cart-button.tsx` — client component for product detail page
- [ ] 1.4 Update `app/products/[slug]/page.tsx` — wire add-to-cart button

## 2. Checkout

- [ ] 2.1 Create `app/checkout/page.tsx` — checkout page: address form, order summary, place order button
- [ ] 2.2 Create `app/checkout/actions.ts` — createOrder action (atomic: validate stock, create order, clear cart)
- [ ] 2.3 Create `app/checkout/address-form.tsx` — reusable address form component
- [ ] 2.4 Create `app/checkout/success/page.tsx` — order confirmation page
- [ ] 2.5 Create `app/checkout/fail/page.tsx` — payment failed page

## 3. Payment (SSLCOMMERZ)

- [ ] 3.1 Create `lib/sslcommerz.ts` — SSLCommerz init, validate, IPN helpers
- [ ] 3.2 Create `app/api/checkout/route.ts` — POST: create order + init SSLCommerz payment
- [ ] 3.3 Create `app/api/webhook/sslcommerz/route.ts` — POST: IPN handler, update order payment status

## 4. Account Pages

- [ ] 4.1 Create `app/account/layout.tsx` — account layout with sidebar nav
- [ ] 4.2 Create `app/account/orders/page.tsx` — order history list
- [ ] 4.3 Create `app/account/orders/[id]/page.tsx` — order detail with status timeline
- [ ] 4.4 Create `app/account/addresses/page.tsx` — address book CRUD
- [ ] 4.5 Create `app/account/actions.ts` — account server actions

## 5. Admin Orders

- [ ] 5.1 Create `app/admin/orders/page.tsx` — order list with status filters
- [ ] 5.2 Create `app/admin/orders/[id]/page.tsx` — order detail + status update
- [ ] 5.3 Create `app/admin/orders/actions.ts` — admin order actions (update status)

## 6. Verification

- [ ] 6.1 Run `npm run lint` — fix issues
- [ ] 6.2 Run `npm run build` — verify no errors
