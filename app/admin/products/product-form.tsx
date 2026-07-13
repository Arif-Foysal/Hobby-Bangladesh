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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createProduct, updateProduct, uploadProductImage } from "./actions";
import { compressImage } from "@/lib/image-compress";
import { IconX, IconPhoto, IconPlus, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import type { Category, ProductImage, ProductFeature } from "@/lib/database/types";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

interface FaqItem {
  question: string;
  answer: string;
}

interface LandingPageContent {
  hero_subtitle?: string;
  hero_image_url?: string;
  faq_items?: FaqItem[];
  landing_description?: string;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_desc: string | null;
  price: number;
  compare_at: number | null;
  cost_price: number | null;
  sku: string | null;
  stock_qty: number;
  is_active: boolean;
  category_id: string | null;
  images: ProductImage[];
  features?: ProductFeature[];
  landing_page_enabled?: boolean;
  landing_page_sections?: LandingPageContent;
}

export function ProductForm({
  product,
  categories,
}: {
  product?: ProductData;
  categories: Category[];
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(!!product);
  const [images, setImages] = useState<ProductImage[]>(product?.images ?? []);
  const [features, setFeatures] = useState<ProductFeature[]>(product?.features ?? []);
  const [uploading, setUploading] = useState(false);

  const existingContent = (product?.landing_page_sections as LandingPageContent) ?? {};
  const [landingPageEnabled, setLandingPageEnabled] = useState(product?.landing_page_enabled ?? false);
  const [heroSubtitle, setHeroSubtitle] = useState(existingContent.hero_subtitle ?? "");
  const [heroImageUrl, setHeroImageUrl] = useState(existingContent.hero_image_url ?? "");
  const [landingDescription, setLandingDescription] = useState(existingContent.landing_description ?? "");
  const [faqItems, setFaqItems] = useState<FaqItem[]>(existingContent.faq_items ?? []);
  const [heroUploading, setHeroUploading] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) {
      setSlug(slugify(value));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError(null);
    const newImages: ProductImage[] = [];

    for (const file of Array.from(files)) {
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} exceeds 10MB limit`);
        continue;
      }

      const compressed = await compressImage(file);
      const result = await uploadProductImage(compressed, product?.id ?? "temp");
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
      } else if (result.url) {
        newImages.push({ url: result.url, alt: file.name });
      }
    }

    setImages((prev) => [...prev, ...newImages]);
    setUploading(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setHeroUploading(true);
    const compressed = await compressImage(file, { maxDimension: 1920, targetSize: 900 * 1024 });
    const result = await uploadProductImage(compressed, product?.id ?? "temp");
    if (result.error) {
      toast.error(result.error);
    } else if (result.url) {
      setHeroImageUrl(result.url);
    }
    setHeroUploading(false);
    if (heroImageInputRef.current) heroImageInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const addFaqItem = () => {
    setFaqItems([...faqItems, { question: "", answer: "" }]);
  };

  const updateFaqItem = (index: number, field: "question" | "answer", value: string) => {
    const next = [...faqItems];
    next[index] = { ...next[index], [field]: value };
    setFaqItems(next);
  };

  const removeFaqItem = (index: number) => {
    setFaqItems(faqItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (!slugEdited) {
      formData.set("slug", slugify(name));
    }
    formData.set("images", JSON.stringify(images));
    formData.set("features", JSON.stringify(features));
    formData.set("landing_page_enabled", String(landingPageEnabled));
    formData.set(
      "landing_page_sections",
      JSON.stringify({
        hero_subtitle: heroSubtitle || undefined,
        hero_image_url: heroImageUrl || undefined,
        faq_items: faqItems.length > 0 ? faqItems : undefined,
        landing_description: landingDescription || undefined,
      })
    );

    const result = product
      ? await updateProduct(product.id, formData)
      : await createProduct(formData);

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success(product ? "Product updated" : "Product created");
    router.push("/admin/products");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {product ? "Edit Product" : "New Product"}
          </h2>
          <p className="text-muted-foreground">
            {product
              ? "Update your product details."
              : "Add a new product to your catalog."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || uploading}>
            {loading ? "Saving..." : product ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive lg:mx-6">
          {error}
        </div>
      )}

      <div className="mt-6 flex flex-col gap-6 px-4 lg:px-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div>
              <h3 className="text-sm font-medium">Basic Information</h3>
              <p className="text-xs text-muted-foreground">
                Product name and description.
              </p>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Product name"
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
                placeholder="product-slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugEdited(true);
                }}
                required
              />
              <p className="text-xs text-muted-foreground">
                /products/{slug || "product-slug"}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="short_desc">Short Description</Label>
              <Input
                id="short_desc"
                name="short_desc"
                placeholder="Brief product summary"
                defaultValue={product?.short_desc ?? ""}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed product description..."
                rows={5}
                defaultValue={product?.description ?? ""}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div>
              <h3 className="text-sm font-medium">Organization</h3>
              <p className="text-xs text-muted-foreground">
                Category and visibility settings.
              </p>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Label>Category</Label>
              <Select
                name="category_id"
                defaultValue={product?.category_id ?? "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="none">No category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                name="sku"
                placeholder="e.g. HB-001"
                defaultValue={product?.sku ?? ""}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="is_active" className="cursor-pointer">
                  Active
                </Label>
                <p className="text-xs text-muted-foreground">
                  Product is visible to customers
                </p>
              </div>
              <Switch
                id="is_active"
                name="is_active"
                defaultChecked={product?.is_active ?? true}
              />
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div>
              <h3 className="text-sm font-medium">Pricing</h3>
              <p className="text-xs text-muted-foreground">
                Set product prices in BDT.
              </p>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Label htmlFor="price">Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ৳
                </span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  placeholder="0.00"
                  defaultValue={product?.price ?? ""}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="compare_at">Compare-at Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ৳
                </span>
                <Input
                  id="compare_at"
                  name="compare_at"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  placeholder="0.00"
                  defaultValue={product?.compare_at ?? ""}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Original price to show as strikethrough.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="cost_price">Cost Price</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ৳
                </span>
                <Input
                  id="cost_price"
                  name="cost_price"
                  type="number"
                  step="0.01"
                  min="0"
                  className="pl-7"
                  placeholder="0.00"
                  defaultValue={product?.cost_price ?? ""}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Your cost — not visible to customers.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div>
              <h3 className="text-sm font-medium">Inventory</h3>
              <p className="text-xs text-muted-foreground">
                Stock quantity and availability.
              </p>
            </div>
            <Separator />
            <div className="flex flex-col gap-2">
              <Label htmlFor="stock_qty">Stock Quantity</Label>
              <Input
                id="stock_qty"
                name="stock_qty"
                type="number"
                min="0"
                placeholder="0"
                defaultValue={product?.stock_qty ?? 0}
                required
              />
            </div>
            {product && (
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">Current Stock</span>
                  <span className="text-xs text-muted-foreground">
                    {product.stock_qty > 0
                      ? `${product.stock_qty} units available`
                      : "Out of stock"}
                  </span>
                </div>
                <Badge
                  variant={
                    product.stock_qty > 10
                      ? "default"
                      : product.stock_qty > 0
                        ? "secondary"
                        : "destructive"
                  }
                >
                  {product.stock_qty > 10
                    ? "In Stock"
                    : product.stock_qty > 0
                      ? "Low Stock"
                      : "Out of Stock"}
                </Badge>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">Product Images</h3>
            <p className="text-xs text-muted-foreground">
              Upload images for your product. First image is used as the
              thumbnail.
            </p>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {images.map((img, i) => (
              <div
                key={i}
                className="group relative aspect-square overflow-hidden rounded-lg border"
              >
                <Image
                  src={img.url}
                  alt={img.alt ?? ""}
                  fill
                  sizes="100px"
                  className="object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    className="size-8"
                    onClick={() => removeImage(i)}
                  >
                    <IconX className="size-4" />
                  </Button>
                </div>
                {i === 0 && (
                  <Badge className="absolute left-1.5 top-1.5 text-[10px]">
                    Thumbnail
                  </Badge>
                )}
              </div>
            ))}

            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground transition-colors hover:border-muted-foreground/50 hover:bg-muted/50">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
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
                  <IconPhoto className="size-6" />
                  <span className="text-xs font-medium">Add Image</span>
                </>
              )}
            </label>
          </div>
          <p className="text-xs text-muted-foreground">
            JPEG, PNG, or WebP. Up to 10MB — images are automatically compressed.
          </p>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">Key Features</h3>
            <p className="text-xs text-muted-foreground">
              Highlight 2-4 key selling points shown on the product page.
            </p>
          </div>
          <Separator />
          {features.map((f, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                <Select
                  value={f.icon}
                  onValueChange={(v) => {
                    const next = [...features];
                    next[i] = { ...next[i], icon: v };
                    setFeatures(next);
                  }}
                >
                  <SelectTrigger className="w-full sm:w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["rocket", "shield", "tools", "package"].map((icon) => (
                      <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Title"
                  value={f.title}
                  onChange={(e) => {
                    const next = [...features];
                    next[i] = { ...next[i], title: e.target.value };
                    setFeatures(next);
                  }}
                  className="flex-1"
                />
                <Input
                  placeholder="Short description"
                  value={f.text}
                  onChange={(e) => {
                    const next = [...features];
                    next[i] = { ...next[i], text: e.target.value };
                    setFeatures(next);
                  }}
                  className="flex-1"
                />
              </div>
              <Button type="button" size="icon" variant="ghost" className="mt-0.5 size-8 shrink-0" onClick={() => setFeatures(features.filter((_, idx) => idx !== i))}>
                <IconTrash className="size-4" />
              </Button>
            </div>
          ))}
          {features.length < 4 && (
            <Button type="button" size="sm" variant="outline" onClick={() => setFeatures([...features, { icon: "rocket", title: "", text: "" }])}>
              <IconPlus className="mr-1 size-3" /> Add Feature
            </Button>
          )}
        </div>

        {/* ── Landing Page ─────────────────────────────── */}
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Landing Page</h3>
              <p className="text-xs text-muted-foreground">
                Enable a high-converting landing page at{" "}
                <span className="text-foreground">/products/{slug}/landing</span>
              </p>
            </div>
            <Switch
              checked={landingPageEnabled}
              onCheckedChange={setLandingPageEnabled}
            />
          </div>

          {landingPageEnabled && (
            <>
              <Separator />

              <div className="flex flex-col gap-2">
                <Label>Hero Subtitle</Label>
                <Input
                  placeholder="e.g. Handcrafted Artisan Piece"
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Small text above the product title in the hero section.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Hero Image Override</Label>
                {heroImageUrl ? (
                  <div className="group relative aspect-[21/9] overflow-hidden rounded-lg border">
                    <Image
                      src={heroImageUrl}
                      alt="Hero"
                      fill
                      sizes="100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => heroImageInputRef.current?.click()}
                      >
                        Replace
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex aspect-[21/9] cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-muted-foreground/25 text-muted-foreground hover:border-muted-foreground/50">
                    <input
                      ref={heroImageInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleHeroImageUpload}
                      disabled={heroUploading}
                    />
                    {heroUploading ? (
                      <div className="size-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    ) : (
                      <>
                        <IconPhoto className="size-6" />
                        <span className="text-xs font-medium">Upload Hero Image</span>
                      </>
                    )}
                  </label>
                )}
                <p className="text-xs text-muted-foreground">
                  Optional. Overrides the first product image in the hero section.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Landing Page Description</Label>
                <Textarea
                  placeholder="Rich product description for the landing page (HTML supported)..."
                  rows={5}
                  value={landingDescription}
                  onChange={(e) => setLandingDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Shown in the &quot;About This Product&quot; section. Falls back to the main description.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <Label>FAQ Items</Label>
                  <Button type="button" size="sm" variant="outline" onClick={addFaqItem}>
                    <IconPlus className="mr-1 size-3" /> Add FAQ
                  </Button>
                </div>
                {faqItems.map((item, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-lg border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">Q{i + 1}</span>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-6"
                        onClick={() => removeFaqItem(i)}
                      >
                        <IconTrash className="size-3" />
                      </Button>
                    </div>
                    <Input
                      placeholder="Question"
                      value={item.question}
                      onChange={(e) => updateFaqItem(i, "question", e.target.value)}
                    />
                    <Textarea
                      placeholder="Answer"
                      rows={2}
                      value={item.answer}
                      onChange={(e) => updateFaqItem(i, "answer", e.target.value)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </form>
  );
}
