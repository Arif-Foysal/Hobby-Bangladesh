## Why

The current landing page system uses a section-based drag-and-drop builder that lets admins compose arbitrary layouts. This is over-engineered: it's complex to build, hard to maintain, and produces inconsistent results. Most product landing pages follow the same high-converting pattern. A fixed template with content-only customization is simpler, faster, and produces better results.

## What Changes

- **Replace** the section-based landing page builder with a fixed, high-quality landing page template
- **Remove** `landing-page-builder.tsx` (the dnd-kit section builder)
- **Simplify** the admin form: instead of adding/reordering sections, admins fill in content fields (hero subtitle, features, FAQ items)
- **Redesign** `product-landing-page.tsx` as a fixed template with these sections:
  1. Hero — full-width product image with title, price, and CTA
  2. Trust bar — free shipping, easy returns, secure payment
  3. Key features — 3-4 icon cards (from product `features` field)
  4. Gallery — product images grid
  5. Description — rich text
  6. Specifications — attributes table
  7. FAQ — accordion
  8. Final CTA — "Order Now" banner
- **Keep** the `landing_page_enabled` DB column and route (`/products/[slug]/landing`)
- **Simplify** `landing_page_sections` JSONB to only store: `{ hero_subtitle, faq_items, landing_description }` — everything else comes from existing product fields

## Capabilities

### Modified Capabilities

- `product-landing-page`: Fixed template renderer, no longer section-based
- `admin-products`: Simplified landing page tab with content fields only

### Removed Capabilities

- Section-based builder with drag-and-drop reordering

## Impact

- Files deleted: `components/product-landing-page.tsx` (rewritten), `app/admin/products/landing-page-builder.tsx`
- Files modified: `app/(shop)/products/[slug]/landing/page.tsx`, `app/admin/products/product-form.tsx`, `app/admin/products/actions.ts`
- DB: `landing_page_sections` column repurposed (still JSONB, different shape)
- No migration needed — column type stays JSONB
