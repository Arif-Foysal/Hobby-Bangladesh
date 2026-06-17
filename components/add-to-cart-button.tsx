"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { addToCart } from "@/app/cart/actions";
import { IconShoppingCart, IconCheck } from "@tabler/icons-react";

export function AddToCartButton({
  productId,
  stockQty,
}: {
  productId: string;
  stockQty: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAdd = async () => {
    setLoading(true);
    const result = await addToCart(productId);
    setLoading(false);

    if (result.error) {
      if (result.error === "Not authenticated") {
        router.push("/auth/login");
      }
      return;
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
