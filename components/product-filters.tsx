"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useRef } from "react";
import { Input } from "@/components/ui/input";
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
}: {
  categories: { name: string; slug: string }[];
  currentCategory?: string;
  currentSort?: string;
  currentSearch?: string;
  totalResults?: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

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
            "rounded-full px-3 py-1 text-sm transition-colors",
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
              "rounded-full px-3 py-1 text-sm transition-colors",
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
