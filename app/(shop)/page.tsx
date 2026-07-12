import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { getStoreSetting } from "@/lib/supabase/store";
import {
  IconArrowRight,
  IconCategory,
} from "@tabler/icons-react";
import { FadeIn } from "@/components/fade-in";
import type { HeroSlidesConfig } from "@/lib/database/types";
import { HeroCarousel } from "@/components/hero-carousel";
import { HeaderSearch } from "@/components/header-search";
import { ProductCard } from "@/components/product-card";

export const metadata = {
  title: "Hobby Bangladesh — Your Hobby Store",
  description:
    "Discover hobby products in Bangladesh. RC cars, models, tools, and more.",
};

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

async function getHeroSlides() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", "hero_slides")
    .single();

  if (!data?.value) return [];
  return ((data.value as HeroSlidesConfig).slides ?? []);
}

async function getFeaturedProducts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("is_active", true)
    .order("sold_count", { ascending: false })
    .limit(8);
  return data || [];
}

async function getActiveCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .limit(6);
  return data || [];
}

export default async function HomePage() {
  const [storeInfo, heroSlides, featuredProducts, categories] =
    await Promise.all([
      getStoreSetting("store"),
      getHeroSlides(),
      getFeaturedProducts(),
      getActiveCategories(),
    ]);

  const storeName = (storeInfo as { name?: string })?.name ?? "Hobby Bangladesh";

  return (
    <div className="flex flex-col">
      {/* Hero Carousel */}
      {heroSlides.length > 0 ? (
        <section className="relative w-full">
          <HeroCarousel slides={heroSlides} />
        </section>
      ) : (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-background to-muted/40">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-20 lg:flex-row lg:px-6 lg:py-32">
            <div className="max-w-2xl text-center lg:text-left">
              <h1 className="font-display text-5xl font-bold tracking-tight sm:text-6xl">
                Welcome to {storeName}
              </h1>
              <p className="mt-4 text-xl text-muted-foreground">
                Discover a curated collection of hobby products. From RC cars to
                model kits, find everything you need for your next project.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Button asChild size="lg">
                  <Link href="/products">
                    Browse Products <IconArrowRight />
                  </Link>
                </Button>
              </div>
              <div className="mt-6">
                <HeaderSearch />
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="flex size-72 items-center justify-center rounded-full bg-primary/10">
                <div className="flex size-48 items-center justify-center rounded-full bg-primary/20">
                  <IconCategory className="size-20 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories */}
      {categories.length > 0 && (
        <FadeIn delay={100}>
        <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              Browse Categories
            </h2>
            <Button variant="ghost" asChild>
              <Link href="/products">
                View All <IconArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/products?category=${cat.slug}`}
                className="group"
              >
                <Card className="overflow-hidden border-0 bg-muted/50 transition-all hover:shadow-lg">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={cat.image_url || PLACEHOLDER_IMG}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h3 className="text-xl font-semibold text-white drop-shadow-md">
                        {cat.name}
                      </h3>
                      {cat.description && (
                        <p className="mt-0.5 line-clamp-1 text-sm text-white/80">
                          {cat.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        </FadeIn>
      )}

      <Separator />

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <FadeIn delay={200}>
        <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold tracking-tight">
                Popular Products
              </h2>
              <p className="text-base text-muted-foreground">Our best-selling items.</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">
                View All <IconArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAt={product.compare_at}
                images={Array.isArray(product.images) ? product.images : []}
                categoryName={product.categories?.name}
                ratingAvg={product.rating_avg}
              />
            ))}
          </div>
        </section>
        </FadeIn>
      )}

      {/* Empty state */}
      {featuredProducts.length === 0 && categories.length === 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-24 text-center lg:px-6">
          <IconCategory className="mx-auto size-16 text-muted-foreground" />
          <h2 className="mt-4 font-display text-3xl font-bold">
            Welcome to {storeName}
          </h2>
          <p className="mt-2 text-muted-foreground">
            Products are being added. Check back soon!
          </p>
          <div className="mt-6 flex justify-center">
            <HeaderSearch />
          </div>
        </section>
      )}
    </div>
  );
}
