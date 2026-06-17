import { Suspense } from "react";
import { getProductsForListing } from "./actions";
import { getCategories } from "../../admin/categories/actions";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata = {
  title: "Products | Hobby Bangladesh",
  description: "Browse our collection of hobby products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string; sort?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1") || 1;
  const categorySlug = params.category;
  const search = params.search;
  const sort = params.sort;

  const [{ products, totalPages }, categories] = await Promise.all([
    getProductsForListing({ categorySlug, search, sort, page }),
    getCategories(),
  ]);

  const activeCategories = categories
    .filter((c) => c.is_active)
    .map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Browse our collection of hobby products.
        </p>
      </div>

      <Suspense>
        <ProductFilters
          categories={activeCategories}
          currentCategory={categorySlug}
          currentSort={sort}
          currentSearch={search}
        />
      </Suspense>

      {products.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <p className="text-lg text-muted-foreground">No products found.</p>
          <Button asChild>
            <Link href="/products">Clear filters</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAt={product.compare_at}
                images={
                  Array.isArray(product.images) ? product.images : []
                }
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(categorySlug && { category: categorySlug }),
                      ...(search && { search }),
                      ...(sort && { sort }),
                      page: String(page - 1),
                    }).toString()}`}
                  >
                    Previous
                  </Link>
                </Button>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Button variant="outline" asChild>
                  <Link
                    href={`/products?${new URLSearchParams({
                      ...(categorySlug && { category: categorySlug }),
                      ...(search && { search }),
                      ...(sort && { sort }),
                      page: String(page + 1),
                    }).toString()}`}
                  >
                    Next
                  </Link>
                </Button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
