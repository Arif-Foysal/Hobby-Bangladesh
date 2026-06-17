"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addToGuestCart } from "@/lib/cart";
import { addToCart } from "@/app/cart/actions";
import { createClient } from "@/lib/supabase/client";
import { IconShoppingBag } from "@tabler/icons-react";

export function BuyNowButton({
  productId,
  stockQty,
  quantity = 1,
}: {
  productId: string;
  stockQty: number;
  quantity?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    setLoading(true);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getClaims();
    const isLoggedIn = !!authData?.claims;

    if (isLoggedIn) {
      await addToCart(productId, quantity);
    } else {
      addToGuestCart(productId, quantity);
    }

    router.push("/checkout");
  };

  const disabled = stockQty <= 0 || loading;

  return (
    <Button
      size="lg"
      variant="secondary"
      disabled={disabled}
      onClick={handleBuyNow}
    >
      <IconShoppingBag />
      {stockQty <= 0 ? "Out of Stock" : loading ? "Processing..." : "Buy Now"}
    </Button>
  );
}
