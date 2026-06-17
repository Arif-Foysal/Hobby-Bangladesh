"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCart() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) return [];

  const { data, error } = await supabase
    .from("carts")
    .select("*, products(id, name, slug, price, compare_at, images, stock_qty, is_active)")
    .eq("user_id", authData.claims.sub)
    .order("added_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getCartCount() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) return 0;

  const { count } = await supabase
    .from("carts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", authData.claims.sub);

  return count || 0;
}

export async function addToCart(productId: string, quantity: number = 1) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) return { error: "Not authenticated" };

  const userId = authData.claims.sub;

  const { data: existing } = await supabase
    .from("carts")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from("carts")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("carts").insert({
      user_id: userId,
      product_id: productId,
      quantity,
    });
    if (error) return { error: error.message };
  }

  revalidatePath("/cart");
  revalidatePath("/products");
  return { success: true };
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const supabase = await createClient();

  if (quantity <= 0) {
    return removeFromCart(cartItemId);
  }

  const { error } = await supabase
    .from("carts")
    .update({ quantity })
    .eq("id", cartItemId);

  if (error) return { error: error.message };

  revalidatePath("/cart");
  return { success: true };
}

export async function removeFromCart(cartItemId: string) {
  const supabase = await createClient();

  const { error } = await supabase.from("carts").delete().eq("id", cartItemId);
  if (error) return { error: error.message };

  revalidatePath("/cart");
  return { success: true };
}

export async function clearCart() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) return;

  await supabase.from("carts").delete().eq("user_id", authData.claims.sub);
  revalidatePath("/cart");
}
