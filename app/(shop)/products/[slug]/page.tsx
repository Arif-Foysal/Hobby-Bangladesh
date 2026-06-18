import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "../actions";
import { ProductGallery } from "@/components/product-gallery";
import { ProductActions } from "@/components/product-actions";
import { RelatedProducts } from "@/components/related-products";
import { ProductReviews } from "@/components/product-reviews";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import {
  IconChevronRight,
  IconTruckDelivery,
  IconShieldCheck,
  IconRecycle,
} from "@tabler/icons-react";
import { getStoreSetting } from "@/lib/supabase/store";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | Hobby Bangladesh`,
    description: product.short_desc ?? product.description?.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const images = Array.isArray(product.images) ? product.images : [];
  const inStock = product.stock_qty > 0;
  const category = product.categories;
  const shipping = await getStoreSetting("shipping") as {
    inside_dhaka: number;
    outside_dhaka: number;
    free_shipping_min: number;
  } | null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {category && (
          <>
            <IconChevronRight className="size-3" />
            <Link
              href={`/products?category=${category.slug}`}
              className="hover:text-foreground"
            >
              {category.name}
            </Link>
          </>
        )}
        <IconChevronRight className="size-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={images} />

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            {product.short_desc && (
              <p className="mt-2 text-muted-foreground">
                {product.short_desc}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-primary">
              ৳ {product.price.toLocaleString()}
            </span>
            {product.compare_at && product.compare_at > product.price && (
              <span className="text-lg text-muted-foreground line-through">
                ৳ {product.compare_at.toLocaleString()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={inStock ? "default" : "destructive"}
              className="w-fit"
            >
              {inStock ? `In Stock (${product.stock_qty})` : "Out of Stock"}
            </Badge>
            {product.sold_count > 0 && (
              <span className="text-sm text-muted-foreground">
                {product.sold_count} sold
              </span>
            )}
          </div>

          {/* Shipping Info */}
          <Card className="bg-muted/30">
            <CardContent className="flex flex-col gap-2 p-3 text-sm">
              <div className="flex items-center gap-2">
                <IconTruckDelivery className="size-4 text-primary" />
                <span>
                  {shipping
                    ? `Shipping: ৳${shipping.inside_dhaka} (Dhaka) / ৳${shipping.outside_dhaka} (Other)`
                    : "Shipping calculated at checkout"}
                </span>
              </div>
              {shipping && shipping.free_shipping_min > 0 && (
                <div className="flex items-center gap-2">
                  <IconShieldCheck className="size-4 text-primary" />
                  <span>Free shipping on orders over ৳{shipping.free_shipping_min.toLocaleString()}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <IconRecycle className="size-4 text-primary" />
                <span>7-day easy return</span>
              </div>
            </CardContent>
          </Card>

          <Separator />

          {product.description && (
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            </div>
          )}

          <ProductActions productId={product.id} stockQty={product.stock_qty} />

          {product.sku && (
            <p className="text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}
        </div>
      </div>

      <ProductReviews productId={product.id} />
      <RelatedProducts categoryId={product.category_id} currentProductId={product.id} />
    </div>
  );
}
