"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/app/cart/actions";
import { addToGuestCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { trackAddToCart } from "@/lib/analytics-events";
import { IconShoppingCart, IconCheck } from "@tabler/icons-react";
import { toast } from "sonner";

export function AddToCartButton({
  productId,
  stockQty,
  quantity = 1,
  productName,
  productPrice,
  productCategory,
}: {
  productId: string;
  stockQty: number;
  quantity?: number;
  productName?: string;
  productPrice?: number;
  productCategory?: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getClaims().then(({ data }) => {
      setIsLoggedIn(!!data?.claims);
    });
  }, []);

  const handleAdd = async () => {
    setLoading(true);

    if (isLoggedIn) {
      const result = await addToCart(productId, quantity);
      setLoading(false);

      if (result.error) {
        toast.error(result.error);
        return;
      }
    } else {
      addToGuestCart(productId, quantity);
      setLoading(false);
    }

    toast.success("Added to cart");
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);

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
    <Button size="lg" disabled={disabled} onClick={handleAdd} className="flex-1">
      {added ? (
        <>
          <IconCheck />
          Added
        </>
      ) : (
        <>
          <IconShoppingCart />
          {stockQty <= 0 ? "Out of Stock" : loading ? "Adding..." : "Add to Cart"}
        </>
      )}
    </Button>
  );
}
