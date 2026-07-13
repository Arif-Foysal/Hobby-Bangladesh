"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addToGuestCart } from "@/lib/cart";
import { addToCart } from "@/app/cart/actions";
import { createClient } from "@/lib/supabase/client";
import { trackAddToCart } from "@/lib/analytics-events";
import { IconShoppingBag } from "@tabler/icons-react";
import { toast } from "sonner";

export function BuyNowButton({
  productId,
  stockQty,
  quantity = 1,
  size = "lg",
  className,
  productName,
  productPrice,
  productCategory,
}: {
  productId: string;
  stockQty: number;
  quantity?: number;
  size?: "sm" | "lg" | "default";
  className?: string;
  productName?: string;
  productPrice?: number;
  productCategory?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBuyNow = async () => {
    setLoading(true);

    const supabase = createClient();
    const { data: authData } = await supabase.auth.getClaims();
    const isLoggedIn = !!authData?.claims;

    if (isLoggedIn) {
      const result = await addToCart(productId, quantity);
      if (result.error) {
        toast.error(result.error);
        setLoading(false);
        return;
      }
    } else {
      addToGuestCart(productId, quantity);
    }

    router.push("/checkout");
    trackAddToCart({
      id: productId,
      name: productName ?? "",
      price: productPrice,
      quantity,
      category: productCategory,
    });
  };

  const disabled = stockQty <= 0 || loading;

  return (
    <Button
      size={size}
      variant="secondary"
      disabled={disabled}
      onClick={handleBuyNow}
      className={className}
    >
      <IconShoppingBag />
      {stockQty <= 0 ? "Out of Stock" : loading ? "Processing..." : "Buy Now"}
    </Button>
  );
}
