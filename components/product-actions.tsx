"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { BuyNowButton } from "@/components/buy-now-button";
import { QuantitySelector } from "@/components/quantity-selector";

export function ProductActions({
  productId,
  stockQty,
  productName,
  productPrice,
  productCategory,
}: {
  productId: string;
  stockQty: number;
  productName?: string;
  productPrice?: number;
  productCategory?: string | null;
}) {
  const [quantity, setQuantity] = useState(1);

  return (
    <div className="flex flex-col gap-3 pt-4">
      <QuantitySelector
        quantity={quantity}
        max={stockQty}
        onChange={setQuantity}
      />
      <div className="flex gap-3">
        <AddToCartButton
          productId={productId}
          stockQty={stockQty}
          quantity={quantity}
          productName={productName}
          productPrice={productPrice}
          productCategory={productCategory}
        />
        <BuyNowButton
          productId={productId}
          stockQty={stockQty}
          quantity={quantity}
          productName={productName}
          productPrice={productPrice}
          productCategory={productCategory}
        />
      </div>
    </div>
  );
}
