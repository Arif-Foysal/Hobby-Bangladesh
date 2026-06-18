"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCategory, updateCategory, uploadCategoryImage } from "./actions";
import { IconPhoto, IconX } from "@tabler/icons-react";
import { toast } from "sonner";
import type { Category } from "@/lib/database/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function CategoryForm({
  category,
  categories,
}: {
  category?: Category;
  categories: Category[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!category);
  const [imageUrl, setImageUrl] = useState(category?.image_url ?? "");
  const [uploading, setUploading] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB");
      return;
    }

    setUploading(true);
    setError(null);
    const result = await uploadCategoryImage(file);
    setUploading(false);

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
    } else if (result.url) {
      setImageUrl(result.url);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (!slugEdited) {
      formData.set("slug", slugify(name));
    }
    formData.set("image_url", imageUrl);

    const result = category
      ? await updateCategory(category.id, formData)
      : await createCategory(formData);

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success(category ? "Category updated" : "Category created");
    router.push("/admin/categories");
  };

  const parentCategories = categories.filter(
    (c) => c.id !== category?.id && !c.parent_id
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {category ? "Edit Category" : "New Category"}
          </h2>
          <p className="text-muted-foreground">
            {category
              ? "Update category details."
              : "Create a new product category."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categories")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : category ? "Update Category" : "Create Category"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive lg:mx-6">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 px-4 lg:grid-cols-2 lg:px-6">
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">Category Details</h3>
            <p className="text-xs text-muted-foreground">
              Name, slug, and description.
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="Category name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              name="slug"
              placeholder="category-slug"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugEdited(true);
              }}
              required
            />
            <p className="text-xs text-muted-foreground">
              /products?category={slug || "category-slug"}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Category description..."
              rows={3}
              defaultValue={category?.description ?? ""}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">Settings</h3>
            <p className="text-xs text-muted-foreground">
              Parent, sort order, and visibility.
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label>Parent Category</Label>
            <Select
              name="parent_id"
              defaultValue={category?.parent_id ?? "none"}
            >
              <SelectTrigger>
                <SelectValue placeholder="None (top-level)" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="none">None (top-level)</SelectItem>
                  {parentCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              min="0"
              placeholder="0"
              defaultValue={category?.sort_order ?? 0}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Image</Label>
            {imageUrl ? (
              <div className="group relative aspect-video overflow-hidden rounded-lg border">
                <Image
                  src={imageUrl}
                  alt={name || "Category"}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="size-8"
                    onClick={() => setImageUrl("")}
                  >
                    <IconX className="size-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/50">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <>
                    <div className="size-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    <span className="text-xs">Uploading...</span>
                  </>
                ) : (
                  <>
                    <IconPhoto className="size-8" />
                    <span className="text-sm font-medium">Upload Image</span>
                    <span className="text-xs">JPEG, PNG, or WebP. Max 5MB.</span>
                  </>
                )}
              </label>
            )}
            <input type="hidden" name="image_url" value={imageUrl} />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
              <p className="text-xs text-muted-foreground">
                Category is visible to customers
              </p>
            </div>
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={category?.is_active ?? true}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
