import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { AnalyticsEmpty } from "@/components/analytics/analytics-empty";
import { CohortHeatmap } from "@/components/analytics/charts";
import { getCohortRetention } from "@/lib/analytics";
import type { DateRange } from "@/components/analytics/date-range-picker";

export async function CohortsTab({ dateRange }: { dateRange: DateRange }) {
  const from = `${dateRange.from}T00:00:00Z`;
  const to = `${dateRange.to}T23:59:59Z`;

  const cohorts = await getCohortRetention(from, to);

  const firstOrderCohorts = cohorts.filter((c) => c.months_since === 0);
  const totalCohortCustomers = firstOrderCohorts.reduce(
    (sum, c) => sum + c.cohort_size,
    0
  );
  const avgRetentionM1 = (() => {
    const m1 = cohorts.filter((c) => c.months_since === 1);
    if (m1.length === 0) return 0;
    return m1.reduce((sum, c) => sum + c.retention_pct, 0) / m1.length;
  })();

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        <AnalyticsChartCard
          title="Total Cohort Customers"
          description="New customers grouped by first order month"
        >
          <p className="text-2xl font-semibold tabular-nums">
            {totalCohortCustomers.toLocaleString()}
          </p>
        </AnalyticsChartCard>
        <AnalyticsChartCard
          title="Avg Month-1 Retention"
          description="Average retention rate after 1 month"
        >
          <p className="text-2xl font-semibold tabular-nums">
            {avgRetentionM1.toFixed(1)}%
          </p>
        </AnalyticsChartCard>
      </div>

      <AnalyticsChartCard
        title="Cohort Retention Heatmap"
        description="Customer retention by cohort month and months since first purchase"
      >
        {cohorts.length > 0 ? (
          <CohortHeatmap data={cohorts} />
        ) : (
          <AnalyticsEmpty message="Not enough data for cohort analysis. Need orders spanning multiple months." />
        )}
      </AnalyticsChartCard>
    </div>
  );
}