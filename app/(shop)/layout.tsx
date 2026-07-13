import { SiteHeader as SiteHeaderPublic } from "@/components/site-header-public";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFloat } from "@/components/whatsapp-float";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { getStoreSetting } from "@/lib/supabase/store";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const analytics = await getStoreSetting("analytics");

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeaderPublic />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <WhatsAppFloat />
      <AnalyticsScripts
        enabled={analytics?.enabled ?? false}
        gtmContainerId={analytics?.gtm_container_id}
      />
    </div>
  );
}
