"use client";

import { useRouter } from "next/navigation";
import { toggleCouponActive } from "./actions";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function ToggleCouponActiveButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();

  const handleToggle = async () => {
    const result = await toggleCouponActive(id, isActive);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(isActive ? "Coupon deactivated" : "Coupon activated");
      router.refresh();
    }
  };

  return (
    <button onClick={handleToggle} className="cursor-pointer">
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    </button>
  );
}
