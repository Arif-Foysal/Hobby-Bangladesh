"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { useCallback, useTransition } from "react";

export function DateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const dateFrom = searchParams.get("dateFrom") ?? "";
  const dateTo = searchParams.get("dateTo") ?? "";

  const updateUrl = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [searchParams, router, pathname, startTransition]
  );

  return (
    <div className="flex items-center gap-2">
      <Input
        type="date"
        defaultValue={dateFrom}
        className="w-auto"
        style={{ colorScheme: "dark light" }}
        disabled={isPending}
        onChange={(e) => updateUrl("dateFrom", e.target.value || null)}
      />
      <span className="text-sm text-muted-foreground">to</span>
      <Input
        type="date"
        defaultValue={dateTo}
        className="w-auto"
        style={{ colorScheme: "dark light" }}
        disabled={isPending}
        onChange={(e) => updateUrl("dateTo", e.target.value || null)}
      />
    </div>
  );
}