"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { requireAdmin } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { logAdminAction } from "@/lib/audit";

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

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/customers/${userId}`);
  revalidatePath("/admin/customers");
  return { success: true };
}

export async function createUser(formData: FormData) {
  await requireAdmin();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const role = formData.get("role") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters" };
  }

  let adminClient;
  try {
    adminClient = createAdminClient();
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Admin client not configured" };
  }

  const { data, error } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Failed to create user" };

  const { error: profileError } = await adminClient
    .from("profiles")
    .update({
      name: name || null,
      phone: phone || null,
      role: role === "admin" ? "admin" : "customer",
    })
    .eq("id", data.user.id);

  if (profileError) return { error: profileError.message };

  await logAdminAction({
    action: "create",
    resourceType: "user",
    resourceId: data.user.id,
    details: { email, role },
  });

  revalidatePath("/admin/customers");
  return { success: true, userId: data.user.id };
}

export async function editUserProfile(userId: string, formData: FormData) {
  await requireAdmin();

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;

  const adminClient = createAdminClient();
  const { error } = await adminClient
    .from("profiles")
    .update({
      name: name || null,
      phone: phone || null,
    })
    .eq("id", userId);

  if (error) return { error: error.message };

  await logAdminAction({
    action: "update",
    resourceType: "user",
    resourceId: userId,
    details: { name, phone },
  });

  revalidatePath(`/admin/customers/${userId}`);
  revalidatePath("/admin/customers");
  return { success: true };
}
