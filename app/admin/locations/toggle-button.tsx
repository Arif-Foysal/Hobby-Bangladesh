"use client";

import { useRouter } from "next/navigation";
import { toggleLocationActive } from "./actions";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export function ToggleActiveButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const router = useRouter();

  const handleToggle = async () => {
    const result = await toggleLocationActive(id, isActive);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(isActive ? "Location deactivated" : "Location activated");
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