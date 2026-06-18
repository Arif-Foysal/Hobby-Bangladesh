import { createClient } from "@/lib/supabase/server";
import { getCart } from "@/app/cart/actions";
import { getStoreSetting } from "@/lib/supabase/store";
import { CartPageContent } from "./cart-content";

export const metadata = {
  title: "Cart | Hobby Bangladesh",
};

export interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    images: { url: string }[];
    stock_qty: number;
  } | null;
}

export interface ShippingSettings {
  inside_dhaka: number;
  outside_dhaka: number;
  free_shipping_min: number;
}

export default async function CartPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  const isLoggedIn = !!authData?.claims;

  let cartItems: CartItem[] = [];
  if (isLoggedIn) {
    cartItems = (await getCart()) as CartItem[];
  }

  const shipping = await getStoreSetting("shipping") as ShippingSettings | null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <h1 className="font-display text-3xl font-bold tracking-tight">Shopping Cart</h1>
      <CartPageContent initialItems={cartItems} isGuest={!isLoggedIn} shipping={shipping} />
    </div>
  );
}
