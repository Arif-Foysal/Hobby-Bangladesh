## 1. Admin — Categories

- [ ] 1.1 Create `app/admin/categories/page.tsx` — category list table with active badge, delete button, toggle active
- [ ] 1.2 Create `app/admin/categories/new/page.tsx` — create category form (name, slug auto-gen, description, parent, sort order, active)
- [ ] 1.3 Create `app/admin/categories/[id]/edit/page.tsx` — edit category form
- [ ] 1.4 Create API route or server action for category CRUD (create, update, delete, toggle active)
- [ ] 1.5 Add category validation (unique slug check, required name)

## 2. Admin — Products

- [ ] 2.1 Create `app/admin/products/page.tsx` — product table with image thumbnail, name, category, price, stock, active badge
- [ ] 2.2 Create `app/admin/products/new/page.tsx` — create product form (all fields + image upload)
- [ ] 2.3 Create `app/admin/products/[id]/edit/page.tsx` — edit product form with existing images
- [ ] 2.4 Implement image upload to Supabase Storage `products` bucket (client-side upload, store URLs in images JSONB)
- [ ] 2.5 Add product validation (unique slug, required name/price/stock)
- [ ] 2.6 Add delete confirmation dialog

## 3. Customer — Product Listing

- [ ] 3.1 Create `app/products/page.tsx` — server component, fetches active products with pagination
- [ ] 3.2 Create `components/product-card.tsx` — image, name, price, compare-at price
- [ ] 3.3 Add category filter (sidebar or dropdown)
- [ ] 3.4 Add search input (ilike on name)
- [ ] 3.5 Add sort dropdown (price asc/desc, newest)
- [ ] 3.6 Add pagination controls

## 4. Customer — Product Detail

- [ ] 4.1 Create `app/products/[slug]/page.tsx` — server component, fetches product by slug
- [ ] 4.2 Create `components/product-gallery.tsx` — image gallery with thumbnails
- [ ] 4.3 Add stock status display (in stock / out of stock)
- [ ] 4.4 Add breadcrumb (Products > Category > Product)
- [ ] 4.5 Add placeholder add-to-cart button

## 5. Verification

- [ ] 5.1 Run `npm run lint` — fix any issues
- [ ] 5.2 Run `npm run build` — verify no errors
- [ ] 5.3 Test admin category CRUD flow
- [ ] 5.4 Test admin product CRUD flow with image upload
- [ ] 5.5 Test customer product listing with filters
- [ ] 5.6 Test customer product detail page
