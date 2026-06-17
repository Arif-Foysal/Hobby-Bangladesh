"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { saveHeroSlides, uploadHeroImage } from "./actions";
import { IconX, IconArrowUp, IconArrowDown, IconPhoto } from "@tabler/icons-react";
import type { HeroSlide } from "@/lib/database/types";

export function HeroSlidesManager({
  initialSlides,
}: {
  initialSlides: HeroSlide[];
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      if (file.size > 5 * 1024 * 1024) continue;

      const result = await uploadHeroImage(file);
      if (result.url) {
        setSlides((prev) => [...prev, { image_url: result.url! }]);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeSlide = (index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const updated = [...slides];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setSlides(updated);
  };

  const updateSlide = (index: number, field: keyof HeroSlide, value: string) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value || undefined } : s))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    await saveHeroSlides(slides);
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Carousel Slides</CardTitle>
        <CardDescription>
          Upload images for the homepage hero carousel. Recommended size: 1920x600px.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {slides.map((slide, i) => (
            <div
              key={i}
              className="group relative aspect-[21/9] overflow-hidden rounded-lg border"
            >
              <Image
                src={slide.image_url}
                alt={slide.title ?? `Slide ${i + 1}`}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="size-7"
                  onClick={() => moveSlide(i, "up")}
                  disabled={i === 0}
                >
                  <IconArrowUp className="size-3" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="size-7"
                  onClick={() => moveSlide(i, "down")}
                  disabled={i === slides.length - 1}
                >
                  <IconArrowDown className="size-3" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="size-7"
                  onClick={() => removeSlide(i)}
                >
                  <IconX className="size-3" />
                </Button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1.5 text-center text-[10px] text-white">
                Slide {i + 1}
              </div>
            </div>
          ))}

          <label className="flex aspect-[21/9] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/50">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            {uploading ? (
              <>
                <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                <span className="text-xs">Uploading...</span>
              </>
            ) : (
              <>
                <IconPhoto className="size-6" />
                <span className="text-xs font-medium">Add Slide</span>
              </>
            )}
          </label>
        </div>

        {slides.length > 0 && (
          <>
            <Separator />
            <div className="flex flex-col gap-3">
              <h4 className="text-sm font-medium">Slide Details (optional)</h4>
              {slides.map((slide, i) => (
                <div key={i} className="grid gap-2 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Title overlay</Label>
                    <Input
                      placeholder="e.g. Summer Sale"
                      value={slide.title ?? ""}
                      onChange={(e) => updateSlide(i, "title", e.target.value)}
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Label className="text-xs">Link URL</Label>
                    <Input
                      placeholder="e.g. /products?category=sale"
                      value={slide.link ?? ""}
                      onChange={(e) => updateSlide(i, "link", e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || uploading}>
            {saving ? "Saving..." : "Save Slides"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
