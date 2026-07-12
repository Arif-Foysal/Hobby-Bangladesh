"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IconSearch } from "@tabler/icons-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function ProductFilters({
  categories,
  currentCategory,
  currentSort,
  currentSearch,
  totalResults,
  currentMinPrice,
  currentMaxPrice,
  currentInStock,
}: {
  categories: { name: string; slug: string }[];
  currentCategory?: string;
  currentSort?: string;
  currentSearch?: string;
  totalResults?: number;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  currentInStock?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const priceDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleSearchChange = useCallback(
    (value: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        updateParam("search", value);
      }, 300);
    },
    [updateParam]
  );

  const handlePriceChange = useCallback(
    (key: string, value: string) => {
      if (priceDebounceRef.current) clearTimeout(priceDebounceRef.current);
      priceDebounceRef.current = setTimeout(() => {
        updateParam(key, value);
      }, 400);
    },
    [updateParam]
  );

  const handleStockToggle = useCallback(
    (checked: boolean) => {
      updateParam("inStock", checked ? "true" : "");
    },
    [updateParam]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            className="pl-9"
            defaultValue={currentSearch}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
        <Select
          defaultValue={currentSort ?? "newest"}
          onValueChange={(value) => updateParam("sort", value)}
        >
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      {/* Price range + stock filter row */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="min-price" className="text-xs text-muted-foreground">Min</Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">৳</span>
            <Input
              id="min-price"
              type="number"
              min={0}
              placeholder="0"
              className="h-10 w-24 pl-5 text-base"
              defaultValue={currentMinPrice !== undefined ? String(currentMinPrice) : ""}
              onChange={(e) => handlePriceChange("minPrice", e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="max-price" className="text-xs text-muted-foreground">Max</Label>
          <div className="relative">
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">৳</span>
            <Input
              id="max-price"
              type="number"
              min={0}
              placeholder="Any"
              className="h-10 w-24 pl-5 text-base"
              defaultValue={currentMaxPrice !== undefined ? String(currentMaxPrice) : ""}
              onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            id="in-stock"
            checked={currentInStock ?? false}
            onCheckedChange={handleStockToggle}
          />
          <Label htmlFor="in-stock" className="text-sm cursor-pointer">In stock only</Label>
        </div>
      </div>

      {/* Result count */}
      {currentSearch && (
        <p className="text-xs text-muted-foreground">
          {totalResults !== undefined
            ? `Showing results for "${currentSearch}" (${totalResults} found)`
            : `Searching for "${currentSearch}"...`}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        <Link
          href={pathname}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm transition-colors",
            !currentCategory
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`${pathname}?category=${cat.slug}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm transition-colors",
              currentCategory === cat.slug
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
