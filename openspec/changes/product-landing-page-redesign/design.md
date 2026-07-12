## Context

The current landing page system uses a section-based builder (hero, features, gallery, text, CTA, FAQ sections) with drag-and-drop reordering. This was built as a flexible page builder but is overly complex for product landing pages. The admin has to: create sections, configure each one, reorder them, upload images per section. Most products need the same layout — hero, features, gallery, description, specs, FAQ, CTA. The template approach eliminates the builder complexity while producing a more consistent, higher-quality result.

## Goals / Non-Goals

**Goals:**
- Fixed, high-converting landing page template for any product
- Admin only customizes content fields (not layout)
- Leverage existing product data (price, images, attributes, features) automatically
- Mobile-first responsive design
- Fast to implement and maintain

**Non-Goals:**
- Multiple landing page templates (one template is enough)
- A/B testing different layouts
- Custom CSS/style overrides per landing page

## Decisions

### 1. Fixed template, not a builder

**Decision**: Replace the section-based builder with a single fixed template. The landing page always renders in this order: Hero → Trust bar → Features → Gallery → Description → Specs → FAQ → Final CTA.

**Rationale**: Product landing pages follow a proven conversion pattern. Admins don't need to make layout decisions — they need to fill in content. A fixed template is simpler to build, easier to maintain, and produces consistent results.

### 2. Content-only customization via simple fields

**Decision**: Admin fills in: hero subtitle, feature cards (icon + title + text), FAQ items (question + answer), and optional landing page description. Everything else (product name, price, images, attributes, stock) is pulled from the existing product data.

**Rationale**: Minimizes admin effort. The product already has most of the data needed for a landing page. The admin only adds supplementary content.

### 3. `landing_page_sections` JSONB repurposed, not renamed

**Decision**: Keep the `landing_page_sections` column but change its shape from an array of sections to a flat object: `{ hero_subtitle, faq_items, landing_description }`. No migration needed — JSONB accepts any shape.

**Rationale**: Avoids a migration. Existing data will be stale but harmless (the template ignores unknown fields). Admin form writes the new shape on next save.

### 4. Features come from product `features` field

**Decision**: The features section on the landing page reads from `product.features` (the existing `ProductFeature[]` field), not from `landing_page_sections`. The admin manages features in the product form's existing Features tab.

**Rationale**: Features are product-level data, not landing-page-specific. No duplication.

### 5. Hero image uses first product image by default

**Decision**: The hero section uses the first product image. Admin can optionally override with a custom hero image via a `hero_image_url` field in the landing page content.

**Rationale**: Most products have good hero images already. The override is there for when the admin wants a different hero image (e.g., lifestyle shot vs product shot).

## Risks / Trade-offs

- **Trade-off**: Less flexibility than a section builder → **Mitigation**: The fixed template covers 95% of use cases. Custom pages can be built as separate Next.js pages if needed.
- **Risk**: Existing `landing_page_sections` data becomes stale → **Mitigation**: Template reads only known fields, ignores the rest. Next admin save writes the new shape.
- **Trade-off**: No section reordering → **Mitigation**: The template order is optimized for conversions. Admins who want different ordering are solving a problem that doesn't exist.
