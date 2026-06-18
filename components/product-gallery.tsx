"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { IconChevronLeft, IconChevronRight, IconPhotoOff } from "@tabler/icons-react";
import type { ProductImage } from "@/lib/database/types";

export function ProductGallery({ images }: { images: ProductImage[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <IconPhotoOff className="size-12" />
      </div>
    );
  }

  const active = images[activeIndex];

  const prev = () => setActiveIndex((i) => (i > 0 ? i - 1 : images.length - 1));
  const next = () => setActiveIndex((i) => (i < images.length - 1 ? i + 1 : 0));

  return (
    <>
      <div className="flex flex-col gap-3">
        <button
          onClick={() => setLightboxOpen(true)}
          className="relative aspect-square overflow-hidden rounded-lg bg-muted cursor-zoom-in"
        >
          <Image
            src={active.url}
            alt={active.alt ?? "Product image"}
            fill
            className="object-cover"
            priority
          />
        </button>
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative size-20 shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
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

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl p-0">
          <DialogTitle className="sr-only">Product image {activeIndex + 1} of {images.length}</DialogTitle>
          <div className="relative aspect-square">
            <Image
              src={active.url}
              alt={active.alt ?? "Product image"}
              fill
              className="object-contain"
            />
            {images.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full"
                  onClick={(e) => { e.stopPropagation(); prev(); }}
                >
                  <IconChevronLeft />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full"
                  onClick={(e) => { e.stopPropagation(); next(); }}
                >
                  <IconChevronRight />
                </Button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex justify-center gap-2 pb-4">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  className={`size-2 rounded-full transition-colors ${
                    i === activeIndex ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
