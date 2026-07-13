import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  IconLeaf,
  IconHandRock,
  IconHeart,
  IconStar,
  IconShieldCheck,
  IconArrowDown,
} from "@tabler/icons-react";
import { ProductActions } from "@/components/product-actions";
import { ProductReviews } from "@/components/product-reviews";
import { RelatedProducts } from "@/components/related-products";
import type { Product, LandingPageContent } from "@/lib/database/types";

const craftIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  leaf: IconLeaf,
  hand: IconHandRock,
  heart: IconHeart,
  star: IconStar,
  rocket: IconLeaf,
  shield: IconShieldCheck,
  tools: IconHandRock,
  package: IconHeart,
};

interface ProductLandingPageProps {
  product: Product;
}

export function ProductLandingPage({ product }: ProductLandingPageProps) {
  const content = (product.landing_page_sections as LandingPageContent) ?? {};
  const images = Array.isArray(product.images) ? product.images : [];
  const features = product.features ?? [];
  const inStock = product.stock_qty > 0;
  const hasDiscount = product.compare_at != null && product.compare_at > product.price;

  const heroImage = content.hero_image_url || images[0]?.url;
  const description = content.landing_description || product.description;
  const faqItems = content.faq_items ?? [];

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative h-[75vh] min-h-[520px] w-full overflow-hidden">
        {heroImage && (
          <Image
            src={heroImage}
            alt={product.name}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="mx-auto max-w-3xl px-4 lg:px-6">
            {content.hero_subtitle && (
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.25em] text-white/60">
                {content.hero_subtitle}
              </p>
            )}
            <h1 className="font-display text-4xl font-bold text-white drop-shadow-lg sm:text-5xl lg:text-7xl">
              {product.name}
            </h1>
            {product.short_desc && (
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/70 leading-relaxed">
                {product.short_desc}
              </p>
            )}
            <div className="mt-8 flex items-center justify-center gap-4">
              {hasDiscount && (
                <span className="text-lg text-white/40 line-through">
                  ৳ {product.compare_at!.toLocaleString()}
                </span>
              )}
              <span className="text-4xl font-bold text-white lg:text-5xl">
                ৳ {product.price.toLocaleString()}
              </span>
              {hasDiscount && (
                <Badge variant="destructive" className="text-sm">
                  {Math.round(
                    ((product.compare_at! - product.price) / product.compare_at!) * 100
                  )}% OFF
                </Badge>
              )}
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <ProductActions productId={product.id} stockQty={product.stock_qty} />
            </div>
          </div>
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <IconArrowDown className="size-5 text-white/40" />
          </div>
        </div>
      </section>

      {/* ── Quick Specs ──────────────────────────────────── */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <section className="border-b border-border/50 bg-muted/20">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-6 lg:px-6">
            {Object.entries(product.attributes).map(([key, values]) => (
              <div key={key} className="flex items-center gap-2 text-sm">
                <span className="font-medium text-foreground">{key}:</span>
                <span className="text-muted-foreground">
                  {Array.isArray(values) ? values.join(", ") : String(values)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Story ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-muted/30">
        <div className="mx-auto max-w-5xl px-4 py-20 text-center lg:px-6">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
            Our Craft
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight lg:text-4xl">
            Every Piece Tells a Story
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">
            Each piece in our collection is thoughtfully designed and carefully crafted by
            skilled artisans. We blend traditional Bangladeshi craftsmanship with modern
            aesthetics to bring warmth and character into your home.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-6">
            <div className="flex flex-col items-center gap-2">
              <span className="font-display text-3xl font-bold text-primary">100%</span>
              <span className="text-sm text-muted-foreground">Handmade</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="font-display text-3xl font-bold text-primary">500+</span>
              <span className="text-sm text-muted-foreground">Happy Homes</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="font-display text-3xl font-bold text-primary">5★</span>
              <span className="text-sm text-muted-foreground">Customer Love</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Features ─────────────────────────────────── */}
      {features.length > 0 && (
        <section className="mx-auto w-full max-w-6xl px-4 py-20 lg:px-6">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
              Why Choose This
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight lg:text-4xl">
              Crafted for Your Space
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => {
              const Icon = craftIcons[f.icon] ?? IconLeaf;
              return (
                <div
                  key={i}
                  className="group flex flex-col items-center gap-4 rounded-2xl border border-border/50 bg-card p-8 text-center transition-all duration-300 hover:border-primary/20 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon className="size-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Gallery ──────────────────────────────────────── */}
      {images.length > 0 && (
        <section className="bg-muted/20 py-20">
          <div className="mx-auto max-w-6xl px-4 lg:px-6">
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
                See It Up Close
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight lg:text-4xl">
                Gallery
              </h2>
            </div>
            <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.filter((img) => img?.url).map((img, i) => (
                <div
                  key={i}
                  className={`group relative overflow-hidden rounded-xl bg-muted ${
                    i === 0 ? "col-span-2 row-span-2 aspect-square sm:aspect-auto sm:h-full" : "aspect-square"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? `${product.name} ${i + 1}`}
                    fill
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Description ──────────────────────────────────── */}
      {description && (
        <section className="mx-auto w-full max-w-3xl px-4 py-20 lg:px-6">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
              The Details
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight lg:text-4xl">
              About This Piece
            </h2>
          </div>
          <div
            className="mt-8 prose prose-neutral dark:prose-invert max-w-none text-center text-muted-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </section>
      )}

      {/* ── Specifications ───────────────────────────────── */}
      {product.attributes && Object.keys(product.attributes).length > 0 && (
        <section className="bg-muted/20 py-20">
          <div className="mx-auto max-w-3xl px-4 lg:px-6">
            <div className="text-center">
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
                Specifications
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight lg:text-4xl">
                What You Get
              </h2>
            </div>
            <div className="mt-10 overflow-hidden rounded-xl border border-border/50 bg-card">
              <table className="w-full text-sm">
                <tbody>
                  {Object.entries(product.attributes).map(([key, values], i) => (
                    <tr
                      key={key}
                      className={`border-b border-border/30 last:border-b-0 ${
                        i % 2 === 0 ? "bg-muted/30" : ""
                      }`}
                    >
                      <td className="w-44 px-5 py-4 font-medium text-foreground">{key}</td>
                      <td className="px-5 py-4 text-muted-foreground">
                        {Array.isArray(values) ? values.join(", ") : String(values)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ── Sticky Buy Bar ───────────────────────────────── */}
      <div className="sticky bottom-0 z-40 border-t border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-xs text-muted-foreground">{product.name}</p>
              <div className="flex items-baseline gap-2">
                {hasDiscount && (
                  <span className="text-sm text-muted-foreground line-through">
                    ৳ {product.compare_at!.toLocaleString()}
                  </span>
                )}
                <span className="text-xl font-bold text-primary">
                  ৳ {product.price.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <ProductActions productId={product.id} stockQty={product.stock_qty} />
        </div>
      </div>

      {/* ── Reviews ──────────────────────────────────────── */}
      <ProductReviews productId={product.id} />

      {/* ── FAQ ──────────────────────────────────────────── */}
      {faqItems.length > 0 && (
        <section className="mx-auto w-full max-w-3xl px-4 py-20 lg:px-6">
          <div className="text-center">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
              Questions?
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight lg:text-4xl">
              We&apos;ve Got Answers
            </h2>
          </div>
          <Accordion type="single" collapsible className="mt-10">
            {faqItems.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border/50">
                <AccordionTrigger className="text-left text-base font-medium hover:text-primary">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      )}

      {/* ── Final CTA ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-muted/40 py-20">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 px-4 text-center lg:px-6">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-primary">
            Limited Availability
          </p>
          <h2 className="font-display text-3xl font-bold tracking-tight lg:text-5xl">
            Bring This Piece Home
          </h2>
          <p className="max-w-lg text-muted-foreground leading-relaxed">
            {inStock
              ? `Handcrafted and ready to ship — only ${product.stock_qty} available.`
              : "This item is currently out of stock. Check back soon."}
          </p>
          <div className="mt-2 flex items-center gap-4">
            {hasDiscount && (
              <span className="text-xl text-muted-foreground line-through">
                ৳ {product.compare_at!.toLocaleString()}
              </span>
            )}
            <span className="text-3xl font-bold text-primary lg:text-4xl">
              ৳ {product.price.toLocaleString()}
            </span>
          </div>
          <ProductActions productId={product.id} stockQty={product.stock_qty} />
        </div>
      </section>

      <Separator />

      {/* ── Related Products ─────────────────────────────── */}
      <RelatedProducts categoryId={product.category_id} currentProductId={product.id} />
    </div>
  );
}
