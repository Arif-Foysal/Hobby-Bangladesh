"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BuyNowButton } from "@/components/buy-now-button";
import { IconStarFilled, IconPhotoOff, IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import type { ProductImage } from "@/lib/database/types";

export function ProductCard({
  name,
  slug,
  productId,
  price,
  compareAt,
  images,
  categoryName,
  ratingAvg,
  stockQty,
}: {
  name: string;
  slug: string;
  productId: string;
  price: number;
  compareAt: number | null;
  images: ProductImage[];
  categoryName?: string | null;
  ratingAvg?: number | null;
  stockQty: number;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const image = images[activeIndex] ?? images[0] ?? null;
  const hasDiscount = compareAt && compareAt > price;
  const hasMultiple = images.length > 1;

  const cycleImage = (e: React.MouseEvent, direction: 1 | -1) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveIndex((prev) => {
      const next = prev + direction;
      if (next < 0) return images.length - 1;
      if (next >= images.length) return 0;
      return next;
    });
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden border border-border/50 bg-muted/30 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5">
      <Link href={`/products/${slug}`} className="block relative aspect-square overflow-hidden bg-muted">
        {image?.url ? (
          <Image
            src={image.url}
            alt={name}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
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

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={(e) => cycleImage(e, -1)}
              className="absolute left-1.5 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover:opacity-100"
              aria-label="Previous image"
            >
              <IconChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={(e) => cycleImage(e, 1)}
              className="absolute right-1.5 top-1/2 z-10 flex size-7 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/70 group-hover:opacity-100"
              aria-label="Next image"
            >
              <IconChevronRight className="size-4" />
            </button>
            <div className="absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
              {images.map((_, i) => (
                <span
                  key={i}
                  className={`size-1.5 rounded-full transition-colors ${
                    i === activeIndex ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </Link>
      <CardContent className="flex flex-1 flex-col p-4">
        {categoryName && (
          <p className="text-xs text-muted-foreground">{categoryName}</p>
        )}
        <h3 className="mt-0.5 truncate text-sm font-medium">{name}</h3>
        <div className="mt-1 flex items-baseline gap-2">
          {hasDiscount && (
            <span className="text-sm text-muted-foreground line-through">
              ৳ {compareAt.toLocaleString()}
            </span>
          )}
          <span className="text-base font-semibold text-primary">৳ {price.toLocaleString()}</span>
        </div>
        {ratingAvg != null && ratingAvg > 0 && (
          <div className="mt-1 flex items-center gap-1">
            <IconStarFilled className="size-3.5 text-yellow-500" />
            <span className="text-xs text-muted-foreground">
              {ratingAvg.toFixed(1)}
            </span>
          </div>
        )}
        <div className="mt-auto pt-3">
          <BuyNowButton
            productId={productId}
            stockQty={stockQty}
            size="sm"
            className="w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
