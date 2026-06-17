"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateCartQuantity, removeFromCart } from "@/app/cart/actions";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";

export function CartItemControls({
  cartItemId,
  quantity,
}: {
  cartItemId: string;
  quantity: number;
}) {
  const router = useRouter();

  const handleUpdate = async (newQty: number) => {
    await updateCartQuantity(cartItemId, newQty);
    router.refresh();
  };

  const handleRemove = async () => {
    await removeFromCart(cartItemId);
    router.refresh();
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
