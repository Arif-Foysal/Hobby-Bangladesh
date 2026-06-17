import { IconTrendingDown, IconTrendingUp, IconCurrencyTaka, IconShoppingCart, IconPackage } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

async function getDashboardStats() {
  const supabase = await createClient();

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  const [revenueResult, ordersTodayResult, pendingResult, productsResult, lastMonthRevenueResult, customersResult] =
    await Promise.all([
      supabase
        .from("orders")
        .select("total")
        .eq("payment_status", "paid")
        .gte("created_at", monthStart),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart),
      supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .in("status", ["pending", "confirmed"]),
      supabase
        .from("products")
        .select("id", { count: "exact", head: true })
        .eq("is_active", true),
      supabase
        .from("orders")
        .select("total")
        .eq("payment_status", "paid")
        .gte("created_at", lastMonthStart)
        .lte("created_at", lastMonthEnd),
      supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("role", "customer"),
    ]);

  const monthRevenue = (revenueResult.data || []).reduce((sum, o) => sum + o.total, 0);
  const lastMonthRevenue = (lastMonthRevenueResult.data || []).reduce((sum, o) => sum + o.total, 0);
  const revenueChange = lastMonthRevenue > 0
    ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
    : monthRevenue > 0 ? "100" : "0";

  return {
    monthRevenue,
    ordersToday: ordersTodayResult.count || 0,
    pendingOrders: pendingResult.count || 0,
    activeProducts: productsResult.count || 0,
    customers: customersResult.count || 0,
    revenueChange: parseFloat(revenueChange),
  };
}

export async function SectionCards() {
  const stats = await getDashboardStats();

  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Revenue (This Month)</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ৳ {stats.monthRevenue.toLocaleString()}
          </CardTitle>
          {stats.revenueChange !== 0 && (
            <Badge variant="outline">
              {stats.revenueChange > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {stats.revenueChange > 0 ? "+" : ""}{stats.revenueChange}%
            </Badge>
          )}
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {stats.revenueChange >= 0 ? "Trending up" : "Trending down"} <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">vs last month</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Orders Today</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.ordersToday}
          </CardTitle>
          <Badge variant="outline">
            <IconShoppingCart />
          </Badge>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            New orders today
          </div>
          <div className="text-muted-foreground">{stats.pendingOrders} pending</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Products</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeProducts}
          </CardTitle>
          <Badge variant="outline">
            <IconPackage />
          </Badge>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            In catalog
          </div>
          <div className="text-muted-foreground">Visible to customers</div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Customers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.customers}
          </CardTitle>
          <Badge variant="outline">
            <IconCurrencyTaka />
          </Badge>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Registered users
          </div>
          <div className="text-muted-foreground">Total accounts</div>
        </CardFooter>
      </Card>
    </div>
  );
}
