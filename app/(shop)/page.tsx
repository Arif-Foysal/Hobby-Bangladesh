import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { createClient } from "@/lib/supabase/server";
import { getStoreSetting } from "@/lib/supabase/store";
import {
  IconArrowRight,
  IconCategory,
  IconStarFilled,
  IconTruckDelivery,
  IconShieldCheck,
  IconRecycle,
  IconHeadset,
} from "@tabler/icons-react";
import { FadeIn } from "@/components/fade-in";
import type { ProductImage, HeroSlidesConfig } from "@/lib/database/types";
import { HeaderSearch } from "@/components/header-search";

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

const trustItems = [
  {
    icon: IconTruckDelivery,
    title: "Free Shipping",
    desc: "On orders over ৳5,000",
  },
  {
    icon: IconShieldCheck,
    title: "Secure Payment",
    desc: "SSLCommerz protected",
  },
  {
    icon: IconRecycle,
    title: "Easy Returns",
    desc: "7-day return policy",
  },
  {
    icon: IconHeadset,
    title: "24/7 Support",
    desc: "Call or WhatsApp us",
  },
];

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
          <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent>
              {heroSlides.map((slide, i) => (
                <CarouselItem key={i}>
                  <div className="relative h-[50vh] min-h-[320px] w-full overflow-hidden md:h-[60vh]">
                    <Image
                      src={slide.image_url}
                      alt={slide.title ?? `Slide ${i + 1}`}
                      fill
                      className="object-cover"
                      priority={i === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute inset-0 flex items-end">
                      <div className="mx-auto w-full max-w-7xl px-4 pb-12 lg:px-6">
                        {slide.title && (
                          <h1 className="text-3xl font-bold text-white drop-shadow-lg sm:text-4xl lg:text-5xl">
                            {slide.title}
                          </h1>
                        )}
                        <div className="mt-4 flex gap-3">
                          {slide.link ? (
                            <Button asChild size="lg">
                              <Link href={slide.link}>
                                Shop Now <IconArrowRight />
                              </Link>
                            </Button>
                          ) : (
                            <Button asChild size="lg">
                              <Link href="/products">
                                Browse Products <IconArrowRight />
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-4" />
            <CarouselNext className="right-4" />
          </Carousel>
        </section>
      ) : (
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-muted/30">
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-16 lg:flex-row lg:px-6 lg:py-24">
            <div className="max-w-2xl text-center lg:text-left">
              <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
                Welcome to {storeName}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
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

      {/* Trust Bar */}
      <FadeIn>
        <section className="border-y bg-muted/30">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4 lg:px-6">
            {trustItems.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-lg px-3 py-2"
              >
                <item.icon className="size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-xs font-semibold">{item.title}</p>
                  <p className="text-[11px] text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </FadeIn>

      {/* Categories */}
      {categories.length > 0 && (
        <FadeIn delay={100}>
        <section className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-6 lg:py-16">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold tracking-tight">
                Shop by Category
              </h2>
              <p className="text-muted-foreground">
                Find exactly what you need.
              </p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">
                View All <IconArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
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
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <h3 className="text-lg font-semibold text-white drop-shadow-md">
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
              <h2 className="font-display text-2xl font-bold tracking-tight">
                Popular Products
              </h2>
              <p className="text-muted-foreground">Our best-selling items.</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/products">
                View All <IconArrowRight />
              </Link>
            </Button>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const images: ProductImage[] = Array.isArray(product.images)
                ? product.images
                : [];
              const image = images.length > 0 ? images[0] : null;
              const hasDiscount =
                product.compare_at && product.compare_at > product.price;

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group"
                >
                  <Card className="overflow-hidden border-0 bg-muted/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                    <div className="relative aspect-square overflow-hidden bg-muted">
                      <Image
                        src={image?.url || PLACEHOLDER_IMG}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {hasDiscount && (
                        <Badge
                          className="absolute left-2 top-2"
                          variant="destructive"
                        >
                          {Math.round(
                            ((product.compare_at! - product.price) /
                              product.compare_at!) *
                              100
                          )}
                          % OFF
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-3">
                      {product.categories?.name && (
                        <p className="text-xs text-muted-foreground">
                          {product.categories.name}
                        </p>
                      )}
                      <h3 className="mt-0.5 truncate text-sm font-medium">
                        {product.name}
                      </h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-semibold">
                          ৳ {product.price.toLocaleString()}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-muted-foreground line-through">
                            ৳ {product.compare_at!.toLocaleString()}
                          </span>
                        )}
                      </div>
                      {product.rating_avg > 0 && (
                        <div className="mt-1 flex items-center gap-1">
                          <IconStarFilled className="size-3 text-yellow-500" />
                          <span className="text-xs text-muted-foreground">
                            {product.rating_avg.toFixed(1)}
                          </span>
                          {product.sold_count > 0 && (
                            <span className="text-xs text-muted-foreground">
                              ({product.sold_count} sold)
                            </span>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
        </FadeIn>
      )}

      {/* Empty state */}
      {featuredProducts.length === 0 && categories.length === 0 && (
        <section className="mx-auto w-full max-w-7xl px-4 py-24 text-center lg:px-6">
          <IconCategory className="mx-auto size-12 text-muted-foreground" />
          <h2 className="mt-4 font-display text-2xl font-bold">
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
