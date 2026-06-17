import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCheckoutData } from "./actions";
import { CheckoutForm } from "./checkout-form";

export const metadata = {
  title: "Checkout | Hobby Bangladesh",
};

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/auth/login");

  const data = await getCheckoutData();
  if ("error" in data) redirect("/cart");

  if (data.cart.length === 0) redirect("/cart");

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="text-muted-foreground">Complete your order.</p>

      <div className="mt-8">
        <CheckoutForm
          cart={data.cart}
          addresses={data.addresses}
          shipping={data.shipping as { inside_dhaka: number; outside_dhaka: number; free_shipping_min: number } | null}
        />
      </div>
    </div>
  );
}
