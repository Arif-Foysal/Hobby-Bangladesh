## Tasks

- [ ] Rewrite `components/product-landing-page.tsx` as a fixed template with sections: Hero, Trust bar, Features, Gallery, Description, Specs, FAQ, Final CTA
- [ ] Simplify `app/admin/products/product-form.tsx` landing page tab: remove LandingPageBuilder, add content fields (hero subtitle, hero image upload, FAQ items editor, landing description textarea)
- [ ] Update `app/admin/products/actions.ts` to write the new `landing_page_sections` shape `{ hero_subtitle, hero_image_url, faq_items, landing_description }`
- [ ] Update `app/(shop)/products/[slug]/landing/page.tsx` to pass product data to the new template
- [ ] Delete `app/admin/products/landing-page-builder.tsx`
- [ ] Remove `@dnd-kit` imports from the landing page flow (keep dnd-kit for category sorting)
- [ ] Verify build passes with `npm run build`
