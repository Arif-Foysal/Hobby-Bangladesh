"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function getCustomerDetail(userId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !profile) return null;

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", userId)
    .order("is_default", { ascending: false });

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, products(name, slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return {
    profile,
    orders: orders || [],
    addresses: addresses || [],
    reviews: reviews || [],
  };
}

export async function updateUserRole(userId: string, role: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getClaims();
  if (authData?.claims?.sub === userId) {
    return { error: "You cannot change your own role" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/customers/${userId}`);
  revalidatePath("/admin/customers");
  return { success: true };
}
