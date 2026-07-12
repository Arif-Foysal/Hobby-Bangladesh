import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { AnalyticsEmpty } from "@/components/analytics/analytics-empty";
import { SalesTrendChart, RevenueDonutChart } from "@/components/analytics/charts";
import { DataTable } from "@/components/analytics/data-table";
import { LowStockAlerts } from "@/components/low-stock-alerts";
import {
  getSalesSummary,
  getDailySales,
  getRevenueByCategory,
  getTopProducts,
} from "@/lib/analytics";
import type { DateRange } from "@/components/analytics/date-range-picker";

function formatCurrency(value: number): string {
  return `৳ ${value.toLocaleString()}`;
}

export async function OverviewTab({ dateRange }: { dateRange: DateRange }) {
  const from = `${dateRange.from}T00:00:00Z`;
  const to = `${dateRange.to}T23:59:59Z`;

  const [summary, dailySales, revenueByCategory, topProducts] = await Promise.all([
    getSalesSummary(from, to),
    getDailySales(from, to),
    getRevenueByCategory(from, to),
    getTopProducts(from, to, 5),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <AnalyticsCard
          title="Revenue"
          value={formatCurrency(summary?.total_revenue ?? 0)}
          description="Total revenue"
          changePct={summary?.revenue_change_pct}
        />
        <AnalyticsCard
          title="Orders"
          value={(summary?.total_orders ?? 0).toLocaleString()}
          description="Total orders"
          changePct={summary?.orders_change_pct}
        />
        <AnalyticsCard
          title="Avg Order Value"
          value={formatCurrency(summary?.avg_order_value ?? 0)}
          description="Per order"
        />
        <AnalyticsCard
          title="Revenue (Prev Period)"
          value={formatCurrency(summary?.previous_revenue ?? 0)}
          description={`${(summary?.previous_orders ?? 0).toLocaleString()} orders`}
        />
      </div>

      <LowStockAlerts />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AnalyticsChartCard
            title="Sales Trend"
            description="Revenue and orders over time"
          >
            {dailySales.length > 0 ? (
              <SalesTrendChart data={dailySales} />
            ) : (
              <AnalyticsEmpty />
            )}
          </AnalyticsChartCard>
        </div>
        <AnalyticsChartCard
          title="Revenue by Category"
          description="Distribution across categories"
        >
          {revenueByCategory.length > 0 ? (
            <RevenueDonutChart data={revenueByCategory} />
          ) : (
            <AnalyticsEmpty />
          )}
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard
        title="Top 5 Products"
        description="Best performers by revenue"
      >
        {topProducts.length > 0 ? (
          <DataTable
            headers={["Product", "Category", "Units Sold", "Revenue"]}
            rows={topProducts.map((p) => [
              p.product_name,
              p.category_name,
              p.units_sold,
              formatCurrency(p.revenue),
            ])}
          />
        ) : (
          <AnalyticsEmpty />
        )}
      </AnalyticsChartCard>
    </div>
  );
}