import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { IconAlertTriangle } from "@tabler/icons-react";

export async function LowStockAlerts() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, slug, stock_qty")
    .eq("is_active", true)
    .lt("stock_qty", 10)
    .order("stock_qty", { ascending: true })
    .limit(5);

  if (!products || products.length === 0) return null;

  return (
    <Card className="mx-4 lg:mx-6">
      <CardHeader className="flex flex-row items-center gap-2">
        <IconAlertTriangle className="size-5 text-yellow-500" />
        <CardTitle className="text-sm">Low Stock Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          {products.map((product) => (
            <div key={product.id} className="flex items-center justify-between">
              <Link
                href={`/admin/products/${product.id}/edit`}
                className="text-sm hover:underline"
              >
                {product.name}
              </Link>
              <Badge
                variant={product.stock_qty === 0 ? "destructive" : "secondary"}
              >
                {product.stock_qty} left
              </Badge>
            </div>
          ))}
        </div>
        {products.length >= 5 && (
          <Button variant="ghost" size="sm" asChild className="mt-2 w-full">
            <Link href="/admin/products">View All Products</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
