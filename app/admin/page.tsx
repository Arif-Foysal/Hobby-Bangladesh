import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard";
import type { DateRange } from "@/components/analytics/date-range-picker";
import { OverviewTab } from "@/components/analytics/tabs/overview";
import { SalesTab } from "@/components/analytics/tabs/sales";
import { CustomersTab } from "@/components/analytics/tabs/customers";
import { ProductsTab } from "@/components/analytics/tabs/products";
import { OrdersTab } from "@/components/analytics/tabs/orders";
import { SearchTab } from "@/components/analytics/tabs/search";
import { CouponsTab } from "@/components/analytics/tabs/coupons";
import { CohortsTab } from "@/components/analytics/tabs/cohorts";
import { getStoreSetting } from "@/lib/supabase/store";
import { Suspense } from "react";

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function getDefaultDateRange(): DateRange {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date();
  from.setDate(from.getDate() - 90);
  from.setHours(0, 0, 0, 0);
  return { from: toISODate(from), to: toISODate(to) };
}

const VALID_TABS = [
  "overview",
  "sales",
  "customers",
  "products",
  "orders",
  "search",
  "coupons",
  "cohorts",
];

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const storeInfo = await getStoreSetting("store");
  const storeName = (storeInfo as { name?: string })?.name ?? "Dashboard";
  const params = await searchParams;

  const defaults = getDefaultDateRange();
  const from = typeof params.from === "string" ? params.from : defaults.from;
  const to = typeof params.to === "string" ? params.to : defaults.to;
  const dateRange = { from, to };

  const activeTab =
    typeof params.tab === "string" && VALID_TABS.includes(params.tab)
      ? params.tab
      : "overview";

  return (
    <>
      <div className="flex flex-col gap-1 px-4 lg:px-6">
        <h2 className="font-display text-2xl font-bold tracking-tight">{storeName}</h2>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s an overview of your store.
        </p>
      </div>
      <Suspense fallback={<div className="p-6 text-muted-foreground">Loading analytics…</div>}>
        <AnalyticsDashboard dateRange={dateRange} activeTab={activeTab}>
          {activeTab === "overview" && <OverviewTab dateRange={dateRange} />}
          {activeTab === "sales" && <SalesTab dateRange={dateRange} />}
          {activeTab === "customers" && <CustomersTab dateRange={dateRange} />}
          {activeTab === "products" && <ProductsTab dateRange={dateRange} />}
          {activeTab === "orders" && <OrdersTab dateRange={dateRange} />}
          {activeTab === "search" && <SearchTab dateRange={dateRange} />}
          {activeTab === "coupons" && <CouponsTab dateRange={dateRange} />}
          {activeTab === "cohorts" && <CohortsTab dateRange={dateRange} />}
        </AnalyticsDashboard>
      </Suspense>
    </>
  );
}