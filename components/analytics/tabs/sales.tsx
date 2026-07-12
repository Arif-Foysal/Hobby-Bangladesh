import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { AnalyticsEmpty } from "@/components/analytics/analytics-empty";
import {
  SalesTrendChart,
  AvgOrderValueChart,
  RevenueByCategoryBarChart,
  HourlyHeatmap,
} from "@/components/analytics/charts";
import { DataTable } from "@/components/analytics/data-table";
import {
  getDailySales,
  getRevenueByCategory,
  getTopProducts,
  getHourlyOrders,
} from "@/lib/analytics";
import type { DateRange } from "@/components/analytics/date-range-picker";

function formatCurrency(value: number): string {
  return `৳ ${value.toLocaleString()}`;
}

export async function SalesTab({ dateRange }: { dateRange: DateRange }) {
  const from = `${dateRange.from}T00:00:00Z`;
  const to = `${dateRange.to}T23:59:59Z`;

  const [dailySales, revenueByCategory, topProducts, hourlyOrders] = await Promise.all([
    getDailySales(from, to),
    getRevenueByCategory(from, to),
    getTopProducts(from, to, 10),
    getHourlyOrders(from, to),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsChartCard
        title="Revenue Trend"
        description="Daily revenue and order count"
      >
        {dailySales.length > 0 ? (
          <SalesTrendChart data={dailySales} />
        ) : (
          <AnalyticsEmpty />
        )}
      </AnalyticsChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsChartCard
          title="Average Order Value"
          description="AOV trend over time"
        >
          {dailySales.length > 0 ? (
            <AvgOrderValueChart data={dailySales} />
          ) : (
            <AnalyticsEmpty />
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Revenue by Category"
          description="Category performance comparison"
        >
          {revenueByCategory.length > 0 ? (
            <RevenueByCategoryBarChart data={revenueByCategory} />
          ) : (
            <AnalyticsEmpty />
          )}
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard
        title="Orders by Hour & Day"
        description="Heatmap of order frequency"
      >
        {hourlyOrders.length > 0 ? (
          <HourlyHeatmap data={hourlyOrders} />
        ) : (
          <AnalyticsEmpty message="No order data to build heatmap." />
        )}
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Top 10 Products"
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