-- Analytics RPC functions for admin dashboard
-- All functions accept p_start_date and p_end_date (timestamptz) and return aggregated analytics data
-- Revenue queries filter by payment_status = 'paid'

-- 1. Sales summary with period-over-period comparison
CREATE OR REPLACE FUNCTION public.analytics_sales_summary(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  total_revenue numeric,
  total_orders bigint,
  avg_order_value numeric,
  previous_revenue numeric,
  previous_orders bigint,
  revenue_change_pct numeric,
  orders_change_pct numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH current_period AS (
    SELECT
      COALESCE(SUM(total), 0) AS revenue,
      COUNT(*) AS orders
    FROM public.orders
    WHERE payment_status = 'paid'
      AND created_at >= p_start_date
      AND created_at < p_end_date
  ),
  period_duration AS (
    SELECT EXTRACT(EPOCH FROM (p_end_date - p_start_date)) AS seconds
  ),
  previous_period AS (
    SELECT
      COALESCE(SUM(total), 0) AS revenue,
      COUNT(*) AS orders
    FROM public.orders
    WHERE payment_status = 'paid'
      AND created_at >= (p_start_date - (p_end_date - p_start_date)::interval)
      AND created_at < p_start_date
  )
  SELECT
    cp.revenue,
    cp.orders,
    CASE WHEN cp.orders > 0 THEN ROUND(cp.revenue / cp.orders, 2) ELSE 0 END,
    pp.revenue,
    pp.orders,
    CASE
      WHEN pp.revenue > 0 THEN ROUND(((cp.revenue - pp.revenue) / pp.revenue * 100)::numeric, 1)
      WHEN cp.revenue > 0 THEN 100
      ELSE 0
    END,
    CASE
      WHEN pp.orders > 0 THEN ROUND(((cp.orders - pp.orders)::numeric / pp.orders * 100)::numeric, 1)
      WHEN cp.orders > 0 THEN 100
      ELSE 0
    END
  FROM current_period cp, previous_period pp;
$$;

-- 2. Daily sales breakdown
CREATE OR REPLACE FUNCTION public.analytics_daily_sales(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  date text,
  revenue numeric,
  orders bigint,
  avg_order_value numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    to_char(date_trunc('day', o.created_at), 'YYYY-MM-DD') AS date,
    COALESCE(SUM(o.total), 0) AS revenue,
    COUNT(*) AS orders,
    CASE WHEN COUNT(*) > 0 THEN ROUND(SUM(o.total) / COUNT(*), 2) ELSE 0 END
  FROM public.orders o
  WHERE o.payment_status = 'paid'
    AND o.created_at >= p_start_date
    AND o.created_at < p_end_date
  GROUP BY date_trunc('day', o.created_at)
  ORDER BY date_trunc('day', o.created_at);
$$;

-- 3. Revenue by category
CREATE OR REPLACE FUNCTION public.analytics_revenue_by_category(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  category_name text,
  revenue numeric,
  orders bigint,
  percentage numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH cat_sales AS (
    SELECT
      COALESCE(c.name, 'Uncategorized') AS category_name,
      COALESCE(SUM(oi.total), 0) AS revenue,
      COUNT(DISTINCT o.id) AS orders
    FROM public.order_items oi
    JOIN public.orders o ON oi.order_id = o.id
    LEFT JOIN public.products p ON oi.product_id = p.id
    LEFT JOIN public.categories c ON p.category_id = c.id
    WHERE o.payment_status = 'paid'
      AND o.created_at >= p_start_date
      AND o.created_at < p_end_date
    GROUP BY COALESCE(c.name, 'Uncategorized')
  ),
  total_revenue AS (
    SELECT COALESCE(SUM(revenue), 0) AS total FROM cat_sales
  )
  SELECT
    cs.category_name,
    cs.revenue,
    cs.orders,
    CASE
      WHEN tr.total > 0 THEN ROUND((cs.revenue / tr.total * 100)::numeric, 1)
      ELSE 0
    END
  FROM cat_sales cs, total_revenue tr
  ORDER BY cs.revenue DESC;
$$;

-- 4. Top products by revenue
CREATE OR REPLACE FUNCTION public.analytics_top_products(
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  product_name text,
  revenue numeric,
  units_sold bigint,
  category_name text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    oi.product_name,
    COALESCE(SUM(oi.total), 0) AS revenue,
    SUM(oi.quantity) AS units_sold,
    COALESCE(c.name, 'Uncategorized') AS category_name
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  LEFT JOIN public.products p ON oi.product_id = p.id
  LEFT JOIN public.categories c ON p.category_id = c.id
  WHERE o.payment_status = 'paid'
    AND o.created_at >= p_start_date
    AND o.created_at < p_end_date
  GROUP BY oi.product_name, c.name
  ORDER BY revenue DESC
  LIMIT p_limit;
$$;

-- 5. Bottom products by revenue
CREATE OR REPLACE FUNCTION public.analytics_bottom_products(
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_limit int DEFAULT 10
)
RETURNS TABLE (
  product_name text,
  revenue numeric,
  units_sold bigint,
  category_name text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    oi.product_name,
    COALESCE(SUM(oi.total), 0) AS revenue,
    SUM(oi.quantity) AS units_sold,
    COALESCE(c.name, 'Uncategorized') AS category_name
  FROM public.order_items oi
  JOIN public.orders o ON oi.order_id = o.id
  LEFT JOIN public.products p ON oi.product_id = p.id
  LEFT JOIN public.categories c ON p.category_id = c.id
  WHERE o.payment_status = 'paid'
    AND o.created_at >= p_start_date
    AND o.created_at < p_end_date
  GROUP BY oi.product_name, c.name
  ORDER BY revenue ASC
  LIMIT p_limit;
$$;

-- 6. Customer summary
CREATE OR REPLACE FUNCTION public.analytics_customer_summary(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  total_customers bigint,
  new_customers bigint,
  returning_customers bigint,
  avg_lifetime_value numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH new_customers AS (
    SELECT COUNT(DISTINCT o.user_id) AS cnt
    FROM public.orders o
    WHERE o.payment_status = 'paid'
      AND o.created_at >= p_start_date
      AND o.created_at < p_end_date
      AND o.user_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM public.orders o2
        WHERE o2.user_id = o.user_id
          AND o2.payment_status = 'paid'
          AND o2.created_at < p_start_date
      )
  ),
  all_period_customers AS (
    SELECT
      COUNT(DISTINCT o.user_id) AS total,
      o.user_id
    FROM public.orders o
    WHERE o.payment_status = 'paid'
      AND o.created_at >= p_start_date
      AND o.created_at < p_end_date
      AND o.user_id IS NOT NULL
    GROUP BY o.user_id
  ),
  returning_cust AS (
    SELECT COUNT(*) AS cnt
    FROM all_period_customers apc
    WHERE apc.total > 1
  ),
  total_distinct AS (
    SELECT COUNT(DISTINCT user_id) AS cnt FROM all_period_customers
  ),
  lifetime_values AS (
    SELECT o.user_id, SUM(o.total) AS ltv
    FROM public.orders o
    WHERE o.payment_status = 'paid'
      AND o.user_id IS NOT NULL
    GROUP BY o.user_id
  )
  SELECT
    td.cnt,
    nc.cnt,
    rc.cnt,
    CASE WHEN (SELECT COUNT(*) FROM lifetime_values) > 0
      THEN ROUND((SELECT AVG(ltv) FROM lifetime_values), 2)
      ELSE 0
    END
  FROM total_distinct td, new_customers nc, returning_cust rc;
$$;

-- 7. Customer acquisition trend
CREATE OR REPLACE FUNCTION public.analytics_customer_acquisition(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  date text,
  new_customers bigint,
  returning_orders bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH first_orders AS (
    SELECT
      user_id,
      date_trunc('day', MIN(created_at)) AS first_order_date
    FROM public.orders
    WHERE payment_status = 'paid'
      AND user_id IS NOT NULL
    GROUP BY user_id
  ),
  daily_new AS (
    SELECT
      to_char(date_trunc('day', fo.first_order_date), 'YYYY-MM-DD') AS date,
      COUNT(*) AS new_customers
    FROM first_orders fo
    WHERE fo.first_order_date >= p_start_date
      AND fo.first_order_date < p_end_date
    GROUP BY date_trunc('day', fo.first_order_date)
  ),
  daily_returning AS (
    SELECT
      to_char(date_trunc('day', o.created_at), 'YYYY-MM-DD') AS date,
      COUNT(*) AS returning_orders
    FROM public.orders o
    WHERE o.payment_status = 'paid'
      AND o.user_id IS NOT NULL
      AND o.created_at >= p_start_date
      AND o.created_at < p_end_date
      AND EXISTS (
        SELECT 1 FROM public.orders o3
        WHERE o3.user_id = o.user_id
          AND o3.payment_status = 'paid'
          AND o3.created_at < o.created_at
      )
    GROUP BY date_trunc('day', o.created_at)
  )
  SELECT
    COALESCE(dn.date, dr.date) AS date,
    COALESCE(dn.new_customers, 0) AS new_customers,
    COALESCE(dr.returning_orders, 0) AS returning_orders
  FROM daily_new dn
  FULL OUTER JOIN daily_returning dr ON dn.date = dr.date
  ORDER BY COALESCE(dn.date, dr.date);
$$;

-- 8. Revenue by geography (division)
CREATE OR REPLACE FUNCTION public.analytics_revenue_by_geography(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  division text,
  revenue numeric,
  orders bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    COALESCE((o.shipping_address->>'division')::text, 'Unknown') AS division,
    COALESCE(SUM(o.total), 0) AS revenue,
    COUNT(*) AS orders
  FROM public.orders o
  WHERE o.payment_status = 'paid'
    AND o.created_at >= p_start_date
    AND o.created_at < p_end_date
  GROUP BY (o.shipping_address->>'division')::text
  ORDER BY revenue DESC;
$$;

-- 9. Order status distribution
CREATE OR REPLACE FUNCTION public.analytics_order_status_dist(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  status text,
  count bigint,
  percentage numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH status_counts AS (
    SELECT status, COUNT(*) AS cnt
    FROM public.orders
    WHERE created_at >= p_start_date
      AND created_at < p_end_date
    GROUP BY status
  ),
  total AS (
    SELECT SUM(cnt) AS total FROM status_counts
  )
  SELECT
    sc.status,
    sc.cnt,
    CASE
      WHEN t.total > 0 THEN ROUND((sc.cnt::numeric / t.total * 100)::numeric, 1)
      ELSE 0
    END
  FROM status_counts sc, total t
  ORDER BY sc.cnt DESC;
$$;

-- 10. Payment method breakdown
CREATE OR REPLACE FUNCTION public.analytics_payment_methods(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  method text,
  count bigint,
  revenue numeric,
  percentage numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH method_stats AS (
    SELECT
      COALESCE(NULLIF(payment_method, ''), 'cod') AS method,
      COUNT(*) AS cnt,
      COALESCE(SUM(total), 0) AS revenue
    FROM public.orders
    WHERE payment_status = 'paid'
      AND created_at >= p_start_date
      AND created_at < p_end_date
    GROUP BY payment_method
  ),
  total AS (
    SELECT SUM(cnt) AS total FROM method_stats
  )
  SELECT
    ms.method,
    ms.cnt,
    ms.revenue,
    CASE
      WHEN t.total > 0 THEN ROUND((ms.cnt::numeric / t.total * 100)::numeric, 1)
      ELSE 0
    END
  FROM method_stats ms, total t
  ORDER BY ms.cnt DESC;
$$;

-- 11. Top search queries
CREATE OR REPLACE FUNCTION public.analytics_search_top_queries(
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  query text,
  count bigint,
  avg_results numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    sq.query,
    COUNT(*) AS count,
    ROUND(AVG(sq.result_count)::numeric, 1) AS avg_results
  FROM public.search_queries sq
  WHERE sq.created_at >= p_start_date
    AND sq.created_at < p_end_date
  GROUP BY sq.query
  ORDER BY count DESC
  LIMIT p_limit;
$$;

-- 12. Zero-result searches
CREATE OR REPLACE FUNCTION public.analytics_search_zero_results(
  p_start_date timestamptz,
  p_end_date timestamptz,
  p_limit int DEFAULT 20
)
RETURNS TABLE (
  query text,
  count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    query,
    COUNT(*) AS count
  FROM public.search_queries
  WHERE created_at >= p_start_date
    AND created_at < p_end_date
    AND result_count = 0
  GROUP BY query
  ORDER BY count DESC
  LIMIT p_limit;
$$;

-- 13. Coupon performance
CREATE OR REPLACE FUNCTION public.analytics_coupon_performance(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  code text,
  usage_count bigint,
  revenue_with_coupon numeric,
  discount_given numeric,
  avg_order_value numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    o.coupon_code AS code,
    COUNT(*) AS usage_count,
    COALESCE(SUM(o.total), 0) AS revenue_with_coupon,
    COALESCE(SUM(o.discount), 0) AS discount_given,
    CASE WHEN COUNT(*) > 0 THEN ROUND(SUM(o.total) / COUNT(*), 2) ELSE 0 END
  FROM public.orders o
  WHERE o.payment_status = 'paid'
    AND o.coupon_id IS NOT NULL
    AND o.created_at >= p_start_date
    AND o.created_at < p_end_date
  GROUP BY o.coupon_code
  ORDER BY revenue_with_coupon DESC;
$$;

-- 14. Customer cohort retention
CREATE OR REPLACE FUNCTION public.analytics_cohort_retention(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  cohort_month text,
  cohort_size bigint,
  months_since int,
  retained_customers bigint,
  retention_pct numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH first_orders AS (
    SELECT
      user_id,
      date_trunc('month', MIN(created_at)) AS cohort_month
    FROM public.orders
    WHERE payment_status = 'paid'
      AND user_id IS NOT NULL
      AND created_at >= p_start_date
      AND created_at < p_end_date
    GROUP BY user_id
  ),
  customer_orders AS (
    SELECT
      fo.user_id,
      fo.cohort_month,
      date_trunc('month', o.created_at) AS order_month,
      EXTRACT(YEAR FROM age(date_trunc('month', o.created_at), fo.cohort_month))::int * 12 +
        EXTRACT(MONTH FROM age(date_trunc('month', o.created_at), fo.cohort_month))::int AS month_diff
    FROM first_orders fo
    JOIN public.orders o ON fo.user_id = o.user_id
    WHERE o.payment_status = 'paid'
  )
  SELECT
    to_char(cohort_month, 'YYYY-MM') AS cohort_month,
    COUNT(DISTINCT user_id) FILTER (WHERE order_month = cohort_month) AS cohort_size,
    month_diff AS months_since,
    COUNT(DISTINCT user_id) AS retained_customers,
    CASE
      WHEN COUNT(DISTINCT user_id) FILTER (WHERE order_month = cohort_month) > 0
      THEN ROUND(
        COUNT(DISTINCT user_id)::numeric /
        COUNT(DISTINCT user_id) FILTER (WHERE order_month = cohort_month) * 100,
        1
      )
      ELSE 0
    END
  FROM customer_orders
  GROUP BY cohort_month, month_diff
  ORDER BY cohort_month, month_diff;
$$;

-- 15. Inventory turnover
CREATE OR REPLACE FUNCTION public.analytics_inventory_turnover(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  product_name text,
  current_stock int,
  units_sold bigint,
  turnover_rate numeric
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    p.name AS product_name,
    p.stock_qty AS current_stock,
    COALESCE(SUM(oi.quantity), 0) AS units_sold,
    CASE
      WHEN p.stock_qty > 0
      THEN ROUND((COALESCE(SUM(oi.quantity), 0)::numeric / p.stock_qty), 2)
      ELSE 0
    END
  FROM public.products p
  LEFT JOIN public.order_items oi ON p.id = oi.product_id
  LEFT JOIN public.orders o ON oi.order_id = o.id
    AND o.payment_status = 'paid'
    AND o.created_at >= p_start_date
    AND o.created_at < p_end_date
  WHERE p.is_active = true
  GROUP BY p.name, p.stock_qty
  ORDER BY COALESCE(SUM(oi.quantity), 0) DESC
  LIMIT 20;
$$;

-- 16. Hourly orders heatmap data
CREATE OR REPLACE FUNCTION public.analytics_hourly_orders(
  p_start_date timestamptz,
  p_end_date timestamptz
)
RETURNS TABLE (
  hour int,
  day_of_week int,
  count bigint
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    EXTRACT(HOUR FROM created_at)::int AS hour,
    EXTRACT(DOW FROM created_at)::int AS day_of_week,
    COUNT(*) AS count
  FROM public.orders
  WHERE created_at >= p_start_date
    AND created_at < p_end_date
  GROUP BY EXTRACT(HOUR FROM created_at), EXTRACT(DOW FROM created_at)
  ORDER BY hour, day_of_week;
$$;

-- Grant execute to authenticated role
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;