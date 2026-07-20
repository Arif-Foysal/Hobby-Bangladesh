import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getHeroSlides, getBranding } from "./actions";
import { getStoreSetting } from "@/lib/supabase/store";
import { HeroSlidesManager } from "./hero-slides-manager";
import { BrandingForm } from "./branding-form";
import { StoreInfoForm } from "./store-info-form";
import { CurrencyForm } from "./currency-form";
import { ShippingForm } from "./shipping-form";
import { AnalyticsForm } from "./analytics-form";

export const metadata = { title: "Settings | Admin | Hobby Bangladesh" };

export default async function SettingsPage() {
  const [heroSlides, branding, storeInfo, currency, shipping, analytics] = await Promise.all([
    getHeroSlides(),
    getBranding(),
    getStoreSetting("store"),
    getStoreSetting("currency"),
    getStoreSetting("shipping"),
    getStoreSetting("analytics"),
  ]);

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your store configuration.
        </p>
      </div>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList>
          <TabsTrigger value="hero">Hero Slides</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="store">Store Info</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="shipping">Shipping</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-4">
          <HeroSlidesManager initialSlides={heroSlides} />
        </TabsContent>

        <TabsContent value="branding" className="mt-4">
          <BrandingForm initialLogoUrl={branding?.logo_url ?? null} />
        </TabsContent>

        <TabsContent value="store" className="mt-4">
          <StoreInfoForm
            initialData={
              (storeInfo as { name: string; email: string; phone: string; address: string; whatsapp_number?: string }) ?? {
                name: "",
                email: "",
                phone: "",
                address: "",
                whatsapp_number: "",
              }
            }
          />
        </TabsContent>

        <TabsContent value="currency" className="mt-4">
          <CurrencyForm
            initialData={
              (currency as { code: string; symbol: string; position: string }) ?? {
                code: "BDT",
                symbol: "৳",
                position: "before",
              }
            }
          />
        </TabsContent>

        <TabsContent value="shipping" className="mt-4">
          <ShippingForm
            initialData={
              (shipping as {
                inside_dhaka: number;
                outside_dhaka: number;
                free_shipping_min: number;
              }) ?? {
                inside_dhaka: 60,
                outside_dhaka: 100,
                free_shipping_min: 5000,
              }
            }
          />
        </TabsContent>

        <TabsContent value="tracking" className="mt-4">
          <AnalyticsForm
            initialData={
              (analytics as {
                enabled?: boolean;
                gtm_container_id?: string;
              }) ?? {
                enabled: false,
                gtm_container_id: "",
              }
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
