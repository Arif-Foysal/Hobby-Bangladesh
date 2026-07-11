import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IconStarFilled, IconPhotoOff } from "@tabler/icons-react";
import type { ProductImage } from "@/lib/database/types";

export function ProductCard({
  name,
  slug,
  price,
  compareAt,
  images,
  categoryName,
  ratingAvg,
  soldCount,
}: {
  name: string;
  slug: string;
  price: number;
  compareAt: number | null;
  images: ProductImage[];
  categoryName?: string | null;
  ratingAvg?: number | null;
  soldCount?: number | null;
}) {
  const image = images.length > 0 ? images[0] : null;
  const hasDiscount = compareAt && compareAt > price;

  return (
    <Card className="group flex h-full flex-col overflow-hidden border-0 bg-muted/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <Link href={`/products/${slug}`} className="flex h-full flex-col">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {image?.url ? (
            <Image
              src={image.url}
              alt={name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <IconPhotoOff className="size-8" />
            </div>
          )}
          {hasDiscount && (
            <Badge className="absolute left-2 top-2" variant="destructive">
              {Math.round(((compareAt - price) / compareAt) * 100)}% OFF
            </Badge>
          )}
        </div>
        <CardContent className="flex flex-1 flex-col p-3">
          {categoryName && (
            <p className="text-xs text-muted-foreground">{categoryName}</p>
          )}
          <h3 className="mt-0.5 truncate text-sm font-medium">{name}</h3>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-semibold text-primary">৳ {price.toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through">
                ৳ {compareAt.toLocaleString()}
              </span>
            )}
          </div>
          {(ratingAvg && ratingAvg > 0) || (soldCount && soldCount > 0) ? (
            <div className="mt-1 flex items-center gap-1">
              {ratingAvg && ratingAvg > 0 && (
                <>
                  <IconStarFilled className="size-3 text-yellow-500" />
                  <span className="text-xs text-muted-foreground">
                    {ratingAvg.toFixed(1)}
                  </span>
                </>
              )}
              {soldCount && soldCount > 0 && (
                <span className="text-xs text-muted-foreground">
                  {ratingAvg && ratingAvg > 0 ? "·" : ""} {soldCount} sold
                </span>
              )}
            </div>
          ) : null}
          <div className="mt-auto pt-3">
            <Button size="sm" className="w-full" asChild>
              <Link href={`/products/${slug}`}>Order Now</Link>
            </Button>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
