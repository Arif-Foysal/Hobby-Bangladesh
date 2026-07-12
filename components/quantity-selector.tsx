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
    <div className="flex items-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        className="size-11"
        onClick={() => onChange(Math.max(1, quantity - 1))}
        disabled={quantity <= 1}
      >
        <IconMinus className="size-4" />
      </Button>
      <span className="w-12 text-center text-base font-semibold">{quantity}</span>
      <Button
        variant="outline"
        size="icon"
        className="size-11"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
      >
        <IconPlus className="size-4" />
      </Button>
    </div>
  );
}
