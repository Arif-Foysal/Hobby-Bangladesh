"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { updateUserRole } from "../actions";

export function RoleManager({
  userId,
  currentRole,
}: {
  userId: string;
  currentRole: string;
}) {
  const [role, setRole] = useState(currentRole);
  const [loading, setLoading] = useState(false);

  const handleUpdate = async () => {
    setLoading(true);
    const result = await updateUserRole(userId, role);
    setLoading(false);
    if (result?.error) {
      toast.error(result.error);
    } else {
      toast.success(`Role updated to ${role}`);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={role} onValueChange={setRole}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="customer">Customer</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
        </SelectContent>
      </Select>
      <Button
        size="sm"
        onClick={handleUpdate}
        disabled={loading || role === currentRole}
      >
        {loading ? "Saving..." : "Update"}
      </Button>
    </div>
  );
}
