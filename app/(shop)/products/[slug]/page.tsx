import { notFound } from "next/navigation";
import Link from "next/link";
import { getProductBySlug } from "../actions";
import { ProductGallery } from "@/components/product-gallery";
import { ProductActions } from "@/components/product-actions";
import { RelatedProducts } from "@/components/related-products";
import { ProductReviews } from "@/components/product-reviews";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { IconChevronRight } from "@tabler/icons-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.name} | Hobby Bangladesh`,
    description: product.short_desc ?? product.description?.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const images = Array.isArray(product.images) ? product.images : [];
  const inStock = product.stock_qty > 0;
  const category = product.categories;

  return (
    <div className="flex flex-col">
      <div className="mx-auto w-full max-w-7xl px-4 pt-4 lg:px-6">
        <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <IconChevronRight className="size-4" />
          <Link href="/products" className="hover:text-foreground">Products</Link>
          {category && (
            <>
              <IconChevronRight className="size-4" />
              <Link href={`/products?category=${category.slug}`} className="hover:text-foreground">
                {category.name}
              </Link>
            </>
          )}
          <IconChevronRight className="size-4" />
          <span className="truncate text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-4 lg:px-6 lg:py-8">
        <div className="grid gap-6 md:grid-cols-2">
          <ProductGallery images={images} />

          <div className="flex flex-col gap-5">
            <div>
              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">
                {product.name}
              </h1>
              {product.short_desc && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {product.short_desc}
                </p>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              {product.compare_at && product.compare_at > product.price && (
                <span className="text-muted-foreground line-through">
                  ৳ {product.compare_at.toLocaleString()}
                </span>
              )}
              <span className="text-3xl font-bold text-primary lg:text-4xl">
                ৳ {product.price.toLocaleString()}
              </span>
              {product.compare_at && product.compare_at > product.price && (
                <Badge variant="destructive">
                  {Math.round(
                    ((product.compare_at - product.price) /
                      product.compare_at) *
                      100
                  )}
                  % OFF
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Badge variant={inStock ? "default" : "destructive"}>
                {inStock
                  ? `In Stock (${product.stock_qty})`
                  : "Out of Stock"}
              </Badge>
              {product.sold_count > 0 && (
                <span className="text-sm text-muted-foreground">
                  {product.sold_count} sold
                </span>
              )}
            </div>

            <Separator />

            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="flex flex-col gap-2 rounded-lg border bg-muted/30 p-4 text-sm">
                {Object.entries(product.attributes).map(([key, values]) => (
                  <div key={key} className="flex items-baseline gap-2">
                    <span className="font-medium text-foreground">{key}:</span>
                    <span className="text-muted-foreground">
                      {Array.isArray(values) ? values.join(", ") : String(values)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <ProductActions
              productId={product.id}
              stockQty={product.stock_qty}
            />

            {product.sku && (
              <p className="text-xs text-muted-foreground">
                SKU: {product.sku}
              </p>
            )}
          </div>
        </div>
      </div>

      {product.description && (
        <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>
      )}

      {product.attributes &&
        Object.keys(product.attributes).length > 0 && (
          <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
            <h2 className="text-lg font-semibold">Attributes</h2>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              {Object.entries(product.attributes).map(([key, values]) => (
                <div key={key}>
                  <span className="text-muted-foreground">{key}:</span>{" "}
                  {Array.isArray(values) ? values.join(", ") : String(values)}
                </div>
              ))}
            </div>
          </div>
        )}

      <div className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-6">
        <Separator />
      </div>

      <ProductReviews productId={product.id} />
      <RelatedProducts
        categoryId={product.category_id}
        currentProductId={product.id}
      />
    </div>
  );
}
