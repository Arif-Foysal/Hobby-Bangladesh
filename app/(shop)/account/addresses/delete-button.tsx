"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteAddress } from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";

export function DeleteAddressButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteAddress(id);
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-fit text-muted-foreground"
      onClick={handleDelete}
      disabled={loading}
    >
      <IconTrash />
      {loading ? "Removing..." : "Remove"}
    </Button>
  );
}
