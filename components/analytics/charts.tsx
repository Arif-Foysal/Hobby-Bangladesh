"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";

// ── Sales Trend Area Chart ─────────────────────────────────────────────────

const salesTrendConfig = {
  revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  orders: { label: "Orders", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function SalesTrendChart({
  data,
}: {
  data: { date: string; revenue: number; orders: number }[];
}) {
  return (
    <ChartContainer config={salesTrendConfig} className="aspect-auto h-[250px] w-full">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.8} />
            <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
              indicator="dot"
            />
          }
        />
        <Area
          dataKey="orders"
          type="natural"
          fill="url(#fillOrders)"
          stroke="var(--color-orders)"
          stackId="a"
        />
        <Area
          dataKey="revenue"
          type="natural"
          fill="url(#fillRevenue)"
          stroke="var(--color-revenue)"
          stackId="a"
        />
        <ChartLegend content={<ChartLegendContent />} />
      </AreaChart>
    </ChartContainer>
  );
}

// ── Revenue Donut (by category) ──────────────────────────────────────────────

const PIE_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function RevenueDonutChart({
  data,
}: {
  data: { category_name: string; revenue: number; percentage: number }[];
}) {
  const chartData = data.map((d, i) => ({
    name: d.category_name,
    value: d.revenue,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));
  const config: ChartConfig = {};
  data.forEach((d, i) => {
    config[d.category_name] = {
      label: d.category_name,
      color: PIE_COLORS[i % PIE_COLORS.length],
    };
  });
  return (
    <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent nameKey="name" indicator="dot" />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={45}
          outerRadius={80}
          paddingAngle={2}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  );
}

// ── AOV Line Chart ──────────────────────────────────────────────────────────

const aovConfig = {
  avg_order_value: { label: "Avg Order Value", color: "hsl(var(--chart-1))" },
} satisfies ChartConfig;

export function AvgOrderValueChart({
  data,
}: {
  data: { date: string; avg_order_value: number }[];
}) {
  return (
    <ChartContainer config={aovConfig} className="aspect-auto h-[250px] w-full">
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
              indicator="dot"
            />
          }
        />
        <Line
          dataKey="avg_order_value"
          type="monotone"
          stroke="var(--color-avg_order_value)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}

// ── Revenue by Category Bar Chart ────────────────────────────────────────────

export function RevenueByCategoryBarChart({
  data,
}: {
  data: { category_name: string; revenue: number }[];
}) {
  const config: ChartConfig = {};
  data.forEach((d, i) => {
    config[d.category_name] = {
      label: d.category_name,
      color: PIE_COLORS[i % PIE_COLORS.length],
    };
  });
  return (
    <ChartContainer config={config} className="aspect-auto h-[300px] w-full">
      <BarChart data={data} layout="vertical" barCategoryGap={8}>
        <CartesianGrid horizontal={false} />
        <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(v) => `৳${v.toLocaleString()}`} />
        <YAxis
          dataKey="category_name"
          type="category"
          tickLine={false}
          axisLine={false}
          width={100}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

// ── Customer Acquisition Line Chart ──────────────────────────────────────────

const acquisitionConfig = {
  new_customers: { label: "New Customers", color: "hsl(var(--chart-1))" },
  returning_orders: { label: "Returning Orders", color: "hsl(var(--chart-2))" },
} satisfies ChartConfig;

export function CustomerAcquisitionChart({
  data,
}: {
  data: { date: string; new_customers: number; returning_orders: number }[];
}) {
  return (
    <ChartContainer config={acquisitionConfig} className="aspect-auto h-[250px] w-full">
      <LineChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value) => {
            const date = new Date(value);
            return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
          }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              labelFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              }
              indicator="dot"
            />
          }
        />
        <Line
          dataKey="new_customers"
          type="monotone"
          stroke="var(--color-new_customers)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="returning_orders"
          type="monotone"
          stroke="var(--color-returning_orders)"
          strokeWidth={2}
          dot={false}
        />
        <ChartLegend content={<ChartLegendContent />} />
      </LineChart>
    </ChartContainer>
  );
}

// ── Geography Bar Chart ──────────────────────────────────────────────────────

export function GeographyBarChart({
  data,
}: {
  data: { division: string; revenue: number; orders: number }[];
}) {
  const config: ChartConfig = {
    revenue: { label: "Revenue", color: "hsl(var(--chart-1))" },
  };
  return (
    <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="division" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="revenue" fill="hsl(var(--chart-1))" radius={4} />
        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    </ChartContainer>
  );
}

// ── Order Status Pie Chart ───────────────────────────────────────────────────

