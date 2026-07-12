"use client";

import { useState } from "react";
import Image from "next/image";
import {
  IconChevronRight,
  IconPhotoOff,
} from "@tabler/icons-react";
import Link from "next/link";
import type { ProductImage } from "@/lib/database/types";

export function ProductHero({
  name,
  images,
  categoryName,
  categorySlug,
}: {
  name: string;
  images: ProductImage[];
  categoryName?: string | null;
  categorySlug?: string | null;
}) {
  const [selected, setSelected] = useState(0);
  const image = images[selected];

  return (
    <div className="relative overflow-hidden bg-muted">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_420px] lg:px-6 lg:py-12">
        {/* Main image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-background lg:aspect-[16/10]">
          {image?.url ? (
            <Image
              src={image.url}
              alt={image.alt ?? name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500"
              priority
            />
          ) : (
            <div className="flex size-full items-center justify-center text-muted-foreground">
              <IconPhotoOff className="size-16" />
            </div>
          )}
        </div>

        {/* Thumbnails + info sidebar */}
        <div className="flex flex-col gap-4">
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelected(i)}
                  className={`relative size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                    i === selected
                      ? "border-primary"
                      : "border-transparent hover:border-muted-foreground/30"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? `${name} ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <nav className="flex items-center gap-1 text-xs text-muted-foreground">
            <Link href="/products" className="hover:text-foreground">
              Products
            </Link>
            {categoryName && categorySlug && (
              <>
                <IconChevronRight className="size-3" />
                <Link
                  href={`/products?category=${categorySlug}`}
                  className="hover:text-foreground"
                >
                  {categoryName}
                </Link>
              </>
            )}
            <IconChevronRight className="size-3" />
            <span className="text-foreground truncate">{name}</span>
          </nav>
        </div>
      </div>
    </div>
  );
}
