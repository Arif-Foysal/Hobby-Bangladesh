## Context

The existing Next.js + Supabase starter kit has basic auth (login, sign-up, password reset) and a protected page stub. To build an e-commerce platform, we need a complete database layer, role-based authorization distinguishing customers from admins, a store configuration system, and a shell for the admin interface.

All database migrations run as SQL against the Supabase PostgreSQL instance. There's no ORM — we use `@supabase/supabase-js` directly with typed helpers. This keeps the stack lightweight and avoids migration tooling overhead for now.

## Goals / Non-Goals

**Goals:**
- Complete relational schema for the entire e-commerce domain (products, categories, carts, orders, addresses, reviews, store settings)
- Profiles table that extends Supabase `auth.users` with role support (customer/admin) and auto-creates on signup
- Row-Level Security ensuring customers can only access their own data, and only admins can manage catalog/orders
- Supabase Storage bucket for product images with admin-only upload
- Store settings singleton with typed access for currency, tax, shipping
- Admin layout shell: sidebar navigation, session check, role guard, base styling
- Typed database query helpers for admin operations

**Non-Goals:**
- Product/category/order management UI — these come in later phases
- Payment integration — Phase 3
- Email notifications — Phase 6
- Search/filters — Phase 2
- Any customer-facing e-commerce pages — Phase 2+

## Decisions

### 1. Database-backed carts over localStorage

**Decision**: Store carts in PostgreSQL (`carts` table), not browser localStorage.

**Rationale**: Enables abandoned cart recovery, cross-device cart persistence, and cart analytics. The Supabase `@supabase/ssr` cookie-based auth already provides the user identity. For guest users (rare in this project since auth is required), we can add a guest cart pattern later.

**Alternative**: localStorage cart is simpler but limits future features and creates data loss risk.

### 2. JSONB for product images and attributes instead of separate tables

**Decision**: Store `images` as `jsonb` array on the `products` row, and `attributes` as `jsonb` for variant data.

**Rationale**: Reduces joins for the most common query (fetching a product with its images). The image count per product is small (typically 1-10). Attributes vary by product category (size for clothing, storage for electronics) making them a poor fit for a normalized schema.

**Alternative**: Separate `product_images` and `product_attributes` tables allow better querying but add complexity for minimal benefit in a single-vendor store.

### 3. store_settings as key-value singleton over a structured table

**Decision**: `store_settings(key UNIQUE, value jsonb)` with a single row fetched by known key.

**Rationale**: Store settings are a flat key-value set that changes shape as the app grows. A typed TypeScript accessor (`getStoreSetting('currency')`) provides type safety without migrations when a new setting is added.

**Alternative**: A structured `store_config` row with typed columns requires a migration every time a new setting is added.

### 4. Single migration file over incremental migrations

**Decision**: One SQL migration file creates all Phase 1 tables, types, triggers, and policies.

**Rationale**: The project is greenfield (no production data). A single file is easier to review, test, and reset during development. We can adopt incremental migrations later if needed.

**Risk**: Re-running the script drops existing data. Mitigation: Use `IF NOT EXISTS` clauses and make it idempotent.

### 5. Admin role stored in profiles.role, not a custom claim

**Decision**: Store role (`customer` | `admin`) as a column on the `profiles` table, checked via RLS policy and server-side query.

**Rationale**: Supabase's custom claims require JWT hook setup and aren't easily refreshable. A database column checked server-side is simpler and more debuggable. The RLS policy `auth.uid() = id` combined with a role check prevents customers from escalating their own role.

**Alternative**: Supabase custom claims via `auth.hooks` are more secure (no DB update risk) but add deployment complexity for a single-vendor store with one admin.

## Risks / Trade-offs

- **Risk**: Single migration file makes incremental changes harder later → **Mitigation**: Use `IF NOT EXISTS` and design tables so future phases add columns/tables without breaking existing data
- **Risk**: Admin role in a database column vs. JWT claims → **Mitigation**: RLS policy prevents self-escalation; server-side `getClaims()` call verifies session before any admin query
- **Risk**: No ORM means more manual SQL and type maintenance → **Mitigation**: TypeScript interfaces for all tables defined in `lib/database.types.ts`; Supabase CLI `gen types` can auto-generate these later
- **Trade-off**: `images` as `jsonb` limits querying images directly via SQL → Acceptable: images are always fetched with their parent product, never queried independently
