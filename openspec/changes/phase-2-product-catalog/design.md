## Context

Phase 1 created the database schema (products, categories tables with RLS), Supabase Storage bucket policies, and the admin dashboard shell. The admin has no content management pages. Customers have no pages to browse products.

## Goals / Non-Goals

**Goals:**
- Admin can manage categories (CRUD, toggle active, set parent for nesting)
- Admin can manage products (CRUD, upload multiple images, set price/stock/category)
- Customer can browse products at `/products` with category filter, text search, sort by price/newest, pagination
- Customer can view product detail at `/products/[slug]` with image gallery, full description, and add-to-cart button
- Product images stored in Supabase Storage `products` bucket

**Non-Goals:**
- Shopping cart and checkout (Phase 3)
- Reviews (Phase 5)
- Advanced search (full-text, Elasticsearch)
- Product variants/options (future enhancement)
- Wishlist or favorites

## Decisions

### 1. Server Components for product pages, Client Components for forms

**Decision**: Product listing and detail pages are Server Components. Admin forms (create/edit) are Client Components with `useActionState` or `useState`.

**Rationale**: Product pages are read-heavy and benefit from server rendering + caching. Admin forms need client-side interactivity for image uploads, form validation, and dynamic fields.

### 2. Image upload via Supabase Storage client-side

**Decision**: Upload images directly from the admin browser to Supabase Storage using the client Supabase client, then store the public URL in the product's `images` JSONB column.

**Rationale**: Avoids large file uploads through Next.js API routes. Supabase Storage handles the upload directly. The RLS policy ensures only admins can upload.

### 3. Product search uses Supabase `ilike` on name and description

**Decision**: Simple `ilike` search on product name and description fields.

**Rationale**: For a single-vendor store with hundreds to low thousands of products, `ilike` is sufficient and requires no additional setup. Full-text search can be added later with `tsvector` if needed.

### 4. Pagination via offset/limit

**Decision**: Use `range(from, to)` on Supabase queries for pagination. Default 12 products per page.

**Rationale**: Simple, works with Supabase's existing API. Cursor-based pagination is better for infinite scroll but adds complexity without clear benefit at this scale.

## Risks / Trade-offs

- **Risk**: `ilike` search is slow on large datasets → **Mitigation**: Add database index on `products.name` if needed; upgrade to full-text search later
- **Risk**: JSONB `images` column limits querying individual images → **Mitigation**: Acceptable — images are always fetched with their parent product
- **Trade-off**: Client-side image upload requires Supabase anon key to have Storage write access → **Mitigation**: RLS policy on Storage bucket restricts uploads to admins only
