import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { getCurrentProfile } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || profile.role !== "admin") {
      redirect("/auth/login");
    }

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getClaims();
    const email = (authData?.claims?.email as string) ?? "";

    const user = {
      name: profile.name ?? "Admin",
      email,
      avatar: profile.avatar_url ?? "",
    };

    return (
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" user={user} />
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-1">
              <div className="flex flex-col gap-3 py-3 md:gap-4 md:py-4">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  } catch {
    redirect("/auth/login");
  }
}
