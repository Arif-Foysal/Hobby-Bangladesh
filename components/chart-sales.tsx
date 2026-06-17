import { createClient } from "@/lib/supabase/server";
import { ChartSalesClient } from "./chart-sales-client";

export async function ChartSales() {
  const supabase = await createClient();

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 90);

  const { data: orders } = await supabase
    .from("orders")
    .select("total, created_at")
    .eq("payment_status", "paid")
    .gte("created_at", startDate.toISOString())
    .order("created_at", { ascending: true });

  const dailyData: Record<string, { revenue: number; orders: number }> = {};

  for (let i = 89; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyData[key] = { revenue: 0, orders: 0 };
  }

  (orders || []).forEach((order) => {
    const key = order.created_at.split("T")[0];
    if (dailyData[key]) {
      dailyData[key].revenue += order.total;
      dailyData[key].orders += 1;
    }
  });

  const chartData = Object.entries(dailyData).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
  }));

  return <ChartSalesClient data={chartData} />;
}
