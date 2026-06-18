"use server";

import { createClient } from "@/lib/supabase/server";

export async function getMyOrders() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) return [];

  const { data } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", authData.claims.sub)
    .order("created_at", { ascending: false });

  return data || [];
}

export async function getMyOrder(orderId: string) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) return null;

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .eq("user_id", authData.claims.sub)
    .single();

  return data;
}

export async function getMyAddresses() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) return [];

  const { data } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", authData.claims.sub)
    .order("is_default", { ascending: false });

  return data || [];
}

export async function deleteAddress(addressId: string) {
  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", addressId);
  return { success: true };
}
