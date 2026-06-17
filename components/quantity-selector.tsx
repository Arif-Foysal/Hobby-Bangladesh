"use client";

import { Button } from "@/components/ui/button";
import { IconMinus, IconPlus } from "@tabler/icons-react";

export function QuantitySelector({
  quantity,
  max,
  onChange,
}: {
  quantity: number;
  max: number;
  onChange: (qty: number) => void;
}) {
  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        className="size-9"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
      >
        <IconMinus className="size-4" />
      </Button>
      <span className="w-10 text-center text-sm font-medium">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="size-9"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
      >
        <IconPlus className="size-4" />
      </Button>
    </div>
  );
}
