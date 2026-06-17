"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getGuestCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { CheckoutForm } from "./checkout-form";
import { IconShoppingBag } from "@tabler/icons-react";

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string | null;
}

export function CheckoutContent({
  shipping,
}: {
  shipping: { inside_dhaka: number; outside_dhaka: number; free_shipping_min: number } | null;
}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCart = async () => {
      const supabase = createClient();
      const { data: authData } = await supabase.auth.getClaims();

      let items: { productId: string; quantity: number }[] = [];

      if (authData?.claims) {
        const { data: dbCart } = await supabase
          .from("carts")
          .select("product_id, quantity, products(id, name, price, images)")
          .eq("user_id", authData.claims.sub);

        if (dbCart) {
          items = dbCart.map((item) => ({
            productId: item.product_id,
            quantity: item.quantity,
          }));
        }
      } else {
        items = getGuestCart();
      }

      if (items.length > 0) {
        const ids = items.map((i) => i.productId);
        const { data: products } = await supabase
          .from("products")
          .select("id, name, price, images")
          .in("id", ids);

        const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);

        setCartItems(
          items.map((item) => {
            const product = productMap.get(item.productId);
            const images = Array.isArray(product?.images) ? product.images : [];
            return {
              productId: item.productId,
              quantity: item.quantity,
              name: product?.name ?? "Unknown",
              price: product?.price ?? 0,
              image: images.length > 0 ? images[0].url : null,
            };
          })
        );
      }

      setLoading(false);
    };

    loadCart();
  }, []);

  if (loading) {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <IconShoppingBag className="size-12 text-muted-foreground" />
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">Add some products before checking out.</p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return <CheckoutForm cartItems={cartItems} shipping={shipping} />;
}
