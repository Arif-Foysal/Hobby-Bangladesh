import { AnalyticsCard } from "@/components/analytics/analytics-card";
import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { AnalyticsEmpty } from "@/components/analytics/analytics-empty";
import {
  CustomerAcquisitionChart,
  GeographyBarChart,
} from "@/components/analytics/charts";
import {
  getCustomerSummary,
  getCustomerAcquisition,
  getRevenueByGeography,
} from "@/lib/analytics";
import type { DateRange } from "@/components/analytics/date-range-picker";

function formatCurrency(value: number): string {
  return `৳ ${value.toLocaleString()}`;
}

export async function CustomersTab({ dateRange }: { dateRange: DateRange }) {
  const from = `${dateRange.from}T00:00:00Z`;
  const to = `${dateRange.to}T23:59:59Z`;

  const [summary, acquisition, geography] = await Promise.all([
    getCustomerSummary(from, to),
    getCustomerAcquisition(from, to),
    getRevenueByGeography(from, to),
  ]);

  const totalCustomers = summary?.total_customers ?? 0;
  const newCustomers = summary?.new_customers ?? 0;
  const returningCustomers = summary?.returning_customers ?? 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <AnalyticsCard
          title="Total Customers"
          value={totalCustomers.toLocaleString()}
          description="Unique customers in period"
        />
        <AnalyticsCard
          title="New Customers"
          value={newCustomers.toLocaleString()}
          description="First-time buyers"
        />
        <AnalyticsCard
          title="Returning Customers"
          value={returningCustomers.toLocaleString()}
          description="Bought more than once"
        />
        <AnalyticsCard
          title="Avg Lifetime Value"
          value={formatCurrency(summary?.avg_lifetime_value ?? 0)}
          description="Per customer"
        />
      </div>

      <AnalyticsChartCard
        title="Customer Acquisition"
        description="New customers vs returning orders over time"
      >
        {acquisition.length > 0 ? (
          <CustomerAcquisitionChart data={acquisition} />
        ) : (
          <AnalyticsEmpty />
        )}
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Revenue by Geography"
        description="Revenue distribution across divisions"
      >
        {geography.length > 0 ? (
          <GeographyBarChart data={geography} />
        ) : (
          <AnalyticsEmpty />
        )}
      </AnalyticsChartCard>
    </div>
  );
}