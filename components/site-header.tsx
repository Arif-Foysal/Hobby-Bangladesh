import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { getCurrentProfile } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { IconLogout, IconExternalLink } from "@tabler/icons-react";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const profile = await getCurrentProfile();
  const email = (authData?.claims?.email as string) ?? profile?.name;

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">Dashboard</h1>
        <div className="ml-auto flex items-center gap-2">
          {email && (
            <span className="hidden text-sm text-muted-foreground sm:block">
              {email}
            </span>
          )}
          <Button variant="ghost" asChild size="sm">
            <Link href="/" target="_blank">
              <IconExternalLink />
              <span className="hidden sm:block">View Store</span>
            </Link>
          </Button>
          <form>
            <Button formAction="/auth/sign-out" variant="ghost" size="sm">
              <IconLogout />
              <span className="hidden sm:block">Sign Out</span>
            </Button>
          </form>
        </div>
      </div>
    </header>
  );
}
