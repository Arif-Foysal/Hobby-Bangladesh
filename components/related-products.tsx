import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconPhotoOff } from "@tabler/icons-react";
import { createClient } from "@/lib/supabase/server";
import type { ProductImage } from "@/lib/database/types";

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
      <h2 className="font-display text-2xl font-bold tracking-tight">Related Products</h2>
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
              <Card className="overflow-hidden border-0 bg-muted/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <Image
                    src={image?.url || ""}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {!image?.url && (
                    <div className="flex size-full items-center justify-center text-muted-foreground">
                      <IconPhotoOff className="size-8" />
                    </div>
                  )}
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
                    <span className="font-semibold text-primary">
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
