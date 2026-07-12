"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DateRangePicker,
  type DateRange,
} from "@/components/analytics/date-range-picker";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "sales", label: "Sales" },
  { value: "customers", label: "Customers" },
  { value: "products", label: "Products" },
  { value: "orders", label: "Orders" },
  { value: "search", label: "Search" },
  { value: "coupons", label: "Coupons" },
  { value: "cohorts", label: "Cohorts" },
] as const;

export function AnalyticsDashboard({
  dateRange,
  activeTab,
  children,
}: {
  dateRange: DateRange;
  activeTab: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateUrl(params: Record<string, string>) {
    const current = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      current.set(key, value);
    });
    router.push(`/admin?${current.toString()}`, { scroll: false });
  }

  function handleTabChange(tab: string) {
    updateUrl({ tab });
  }

  function handleDateRangeChange(range: DateRange) {
    updateUrl({ from: range.from, to: range.to });
  }

  return (
    <>
      <div className="px-4 lg:px-6">
        <DateRangePicker value={dateRange} onChange={handleDateRangeChange} />
      </div>
      <div className="px-4 lg:px-6">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="flex w-full flex-wrap justify-start gap-1 overflow-x-auto">
            {TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value={activeTab} className="mt-4">
            {children}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}