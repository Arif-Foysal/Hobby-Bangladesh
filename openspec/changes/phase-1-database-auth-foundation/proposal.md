## Why

The existing starter kit provides only basic auth with a stub protected page. To build a full e-commerce platform, we need a complete database schema, role-based authorization (admin vs customer), store configuration, and an admin interface shell. This phase establishes the foundation every other phase builds on.

## What Changes

- Database schema for the entire application (products, categories, carts, orders, addresses, reviews, store settings)
- `profiles` table that auto-creates on Supabase auth signup, with admin/customer role support
- Row-Level Security (RLS) policies: customers read/write their own data; only admins manage products/orders
- Supabase Storage buckets for product images with appropriate access policies
- `store_settings` singleton for store-wide configuration (currency, tax, shipping)
- Admin layout shell with sidebar navigation, role-gated access, and session guard
- Typed database helper (`lib/supabase/admin.ts`) for admin-only queries with proper TypeScript types

## Capabilities

### New Capabilities

- `database-schema`: All e-commerce tables, relationships, indexes, and RLS policies
- `role-based-auth`: Profiles table extending auth.users with admin/customer roles and auto-create trigger
- `storage-buckets`: Supabase Storage buckets for product images with bucket-level access policies
- `store-config`: Store settings singleton for currency, tax rate, shipping config, and store metadata
- `admin-layout`: Admin sidebar navigation, role check middleware, and protected layout shell

### Modified Capabilities

<!-- No existing specs to modify -->

## Impact

- Affected code: New files in `lib/supabase/`, new `app/admin/` directory, new database migration
- New dependencies: Database schema changes (requires running migration against Supabase project)
- No breaking changes: Existing auth flow (`proxy.ts`, auth pages) preserved; public routes accessible as before
