"use client";

import { useState, useRef, useId } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { saveHeroSlides, uploadHeroImage } from "./actions";
import { IconX, IconGripVertical, IconPhoto, IconRefresh } from "@tabler/icons-react";
import { toast } from "sonner";
import type { HeroSlide } from "@/lib/database/types";

const MAX_WIDTH = 1920;
const JPEG_QUALITY = 0.85;

async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const width = Math.min(bitmap.width, MAX_WIDTH);
  const height = Math.round((bitmap.height / bitmap.width) * width);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return resolve(file);
        const ext = file.type === "image/png" ? "png" : "jpg";
        const compressed = new File([blob], file.name.replace(/\.[^.]+$/, `.${ext}`), {
          type: ext === "png" ? "image/png" : "image/jpeg",
        });
        resolve(compressed);
      },
      "image/jpeg",
      JPEG_QUALITY
    );
  });
}

function SortableSlide({
  slide,
  index,
  onRemove,
  onUpdate,
  onReplaceImage,
}: {
  slide: HeroSlide;
  index: number;
  onRemove: () => void;
  onUpdate: (field: keyof HeroSlide, value: string | boolean) => void;
  onReplaceImage: (file: File) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `hero-slide-${index}`,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging}
      className="group relative flex flex-col overflow-hidden rounded-lg border bg-card data-[dragging=true]:z-10 data-[dragging=true]:shadow-lg data-[dragging=true]:ring-2 data-[dragging=true]:ring-primary/30"
    >
      <div className="flex items-stretch">
        <button
          {...attributes}
          {...listeners}
          className="flex w-10 shrink-0 items-center justify-center bg-muted/50 text-muted-foreground transition-colors hover:bg-muted"
        >
          <IconGripVertical className="size-4" />
          <span className="sr-only">Drag to reorder</span>
        </button>

        <div className="relative h-28 w-40 shrink-0 overflow-hidden bg-muted sm:h-32 sm:w-48">
          <Image
            src={slide.image_url}
            alt={slide.title ?? `Slide ${index + 1}`}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              className="size-8"
              onClick={() => fileInputRef.current?.click()}
            >
              <IconRefresh className="size-3.5" />
              <span className="sr-only">Replace image</span>
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              className="size-8"
              onClick={onRemove}
            >
              <IconX className="size-3.5" />
              <span className="sr-only">Remove slide</span>
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onReplaceImage(file);
              e.target.value = "";
            }}
          />
          <div className="absolute bottom-0 left-0 bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
            {index + 1}
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-3">
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Title overlay</Label>
            <Input
              placeholder="e.g. Summer Sale"
              value={slide.title ?? ""}
              onChange={(e) => onUpdate("title", e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-xs text-muted-foreground">Link URL</Label>
            <Input
              placeholder="e.g. /products?category=sale"
              value={slide.link ?? ""}
              onChange={(e) => onUpdate("link", e.target.value)}
              className="h-8 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HeroSlidesManager({
  initialSlides,
}: {
  initialSlides: HeroSlide[];
}) {
  const sortableId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const slideIds = slides.map((_, i) => `hero-slide-${i}`);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = slideIds.indexOf(active.id as string);
    const newIndex = slideIds.indexOf(over.id as string);
    setSlides((prev) => arrayMove(prev, oldIndex, newIndex));
    setDirty(true);
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      toast.info(`Optimizing ${file.name}...`);
      const compressed = await compressImage(file);

      const result = await uploadHeroImage(compressed);
      if (result.error) {
        toast.error(result.error);
      } else if (result.url) {
        setSlides((prev) => [...prev, { image_url: result.url! }]);
        setDirty(true);
      }
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleReplaceImage = async (index: number, file: File) => {
    toast.info(`Optimizing image...`);
    const compressed = await compressImage(file);

    const result = await uploadHeroImage(compressed);
    if (result.error) {
      toast.error(result.error);
    } else if (result.url) {
      setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, image_url: result.url! } : s)));
      setDirty(true);
    }
  };

  const removeSlide = (index: number) => {
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setDirty(true);
  };

  const updateSlide = (index: number, field: keyof HeroSlide, value: string | boolean) => {
    setSlides((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value || undefined } : s))
    );
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await saveHeroSlides(slides);
    setSaving(false);
    if (result.success) {
      toast.success("Hero slides saved");
      setDirty(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Carousel Slides</CardTitle>
        <CardDescription>
          Upload images, drag to reorder, and edit overlays. Recommended size: 1920×600px.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {slides.length > 0 && (
          <div className="flex items-center gap-6 rounded-lg border bg-muted/50 px-4 py-3">
            <span className="text-xs font-medium text-muted-foreground">Global</span>
            <div className="flex items-center gap-2">
              <Switch
                id="global-show-title"
                checked={slides.some((s) => s.show_title !== false)}
                onCheckedChange={(checked) => {
                  setSlides((prev) => prev.map((s) => ({ ...s, show_title: checked })));
                  setDirty(true);
                }}
              />
              <Label htmlFor="global-show-title" className="text-xs cursor-pointer">Title</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="global-show-button"
                checked={slides.some((s) => s.show_button !== false)}
                onCheckedChange={(checked) => {
                  setSlides((prev) => prev.map((s) => ({ ...s, show_button: checked })));
                  setDirty(true);
                }}
              />
              <Label htmlFor="global-show-button" className="text-xs cursor-pointer">Button</Label>
            </div>
          </div>
        )}

        {slides.length > 0 ? (
          <DndContext
            collisionDetection={closestCenter}
            modifiers={[restrictToVerticalAxis]}
            onDragEnd={handleDragEnd}
            sensors={sensors}
            id={sortableId}
          >
            <SortableContext items={slideIds} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {slides.map((slide, i) => (
                  <SortableSlide
                    key={`hero-slide-${i}`}
                    slide={slide}
                    index={i}
                    onRemove={() => removeSlide(i)}
                    onUpdate={(field, value) => updateSlide(i, field, value)}
                    onReplaceImage={(file) => handleReplaceImage(i, file)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 py-12 text-muted-foreground">
            <IconPhoto className="size-10 mb-2" />
            <p className="text-sm font-medium">No slides yet</p>
            <p className="text-xs">Upload images to get started.</p>
          </div>
        )}

        <label className="flex h-24 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/50">
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
              <div className="size-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <IconPhoto className="size-5" />
              <span className="text-sm font-medium">Add Slide</span>
            </>
          )}
        </label>

        {slides.length > 0 && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving || uploading || !dirty}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
