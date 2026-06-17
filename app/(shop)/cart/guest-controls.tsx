"use client";

import { Button } from "@/components/ui/button";
import { updateGuestCartQuantity, removeFromGuestCart } from "@/lib/cart";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";

export function GuestCartItemControls({
  productId,
  quantity,
  onUpdate,
}: {
  productId: string;
  quantity: number;
  onUpdate: () => void;
}) {
  const handleUpdate = (newQty: number) => {
    updateGuestCartQuantity(productId, newQty);
    onUpdate();
  };

  const handleRemove = () => {
    removeFromGuestCart(productId);
    onUpdate();
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => handleUpdate(quantity - 1)}
        disabled={quantity <= 1}
      >
        <IconMinus className="size-3" />
      </Button>
      <span className="w-8 text-center text-sm font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="size-8"
        onClick={() => handleUpdate(quantity + 1)}
      >
        <IconPlus className="size-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 ml-2 text-muted-foreground"
        onClick={handleRemove}
      >
        <IconTrash className="size-3" />
      </Button>
    </div>
  );
}
