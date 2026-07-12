import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { AnalyticsEmpty } from "@/components/analytics/analytics-empty";
import {
  OrderStatusPieChart,
  PaymentMethodChart,
  HourlyHeatmap,
} from "@/components/analytics/charts";
import { DataTable } from "@/components/analytics/data-table";
import {
  getOrderStatusDist,
  getPaymentMethods,
  getHourlyOrders,
} from "@/lib/analytics";
import type { DateRange } from "@/components/analytics/date-range-picker";

function formatCurrency(value: number): string {
  return `৳ ${value.toLocaleString()}`;
}

export async function OrdersTab({ dateRange }: { dateRange: DateRange }) {
  const from = `${dateRange.from}T00:00:00Z`;
  const to = `${dateRange.to}T23:59:59Z`;

  const [statusDist, paymentMethods, hourlyOrders] = await Promise.all([
    getOrderStatusDist(from, to),
    getPaymentMethods(from, to),
    getHourlyOrders(from, to),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <AnalyticsChartCard
          title="Order Status Distribution"
          description="Breakdown of all order statuses"
        >
          {statusDist.length > 0 ? (
            <OrderStatusPieChart data={statusDist} />
          ) : (
            <AnalyticsEmpty />
          )}
        </AnalyticsChartCard>

        <AnalyticsChartCard
          title="Payment Methods"
          description="Orders and revenue by payment method"
        >
          {paymentMethods.length > 0 ? (
            <PaymentMethodChart data={paymentMethods} />
          ) : (
            <AnalyticsEmpty />
          )}
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard
        title="Orders by Hour & Day"
        description="When customers place orders"
      >
        {hourlyOrders.length > 0 ? (
          <HourlyHeatmap data={hourlyOrders} />
        ) : (
          <AnalyticsEmpty message="No order data to build heatmap." />
        )}
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Payment Method Breakdown"
        description="Detailed payment statistics"
      >
        {paymentMethods.length > 0 ? (
          <DataTable
            headers={["Method", "Orders", "Revenue", "Share %"]}
            rows={paymentMethods.map((p) => [
              p.method.toUpperCase(),
              p.count,
              formatCurrency(p.revenue),
              p.percentage,
            ])}
          />
        ) : (
          <AnalyticsEmpty />
        )}
      </AnalyticsChartCard>
    </div>
  );
}