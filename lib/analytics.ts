import { createClient } from "@/lib/supabase/server";

// ── Types ──────────────────────────────────────────────────────────────────

export interface SalesSummary {
  total_revenue: number;
  total_orders: number;
  avg_order_value: number;
  previous_revenue: number;
  previous_orders: number;
  revenue_change_pct: number;
  orders_change_pct: number;
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
  avg_order_value: number;
}

export interface RevenueByCategory {
  category_name: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface TopProduct {
  product_name: string;
  revenue: number;
  units_sold: number;
  category_name: string;
}

export interface CustomerSummary {
  total_customers: number;
  new_customers: number;
  returning_customers: number;
  avg_lifetime_value: number;
}

export interface CustomerAcquisition {
  date: string;
  new_customers: number;
  returning_orders: number;
}

export interface RevenueByGeography {
  division: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusDist {
  status: string;
  count: number;
  percentage: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface SearchTopQuery {
  query: string;
  count: number;
  avg_results: number;
}

export interface SearchZeroResult {
  query: string;
  count: number;
}

export interface CouponPerformance {
  code: string;
  usage_count: number;
  revenue_with_coupon: number;
  discount_given: number;
  avg_order_value: number;
}

export interface CohortRetention {
  cohort_month: string;
  cohort_size: number;
  months_since: number;
  retained_customers: number;
  retention_pct: number;
}

export interface InventoryTurnover {
  product_name: string;
  current_stock: number;
  units_sold: number;
  turnover_rate: number;
}

export interface HourlyOrders {
  hour: number;
  day_of_week: number;
  count: number;
}

// ── RPC Wrappers ────────────────────────────────────────────────────────────

export async function getSalesSummary(
  startDate: string,
  endDate: string
): Promise<SalesSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_sales_summary", {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) return null;
  return data?.[0] ?? null;
}

export async function getDailySales(
  startDate: string,
  endDate: string
): Promise<DailySales[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_daily_sales", {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) return [];
  return data ?? [];
}

export async function getRevenueByCategory(
  startDate: string,
  endDate: string
): Promise<RevenueByCategory[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_revenue_by_category", {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) return [];
  return data ?? [];
}

export async function getTopProducts(
  startDate: string,
  endDate: string,
  limit = 10
): Promise<TopProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_top_products", {
    p_start_date: startDate,
    p_end_date: endDate,
    p_limit: limit,
  });
  if (error) return [];
  return data ?? [];
}

export async function getBottomProducts(
  startDate: string,
  endDate: string,
  limit = 10
): Promise<TopProduct[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_bottom_products", {
    p_start_date: startDate,
    p_end_date: endDate,
    p_limit: limit,
  });
  if (error) return [];
  return data ?? [];
}

export async function getCustomerSummary(
  startDate: string,
  endDate: string
): Promise<CustomerSummary | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_customer_summary", {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) return null;
  return data?.[0] ?? null;
}

export async function getCustomerAcquisition(
  startDate: string,
  endDate: string
): Promise<CustomerAcquisition[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_customer_acquisition", {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) return [];
  return data ?? [];
}

export async function getRevenueByGeography(
  startDate: string,
  endDate: string
): Promise<RevenueByGeography[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_revenue_by_geography", {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) return [];
  return data ?? [];
}

export async function getOrderStatusDist(
  startDate: string,
  endDate: string
): Promise<OrderStatusDist[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_order_status_dist", {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) return [];
  return data ?? [];
}

export async function getPaymentMethods(
  startDate: string,
  endDate: string
): Promise<PaymentMethodBreakdown[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_payment_methods", {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) return [];
  return data ?? [];
}

export async function getSearchTopQueries(
  startDate: string,
  endDate: string,
  limit = 20
): Promise<SearchTopQuery[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_search_top_queries", {
    p_start_date: startDate,
    p_end_date: endDate,
    p_limit: limit,
  });
  if (error) return [];
  return data ?? [];
}

export async function getSearchZeroResults(
  startDate: string,
  endDate: string,
  limit = 20
): Promise<SearchZeroResult[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_search_zero_results", {
    p_start_date: startDate,
    p_end_date: endDate,
    p_limit: limit,
  });
  if (error) return [];
  return data ?? [];
}

export async function getCouponPerformance(
  startDate: string,
  endDate: string
): Promise<CouponPerformance[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_coupon_performance", {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) return [];
  return data ?? [];
}

export async function getCohortRetention(
  startDate: string,
  endDate: string
): Promise<CohortRetention[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_cohort_retention", {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) return [];
  return data ?? [];
}

export async function getInventoryTurnover(
  startDate: string,
  endDate: string
): Promise<InventoryTurnover[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_inventory_turnover", {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) return [];
  return data ?? [];
}

export async function getHourlyOrders(
  startDate: string,
  endDate: string
): Promise<HourlyOrders[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("analytics_hourly_orders", {
    p_start_date: startDate,
    p_end_date: endDate,
  });
  if (error) return [];
  return data ?? [];
}