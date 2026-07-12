import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { AnalyticsEmpty } from "@/components/analytics/analytics-empty";
import { RevenueByCategoryBarChart } from "@/components/analytics/charts";
import { DataTable } from "@/components/analytics/data-table";
import {
  getTopProducts,
  getBottomProducts,
  getRevenueByCategory,
  getInventoryTurnover,
} from "@/lib/analytics";
import type { DateRange } from "@/components/analytics/date-range-picker";

function formatCurrency(value: number): string {
  return `৳ ${value.toLocaleString()}`;
}

export async function ProductsTab({ dateRange }: { dateRange: DateRange }) {
  const from = `${dateRange.from}T00:00:00Z`;
  const to = `${dateRange.to}T23:59:59Z`;

  const [topProducts, bottomProducts, revenueByCategory, inventory] = await Promise.all([
    getTopProducts(from, to, 10),
    getBottomProducts(from, to, 10),
    getRevenueByCategory(from, to),
    getInventoryTurnover(from, to),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsChartCard
        title="Category Performance"
        description="Revenue comparison across categories"
      >
        {revenueByCategory.length > 0 ? (
          <RevenueByCategoryBarChart data={revenueByCategory} />
        ) : (
          <AnalyticsEmpty />
        )}
      </AnalyticsChartCard>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsChartCard
          title="Top 10 Products"
          description="Highest revenue earners"
        >
          {topProducts.length > 0 ? (
            <DataTable
              headers={["Product", "Category", "Units", "Revenue"]}
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

        <AnalyticsChartCard
          title="Bottom 10 Products"
          description="Lowest revenue earners"
        >
          {bottomProducts.length > 0 ? (
            <DataTable
              headers={["Product", "Category", "Units", "Revenue"]}
              rows={bottomProducts.map((p) => [
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

      <AnalyticsChartCard
        title="Inventory Turnover"
        description="Units sold vs current stock (top 20)"
      >
        {inventory.length > 0 ? (
          <DataTable
            headers={["Product", "Current Stock", "Units Sold", "Turnover Rate"]}
            rows={inventory.map((p) => [
              p.product_name,
              p.current_stock,
              p.units_sold,
              `${p.turnover_rate}x`,
            ])}
          />
        ) : (
          <AnalyticsEmpty />
        )}
      </AnalyticsChartCard>
    </div>
  );
}