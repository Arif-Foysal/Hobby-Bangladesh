"use client";

import { useRouter } from "next/navigation";
import { toggleCategoryActive } from "./actions";
import { Badge } from "@/components/ui/badge";

export function ToggleActiveButton({ id, isActive }: { id: string; isActive: boolean }) {
  const router = useRouter();

  const handleToggle = async () => {
    await toggleCategoryActive(id, isActive);
    router.refresh();
  };

  return (
    <button onClick={handleToggle} className="cursor-pointer">
      <Badge variant={isActive ? "default" : "secondary"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
    </button>
  );
}
