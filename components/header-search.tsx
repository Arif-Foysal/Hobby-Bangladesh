"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { IconSearch, IconPhotoOff, IconClock } from "@tabler/icons-react";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_at: number | null;
  images: { url: string }[];
  short_desc: string | null;
  categories: { name: string; slug: string } | null;
}

const RECENT_SEARCHES_KEY = "hb_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(q: string) {
  try {
    const recent = getRecentSearches().filter((s) => s !== q);
    recent.unshift(q);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
  } catch {
    // localStorage may be unavailable
  }
}

export function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q.trim())}`);
      const json = await res.json();
      setResults(json.results || []);
      setSelectedIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchResults(value), 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && results[selectedIndex]) {
      router.push(`/products/${results[selectedIndex].slug}`);
      setOpen(false);
      setQuery("");
      return;
    }
    if (query.trim()) {
      addRecentSearch(query.trim());
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      inputRef.current?.blur();
      setOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleGlobalKey);
    return () => document.removeEventListener("keydown", handleGlobalKey);
  }, []);

  const showDropdown = open && (query.trim().length > 0 || recentSearches.length > 0);
  const hasResults = results.length > 0;

  return (
    <div className="relative">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <IconSearch className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Search products... (⌘K)"
            value={query}
            onChange={(e) => {
              handleChange(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            className="h-9 w-40 pl-9 text-sm transition-all duration-200 focus:w-56 md:w-56 md:focus:w-80"
          />
          {loading && (
            <div className="absolute right-2.5 top-1/2 size-4 -translate-y-1/2">
              <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-primary" />
            </div>
          )}
        </div>
      </form>

      {showDropdown && (
        <Card
          ref={dropdownRef}
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-80 min-w-[320px] overflow-y-auto shadow-lg"
        >
          {/* Recent searches when query is empty */}
          {query.trim() === "" && recentSearches.length > 0 && (
            <div className="p-2">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Recent searches
              </p>
              {recentSearches.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                  onClick={() => {
                    setQuery(s);
                    setOpen(false);
                    router.push(`/products?search=${encodeURIComponent(s)}`);
                  }}
                >
                  <IconClock className="size-3.5 text-muted-foreground" />
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* No results */}
          {query.trim() !== "" && !hasResults && !loading && (
            <div className="p-6 text-center text-sm text-muted-foreground">
              No products found for &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Results */}
          {hasResults && (
            <div className="p-1">
              <p className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Products
              </p>
              {results.map((item, i) => {
                const image = item.images?.[0];
                const hasDiscount =
                  item.compare_at && item.compare_at > item.price;

                return (
                  <Link
                    key={item.id}
                    href={`/products/${item.slug}`}
                    className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-accent ${
                      i === selectedIndex ? "bg-accent" : ""
                    }`}
                    onClick={() => {
                      setOpen(false);
                      setQuery("");
                    }}
                  >
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      {image?.url ? (
                        <Image
                          src={image.url}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground">
                          <IconPhotoOff className="size-4" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <p className="truncate font-medium">{item.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.categories?.name}
                        {item.short_desc && (
                          <>
                            {" · "}
                            {item.short_desc}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex items-baseline gap-1 text-sm">
                      <span className="font-semibold">
                        ৳ {item.price.toLocaleString()}
                      </span>
                      {hasDiscount && (
                        <span className="text-xs text-muted-foreground line-through">
                          ৳ {item.compare_at!.toLocaleString()}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
              <div className="border-t px-2 py-1.5">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    addRecentSearch(query);
                    router.push(`/products?search=${encodeURIComponent(query)}`);
                    setOpen(false);
                  }}
                >
                  <IconSearch className="size-3" />
                  View all results for &ldquo;{query}&rdquo;
                </button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
