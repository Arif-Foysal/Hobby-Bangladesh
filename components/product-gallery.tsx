"use client";

import { useState } from "react";
import Image from "next/image";
import type { ProductImage } from "@/lib/database/types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-muted-foreground">
        No image available
      </div>
    );
  }

  const active = images[activeIndex];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
        <Image
          src={active.url}
          alt={active.alt ?? "Product image"}
          fill
          className="object-cover"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`relative size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                i === activeIndex
                  ? "border-primary"
                  : "border-transparent hover:border-muted-foreground/25"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `Thumbnail ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
