"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useCallback, useTransition } from "react";

interface FilterOption {
  label: string;
  value: string;
}

interface ToolbarFilter {
  key: string;
  label: string;
  options: FilterOption[];
}

export function DataTableToolbar({
  searchPlaceholder = "Search...",
  filters,
}: {
  searchPlaceholder?: string;
  filters?: ToolbarFilter[];
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const search = searchParams.get("search") ?? "";

  const createQueryString = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === "") {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      }
      if (!updates.page) {
        params.delete("page");
      }
      return params.toString();
    },
    [searchParams]
  );

  const updateUrl = (updates: Record<string, string | null>) => {
    startTransition(() => {
      router.push(`${pathname}?${createQueryString(updates)}`);
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative flex-1 min-w-[200px] max-w-sm">
        <IconSearch className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          defaultValue={search}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "") {
              updateUrl({ search: null });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateUrl({ search: (e.target as HTMLInputElement).value || null });
            }
          }}
          className="pl-9"
          disabled={isPending}
        />
        {search && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 size-7 -translate-y-1/2"
            onClick={() => updateUrl({ search: null })}
          >
            <IconX className="size-3" />
          </Button>
        )}
      </div>

      {filters?.map((filter) => {
        const currentValue = searchParams.get(filter.key) ?? "all";
        return (
          <Select
            key={filter.key}
            value={currentValue}
            onValueChange={(val) =>
              updateUrl({ [filter.key]: val === "all" ? null : val })
            }
          >
            <SelectTrigger className="w-[160px]" disabled={isPending}>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All {filter.label}</SelectItem>
              {filter.options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      })}
    </div>
  );
}
