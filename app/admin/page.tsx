import { SectionCards } from "@/components/section-cards";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { getStoreSetting } from "@/lib/supabase/store";

export default async function AdminPage() {
  const storeInfo = await getStoreSetting("store");

  return (
    <>
      <div className="px-4 lg:px-6">
        <h2 className="text-2xl font-bold tracking-tight">
          {storeInfo?.name ?? "Dashboard"}
        </h2>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s an overview of your store.
        </p>
      </div>
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
    </>
  );
}
