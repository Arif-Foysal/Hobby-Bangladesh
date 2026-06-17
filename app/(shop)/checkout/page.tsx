import { getStoreSetting } from "@/lib/supabase/store";
import { CheckoutContent } from "./checkout-content";

export const metadata = {
  title: "Checkout | Hobby Bangladesh",
};

export default async function CheckoutPage() {
  const shipping = (await getStoreSetting("shipping")) as {
    inside_dhaka: number;
    outside_dhaka: number;
    free_shipping_min: number;
  } | null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="text-muted-foreground">Complete your order.</p>
      <div className="mt-8">
        <CheckoutContent shipping={shipping} />
      </div>
    </div>
  );
}
