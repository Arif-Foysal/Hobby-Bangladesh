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
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <nav className="mb-6 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/products" className="hover:text-foreground">
          Products
        </Link>
        {category && (
          <>
            <IconChevronRight className="size-3" />
            <Link
              href={`/products?category=${category.slug}`}
              className="hover:text-foreground"
            >
              {category.name}
            </Link>
          </>
        )}
        <IconChevronRight className="size-3" />
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 md:grid-cols-2">
        <ProductGallery images={images} />

        <div className="flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {product.name}
            </h1>
            {product.short_desc && (
              <p className="mt-2 text-muted-foreground">
                {product.short_desc}
              </p>
            )}
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">
              ৳ {product.price.toLocaleString()}
            </span>
            {product.compare_at && product.compare_at > product.price && (
              <span className="text-lg text-muted-foreground line-through">
                ৳ {product.compare_at.toLocaleString()}
              </span>
            )}
          </div>

          <Badge
            variant={inStock ? "default" : "destructive"}
            className="w-fit"
          >
            {inStock ? `In Stock (${product.stock_qty})` : "Out of Stock"}
          </Badge>

          <Separator />

          {product.description && (
            <div className="prose prose-sm max-w-none">
              <p>{product.description}</p>
            </div>
          )}

          <ProductActions productId={product.id} stockQty={product.stock_qty} />

          {product.sku && (
            <p className="text-xs text-muted-foreground">
              SKU: {product.sku}
            </p>
          )}
        </div>
      </div>

      <ProductReviews productId={product.id} />
      <RelatedProducts categoryId={product.category_id} currentProductId={product.id} />
    </div>
  );
}