export function OrderStatusPieChart({
  data,
}: {
  data: { status: string; count: number; percentage: number }[];
}) {
  const chartData = data.map((d, i) => ({
    name: d.status,
    value: d.count,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));
  const config: ChartConfig = {};
  data.forEach((d, i) => {
    config[d.status] = {
      label: d.status,
      color: PIE_COLORS[i % PIE_COLORS.length],
    };
  });
  return (
    <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent nameKey="name" indicator="dot" />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          outerRadius={80}
          label={(entry) => `${entry.name}`}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  );
}

// ── Payment Method Bar Chart ────────────────────────────────────────────────

export function PaymentMethodChart({
  data,
}: {
  data: { method: string; count: number; revenue: number; percentage: number }[];
}) {
  const config: ChartConfig = {
    count: { label: "Orders", color: "hsl(var(--chart-1))" },
    revenue: { label: "Revenue", color: "hsl(var(--chart-2))" },
  };
  return (
    <ChartContainer config={config} className="aspect-auto h-[250px] w-full">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="method" tickLine={false} axisLine={false} tickMargin={8} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
        <Bar dataKey="count" fill="hsl(var(--chart-1))" radius={4} />
        <Bar dataKey="revenue" fill="hsl(var(--chart-2))" radius={4} />
        <ChartLegend content={<ChartLegendContent />} />
      </BarChart>
    </ChartContainer>
  );
}

// ── Hourly Orders Heatmap ───────────────────────────────────────────────────

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function HourlyHeatmap({
  data,
}: {
  data: { hour: number; day_of_week: number; count: number }[];
}) {
  const cellMap = new Map<string, number>();
  let maxCount = 1;
  data.forEach((d) => {
    cellMap.set(`${d.day_of_week}-${d.hour}`, d.count);
    if (d.count > maxCount) maxCount = d.count;
  });

  function getColor(count: number): string {
    if (count === 0) return "hsl(var(--muted))";
    const opacity = 0.15 + (count / maxCount) * 0.85;
    return `hsl(var(--chart-1) / ${opacity})`;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[600px]">
        <div className="flex">
          <div className="w-10 shrink-0" />
          {Array.from({ length: 24 }, (_, h) => (
            <div
              key={h}
              className="flex-1 text-center text-[10px] text-muted-foreground"
            >
              {h}
            </div>
          ))}
        </div>
        {DAY_NAMES.map((day, dow) => (
          <div key={day} className="flex items-center">
            <div className="w-10 shrink-0 text-xs text-muted-foreground">{day}</div>
            {Array.from({ length: 24 }, (_, h) => {
              const count = cellMap.get(`${dow}-${h}`) ?? 0;
              return (
                <div
                  key={h}
                  className="flex-1"
                  style={{
                    aspectRatio: "1",
                    backgroundColor: getColor(count),
                    borderRadius: "2px",
                    margin: "1px",
                  }}
                  title={`${day} ${h}:00 - ${count} orders`}
                />
              );
            })}
          </div>
        ))}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="h-3 w-16 rounded-sm bg-gradient-to-r from-muted to-[hsl(var(--chart-1))]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}

// ── Cohort Retention Heatmap ───────────────────────────────────────────────

export function CohortHeatmap({
  data,
}: {
  data: {
    cohort_month: string;
    cohort_size: number;
    months_since: number;
    retained_customers: number;
    retention_pct: number;
  }[];
}) {
  const cohorts = [...new Set(data.map((d) => d.cohort_month))];
  const maxMonths = Math.max(...data.map((d) => d.months_since), 0);

  function getColor(pct: number): string {
    if (pct === 0) return "hsl(var(--muted))";
    const opacity = 0.1 + (pct / 100) * 0.9;
    return `hsl(var(--chart-1) / ${opacity})`;
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[500px]">
        <div className="flex border-b pb-1">
          <div className="w-24 shrink-0 text-xs font-medium text-muted-foreground">Cohort</div>
          <div className="w-16 shrink-0 text-xs font-medium text-muted-foreground">Size</div>
          {Array.from({ length: maxMonths + 1 }, (_, m) => (
            <div key={m} className="flex-1 text-center text-[10px] text-muted-foreground">
              M{m}
            </div>
          ))}
        </div>
        {cohorts.map((cohort) => {
          const cohortData = data.filter((d) => d.cohort_month === cohort);
          const cohortSize = cohortData.find((d) => d.months_since === 0)?.cohort_size ?? 0;
          return (
            <div key={cohort} className="flex items-center border-b py-0.5">
              <div className="w-24 shrink-0 text-xs font-medium">{cohort}</div>
              <div className="w-16 shrink-0 text-xs text-muted-foreground">{cohortSize}</div>
              {Array.from({ length: maxMonths + 1 }, (_, m) => {
                const cell = cohortData.find((d) => d.months_since === m);
                const pct = cell?.retention_pct ?? 0;
                return (
                  <div
                    key={m}
                    className="flex-1"
                    style={{
                      aspectRatio: "1",
                      backgroundColor: getColor(pct),
                      borderRadius: "2px",
                      margin: "1px",
                    }}
                    title={`${cohort} - Month ${m}: ${pct}% retention (${cell?.retained_customers ?? 0}/${cohortSize})`}
                  >
                    {pct > 0 && (
                      <span className="flex h-full w-full items-center justify-center text-[9px] font-medium">
                        {pct}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}