import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/server";
import type { ProductImage } from "@/lib/database/types";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-family='system-ui' font-size='16'%3ENo Image%3C/text%3E%3C/svg%3E";

export async function RelatedProducts({
  categoryId,
  currentProductId,
}: {
  categoryId: string | null;
  currentProductId: string;
}) {
  if (!categoryId) return null;

  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_at, images")
    .eq("is_active", true)
    .eq("category_id", categoryId)
    .neq("id", currentProductId)
    .limit(4);

  if (!products || products.length === 0) return null;

  return (
    <section className="mt-12">
      <h2 className="text-2xl font-bold tracking-tight">Related Products</h2>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => {
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
              <Card className="overflow-hidden transition-all hover:shadow-lg">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={image?.url || PLACEHOLDER_IMG}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
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
                  <h3 className="truncate text-sm font-medium">
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
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
