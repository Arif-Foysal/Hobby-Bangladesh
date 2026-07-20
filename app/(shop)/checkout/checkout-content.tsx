"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getGuestCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { CheckoutForm } from "./checkout-form";
import { IconShoppingBag } from "@tabler/icons-react";
import type { StoreShipping, Location } from "@/lib/database/types";

interface CheckoutCartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string | null;
}

export function CheckoutContent({
  initialItems,
  isGuest,
  shipping,
  divisions,
}: {
  initialItems: CheckoutCartItem[];
  isGuest: boolean;
  shipping: StoreShipping | null;
  divisions: Location[];
}) {
  const [guestItems, setGuestItems] = useState<CheckoutCartItem[]>([]);
  const [guestLoaded, setGuestLoaded] = useState(false);

  useEffect(() => {
    if (!isGuest) return;

    const loadGuestCart = async () => {
      const guestCart = getGuestCart();
      if (guestCart.length === 0) {
        setGuestLoaded(true);
        return;
      }

      const supabase = createClient();
      const ids = guestCart.map((i) => i.productId);
      const { data: products } = await supabase
        .from("products")
        .select("id, name, price, images, stock_qty")
        .in("id", ids);

      const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);
      setGuestItems(
        guestCart.map((i) => {
          const product = productMap.get(i.productId);
          const images = Array.isArray(product?.images) ? product.images : [];
          return {
            productId: i.productId,
            quantity: i.quantity,
            name: (product as { name?: string })?.name ?? "Unknown",
            price: (product as { price?: number })?.price ?? 0,
            image: images.length > 0 ? (images[0] as { url: string }).url : null,
          };
        })
      );
      setGuestLoaded(true);
    };

    loadGuestCart();
  }, [isGuest]);

  const cartItems = isGuest ? guestItems : initialItems;

  if (isGuest && !guestLoaded) {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
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

  return (
    <CheckoutForm
      cartItems={cartItems}
      shipping={shipping}
      divisions={divisions}
    />
  );
}