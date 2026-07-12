"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getGuestCartCount } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { IconShoppingCart } from "@tabler/icons-react";

export function CartButton({ serverCartCount }: { serverCartCount: number }) {
  const [cartCount, setCartCount] = useState(serverCartCount);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getClaims().then(({ data }) => {
      if (!data?.claims) {
        setCartCount(getGuestCartCount());
      }
    });

    const handleCartUpdate = () => {
      supabase.auth.getClaims().then(({ data }) => {
        if (!data?.claims) {
          setCartCount(getGuestCartCount());
        }
      });
    };

    window.addEventListener("cart-updated", handleCartUpdate);
    return () => window.removeEventListener("cart-updated", handleCartUpdate);
  }, []);

  return (
    <Button variant="ghost" size="icon" asChild className="relative">
      <Link href="/cart">
        <IconShoppingCart className="size-5" />
        {cartCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full p-0 text-[11px]"
          >
            {cartCount > 99 ? "99+" : cartCount}
          </Badge>
        )}
        <span className="sr-only">Cart</span>
      </Link>
    </Button>
  );
}
