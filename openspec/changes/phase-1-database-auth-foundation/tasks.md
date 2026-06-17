## 1. Database Schema (Migration)

- [ ] 1.1 Create migration SQL file at `lib/database/migration.sql` with all e-commerce tables (products, categories, carts, orders, order_items, addresses, reviews, profiles, store_settings)
- [ ] 1.2 Add all columns with correct types, defaults, NOT NULL constraints, and foreign keys
- [ ] 1.3 Add unique constraints on slugs (products.slug, categories.slug) and compound keys where needed
- [ ] 1.4 Add indexes on frequently queried columns: (products.category_id, products.created_at), (orders.user_id, orders.created_at), (carts.user_id), (categories.parent_id, categories.sort_order)
- [ ] 1.5 Create trigger for auto-creating profiles on auth.users INSERT with role defaulting to 'customer'
- [ ] 1.6 Create storage buckets (products) with appropriate policies in migration or separate SQL
- [ ] 1.7 Seed store_settings with default values (currency: BDT, tax: 0%, shipping defaults)

## 2. Row-Level Security Policies

- [ ] 2.1 Enable RLS on all tables
- [ ] 2.2 Create policies for products table: public read for active products, admin full access
- [ ] 2.3 Create policies for categories: public read for active, admin full access
- [ ] 2.4 Create policies for carts: users can only read/write their own cart
- [ ] 2.5 Create policies for orders/order_items: users read own orders, admin full access
- [ ] 2.6 Create policies for addresses: users CRUD own addresses
- [ ] 2.7 Create policies for reviews: users create own reviews, public read approved, admin moderate
- [ ] 2.8 Create policies for profiles: users read own profile, cannot change role, admin can read all
- [ ] 2.9 Create policies for store_settings: public read, admin write

## 3. TypeScript Types and Database Helper

- [ ] 3.1 Create `lib/database/types.ts` with TypeScript interfaces for all tables (Products, Categories, Cart, Order, OrderItem, Address, Review, Profile, StoreSetting)
- [ ] 3.2 Create `lib/supabase/admin.ts` with typed helper functions: `getProfile(userId)`, `isAdmin(userId)`, `requireAdmin()`
- [ ] 3.3 Create `lib/supabase/store.ts` with `getStoreSetting(key)` typed helper with request-scoped caching

## 4. Admin Layout Shell

- [ ] 4.1 Create `app/admin/layout.tsx` with session check + role guard (redirect if not admin)
- [ ] 4.2 Create `app/admin/page.tsx` dashboard with stat cards (placeholder: total revenue, orders today, pending orders, products count)
- [ ] 4.3 Create `components/admin/sidebar.tsx` with shadcn/ui sidebar and navigation links to all admin sections
- [ ] 4.4 Create `components/admin/header.tsx` with admin email display and logout button
- [ ] 4.5 Add a "Dashboard" link to the public-facing header when user is admin (optional convenience)

## 5. Integration & Verification

- [ ] 5.1 Verify auth flow: proxy.ts still works, admin routes redirect unauthenticated and non-admin users
- [ ] 5.2 Verify admin can access `/admin` and see the dashboard
- [ ] 5.3 Verify customer cannot access `/admin` (redirected with access denied)
- [ ] 5.4 Verify store settings are readable from a server component
- [ ] 5.5 Run `npm run lint` and fix any issues
- [ ] 5.6 Run `npm run build` and verify no errors
