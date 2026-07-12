import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { AnalyticsEmpty } from "@/components/analytics/analytics-empty";
import { DataTable } from "@/components/analytics/data-table";
import { getCouponPerformance } from "@/lib/analytics";
import type { DateRange } from "@/components/analytics/date-range-picker";

function formatCurrency(value: number): string {
  return `৳ ${value.toLocaleString()}`;
}

export async function CouponsTab({ dateRange }: { dateRange: DateRange }) {
  const from = `${dateRange.from}T00:00:00Z`;
  const to = `${dateRange.to}T23:59:59Z`;

  const coupons = await getCouponPerformance(from, to);

  const totalDiscount = coupons.reduce((sum, c) => sum + c.discount_given, 0);
  const totalRevenue = coupons.reduce((sum, c) => sum + c.revenue_with_coupon, 0);
  const totalUsage = coupons.reduce((sum, c) => sum + c.usage_count, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-3">
        <AnalyticsChartCard title="Total Coupon Revenue" description="Revenue from coupon orders">
          <p className="text-2xl font-semibold tabular-nums">
            {formatCurrency(totalRevenue)}
          </p>
        </AnalyticsChartCard>
        <AnalyticsChartCard title="Total Discount Given" description="Revenue impact of discounts">
          <p className="text-2xl font-semibold tabular-nums">
            {formatCurrency(totalDiscount)}
          </p>
        </AnalyticsChartCard>
        <AnalyticsChartCard title="Total Coupon Usage" description="Number of coupon orders">
          <p className="text-2xl font-semibold tabular-nums">
            {totalUsage.toLocaleString()}
          </p>
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard
        title="Coupon Performance"
        description="Revenue, discount impact, and usage per coupon"
      >
        {coupons.length > 0 ? (
          <DataTable
            headers={["Code", "Usage", "Revenue", "Discount", "Avg Order"]}
            rows={coupons.map((c) => [
              c.code,
              c.usage_count,
              formatCurrency(c.revenue_with_coupon),
              formatCurrency(c.discount_given),
              formatCurrency(c.avg_order_value),
            ])}
          />
        ) : (
          <AnalyticsEmpty message="No coupon usage in this period." />
        )}
      </AnalyticsChartCard>
    </div>
  );
}