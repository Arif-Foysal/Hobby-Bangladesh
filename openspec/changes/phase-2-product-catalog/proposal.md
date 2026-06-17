## Why

Phase 1 established the database, auth, and admin shell. The store has no content — no products, no categories, no pages for customers to browse. Without a catalog, there is no store. This phase builds the core product and category management (admin) and the customer-facing product pages.

## What Changes

- Admin: Full CRUD for categories (create, edit, delete, toggle active, nested parent/child)
- Admin: Full CRUD for products (create, edit, delete, image upload to Supabase Storage, stock management)
- Customer: Product listing page at `/products` with category filter, search, sort, and pagination
- Customer: Product detail page at `/products/[slug]` with images, description, price, and add-to-cart button
- Supabase Storage bucket `products` for product images with admin-only upload

## Capabilities

### New Capabilities

- `admin-categories`: Category management UI (list, create, edit, delete) with nested support
- `admin-products`: Product management UI (list, create, edit, delete) with image upload
- `product-listing`: Customer-facing product listing with filters, search, sort, pagination
- `product-detail`: Customer-facing product detail page with image gallery and add-to-cart

### Modified Capabilities

- `storage-buckets`: Activate the products bucket for image uploads (already defined in Phase 1 spec)

## Impact

- New files: `app/admin/categories/`, `app/admin/products/`, `app/products/`, `app/products/[slug]/`
- New components: `components/admin/category-form.tsx`, `components/admin/product-form.tsx`, `components/product-card.tsx`, `components/product-gallery.tsx`
- Supabase Storage: Product images bucket must be created in Supabase dashboard if not already present
