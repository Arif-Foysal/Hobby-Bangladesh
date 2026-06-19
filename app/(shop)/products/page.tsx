import { Suspense } from "react";
import { getProductsForListing, getSearchSuggestions, logSearchQuery } from "./actions";
import { getCategories } from "../../admin/categories/actions";
import { ProductCard } from "@/components/product-card";
import { ProductFilters } from "@/components/product-filters";
import { Button } from "@/components/ui/button";
import { IconPackage, IconSearch, IconBulb, IconSparkles } from "@tabler/icons-react";
import Link from "next/link";

export const metadata = {
  title: "Products | Hobby Bangladesh",
  description: "Browse our collection of hobby products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
    minPrice?: string;
    maxPrice?: string;
    inStock?: string;
  }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1") || 1;
  const categorySlug = params.category;
  const search = params.search;
  const sort = params.sort;
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const inStock = params.inStock === "true";

  const [{ products, totalPages, total, fuzzyResults }, categories] = await Promise.all([
    getProductsForListing({ categorySlug, search, sort, page, minPrice, maxPrice, inStock }),
    getCategories(),
  ]);

  const fuzzy = fuzzyResults && fuzzyResults.length > 0;

  const activeCategories = categories
    .filter((c) => c.is_active)
    .map((c) => ({ name: c.name, slug: c.slug }));

  // Did-you-mean suggestions when no results
  let suggestions: { suggestion: string; similarity: number }[] = [];
  if (products.length === 0 && search) {
    suggestions = await getSearchSuggestions(search);
    await logSearchQuery(search, 0);
  } else if (products.length > 0 && search) {
    await logSearchQuery(search, total);
  }

  function buildPageUrl(pageNum: number) {
    const p = new URLSearchParams();
    if (categorySlug) p.set("category", categorySlug);
    if (search) p.set("search", search);
    if (sort) p.set("sort", sort);
    if (minPrice !== undefined) p.set("minPrice", String(minPrice));
    if (maxPrice !== undefined) p.set("maxPrice", String(maxPrice));
    if (inStock) p.set("inStock", "true");
    p.set("page", String(pageNum));
    return `/products?${p.toString()}`;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Products</h1>
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
          totalResults={total}
          currentMinPrice={minPrice}
          currentMaxPrice={maxPrice}
          currentInStock={inStock}
        />
      </Suspense>

      {fuzzy ? (
        <>
          <div className="mt-6 flex items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 text-sm">
            <IconSparkles className="size-4 text-primary" />
            <span>
              No exact matches for &ldquo;{search}&rdquo;. Showing similar results.
            </span>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {fuzzyResults.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAt={product.compare_at}
                images={Array.isArray(product.images) ? product.images : []}
                categoryName={product.categories?.name}
                ratingAvg={product.rating_avg}
                soldCount={product.sold_count}
              />
            ))}
          </div>
          <div className="mt-6 flex justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/products">Clear search</Link>
            </Button>
          </div>
        </>
      ) : products.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          {search ? (
            <>
              <IconSearch className="size-12 text-muted-foreground" />
              <p className="text-lg font-medium">No results for &ldquo;{search}&rdquo;</p>
              <p className="max-w-md text-sm text-muted-foreground">
                Try different keywords, check your spelling, or browse our categories below.
              </p>

              {suggestions.length > 0 && (
                <div className="mt-2 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <IconBulb className="size-4" />
                    <span>Did you mean&hellip;</span>
                  </div>
                  <div className="flex flex-wrap justify-center gap-2">
                    {suggestions.map((s) => (
                      <Button key={s.suggestion} variant="secondary" size="sm" asChild>
                        <Link href={`/products?search=${encodeURIComponent(s.suggestion)}`}>
                          {s.suggestion}
                        </Link>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-2">
                {activeCategories.length > 0 && activeCategories.slice(0, 4).map((cat) => (
                  <Button key={cat.slug} variant="outline" size="sm" asChild>
                    <Link href={`/products?category=${cat.slug}`}>
                      {cat.name}
                    </Link>
                  </Button>
                ))}
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/products">Clear all filters</Link>
                </Button>
              </div>
            </>
          ) : categorySlug ? (
            <>
              <IconPackage className="size-12 text-muted-foreground" />
              <p className="text-lg font-medium">No products in this category</p>
              <p className="text-sm text-muted-foreground">
                This category is empty. Try browsing all products.
              </p>
              <Button asChild>
                <Link href="/products">Browse All Products</Link>
              </Button>
            </>
          ) : (
            <>
              <IconPackage className="size-12 text-muted-foreground" />
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm text-muted-foreground">
                Try different filters or check back later.
              </p>
              <Button asChild>
                <Link href="/products">Clear Filters</Link>
              </Button>
            </>
          )}
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
                categoryName={product.categories?.name}
                ratingAvg={product.rating_avg}
                soldCount={product.sold_count}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {page > 1 && (
                <Button variant="outline" asChild>
                  <Link href={buildPageUrl(page - 1)}>
                    Previous
                  </Link>
                </Button>
              )}
              <span className="flex items-center px-4 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Button variant="outline" asChild>
                  <Link href={buildPageUrl(page + 1)}>
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
