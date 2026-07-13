"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { logAuthEvent } from "@/lib/audit";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { IconLogout } from "@tabler/icons-react";
import { toast } from "sonner";

export function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await logAuthEvent("logout");
    await supabase.auth.signOut();
    toast.success("Signed out");
    router.push("/auth/login");
    router.refresh();
  };

  return (
    <DropdownMenuItem onClick={handleSignOut} className="flex items-center gap-2 text-destructive focus:text-destructive">
      <IconLogout className="size-4" />
      Sign Out
    </DropdownMenuItem>
  );
}
