import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getHeroSlides } from "./actions";
import { getStoreSetting } from "@/lib/supabase/store";
import { HeroSlidesManager } from "./hero-slides-manager";
import { StoreInfoForm } from "./store-info-form";
import { CurrencyForm } from "./currency-form";

export const metadata = { title: "Settings | Admin | Hobby Bangladesh" };

export default async function SettingsPage() {
  const [heroSlides, storeInfo, currency] = await Promise.all([
    getHeroSlides(),
    getStoreSetting("store"),
    getStoreSetting("currency"),
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
          <TabsTrigger value="store">Store Info</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
        </TabsList>

        <TabsContent value="hero" className="mt-4">
          <HeroSlidesManager initialSlides={heroSlides} />
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
      </Tabs>
    </div>
  );
}
