"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/app/cart/actions";
import { addToGuestCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { IconShoppingCart, IconCheck } from "@tabler/icons-react";

export function AddToCartButton({
  productId,
  stockQty,
}: {
  productId: string;
  stockQty: number;
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
      const result = await addToCart(productId);
      setLoading(false);

      if (result.error) return;
    } else {
      addToGuestCart(productId);
      setLoading(false);
    }

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
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
