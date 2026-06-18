"use client";

import { useRouter } from "next/navigation";
import { toggleProductActive } from "./actions";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function ToggleProductActiveButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();

  const handleToggle = async () => {
    const result = await toggleProductActive(id, isActive);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(isActive ? "Product deactivated" : "Product activated");
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
