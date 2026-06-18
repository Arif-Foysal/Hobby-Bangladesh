import { SectionCards } from "@/components/section-cards";
import { ChartSales } from "@/components/chart-sales";
import { LowStockAlerts } from "@/components/low-stock-alerts";
import { getStoreSetting } from "@/lib/supabase/store";

export default async function AdminPage() {
  const storeInfo = await getStoreSetting("store");
  const storeName = (storeInfo as { name?: string })?.name ?? "Dashboard";

  return (
    <>
      <div className="flex flex-col gap-1 px-4 lg:px-6">
        <h2 className="font-display text-2xl font-bold tracking-tight">{storeName}</h2>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s an overview of your store.
        </p>
      </div>
      <SectionCards />
      <LowStockAlerts />
      <div className="px-4 lg:px-6">
        <ChartSales />
      </div>
    </>
  );
}
