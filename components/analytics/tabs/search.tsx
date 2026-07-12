import { AnalyticsChartCard } from "@/components/analytics/analytics-chart-card";
import { AnalyticsEmpty } from "@/components/analytics/analytics-empty";
import { DataTable } from "@/components/analytics/data-table";
import {
  getSearchTopQueries,
  getSearchZeroResults,
} from "@/lib/analytics";
import type { DateRange } from "@/components/analytics/date-range-picker";

export async function SearchTab({ dateRange }: { dateRange: DateRange }) {
  const from = `${dateRange.from}T00:00:00Z`;
  const to = `${dateRange.to}T23:59:59Z`;

  const [topQueries, zeroResults] = await Promise.all([
    getSearchTopQueries(from, to, 20),
    getSearchZeroResults(from, to, 20),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <AnalyticsChartCard
        title="Top 20 Search Queries"
        description="Most searched terms and average result count"
      >
        {topQueries.length > 0 ? (
          <DataTable
            headers={["Query", "Searches", "Avg Results"]}
            rows={topQueries.map((q) => [
              q.query,
              q.count,
              q.avg_results,
            ])}
          />
        ) : (
          <AnalyticsEmpty message="No search activity in this period." />
        )}
      </AnalyticsChartCard>

      <AnalyticsChartCard
        title="Zero-Result Searches"
        description="Searches that returned no products — candidates for inventory or SEO improvements"
      >
        {zeroResults.length > 0 ? (
          <DataTable
            headers={["Query", "Searches"]}
            rows={zeroResults.map((q) => [q.query, q.count])}
          />
        ) : (
          <AnalyticsEmpty message="No zero-result searches in this period." />
        )}
      </AnalyticsChartCard>
    </div>
  );
}