import { createClient } from "@/lib/supabase/server";
import { getCart } from "@/app/cart/actions";
import { getStoreSetting } from "@/lib/supabase/store";
import { getActiveDivisions } from "@/app/admin/locations/actions";
import { CheckoutContent } from "./checkout-content";
import type { StoreShipping } from "@/lib/database/types";

export const metadata = {
  title: "Checkout | Hobby Bangladesh",
};

export interface CheckoutCartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string | null;
}

export default async function CheckoutPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const isLoggedIn = !!authData?.claims;

  const [shipping, divisions] = await Promise.all([
    getStoreSetting("shipping") as Promise<StoreShipping | null>,
    getActiveDivisions(),
  ]);

  let cartItems: CheckoutCartItem[] = [];

  if (isLoggedIn) {
    const dbCart = await getCart();
    cartItems = dbCart.map((item) => {
      const product = item.products;
      const images = Array.isArray(product?.images) ? product.images : [];
      return {
        productId: product?.id ?? "",
        quantity: item.quantity,
        name: product?.name ?? "Unknown",
        price: product?.price ?? 0,
        image: images.length > 0 ? images[0].url : null,
      };
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      <p className="text-muted-foreground">Complete your order.</p>
      <div className="mt-8">
        <CheckoutContent
          initialItems={cartItems}
          isGuest={!isLoggedIn}
          shipping={shipping}
          divisions={divisions}
        />
      </div>
    </div>
  );
}