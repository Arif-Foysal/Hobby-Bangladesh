"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getAdminCoupons({
  search,
  status,
  sort = "newest",
  page = 1,
  perPage = 20,
}: {
  search?: string;
  status?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}) {
  await requireAdmin();
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("coupons")
    .select("*", { count: "exact" });

  if (search) {
    query = query.or(`code.ilike.%${search}%,description.ilike.%${search}%`);
  }

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  switch (sort) {
    case "code_asc":
      query = query.order("code", { ascending: true });
      break;
    case "code_desc":
      query = query.order("code", { ascending: false });
      break;
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    coupons: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

export async function getCoupon(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCoupon(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const code = (formData.get("code") as string).toUpperCase().trim();
  const description = formData.get("description") as string;
  const discountType = formData.get("discount_type") as string;
  const discountValue = parseFloat(formData.get("discount_value") as string);
  const minOrderAmount = parseFloat(formData.get("min_order_amount") as string) || 0;
  const maxDiscountAmount = parseFloat(formData.get("max_discount_amount") as string) || null;
  const usageLimit = parseInt(formData.get("usage_limit") as string) || null;
  const isActive = formData.get("is_active") === "on";
  const startsAt = formData.get("starts_at") as string || null;
  const expiresAt = formData.get("expires_at") as string || null;

  if (discountType === "percentage" && discountValue > 100) {
    return { error: "Percentage discount cannot exceed 100%" };
  }

  const { error } = await supabase.from("coupons").insert({
    code,
    description: description || null,
    discount_type: discountType,
    discount_value: discountValue,
    min_order_amount: minOrderAmount,
    max_discount_amount: discountType === "percentage" ? maxDiscountAmount : null,
    usage_limit: usageLimit,
    is_active: isActive,
    starts_at: startsAt || null,
    expires_at: expiresAt || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A coupon with this code already exists" };
    }
    return { error: error.message };
  }

  await logAdminAction({
    action: "create",
    resourceType: "coupon",
    details: { code, discount_type: discountType, discount_value: discountValue },
  });

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCoupon(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const code = (formData.get("code") as string).toUpperCase().trim();
  const description = formData.get("description") as string;
  const discountType = formData.get("discount_type") as string;
  const discountValue = parseFloat(formData.get("discount_value") as string);
  const minOrderAmount = parseFloat(formData.get("min_order_amount") as string) || 0;
  const maxDiscountAmount = parseFloat(formData.get("max_discount_amount") as string) || null;
  const usageLimit = parseInt(formData.get("usage_limit") as string) || null;
  const isActive = formData.get("is_active") === "on";
  const startsAt = formData.get("starts_at") as string || null;
  const expiresAt = formData.get("expires_at") as string || null;

  if (discountType === "percentage" && discountValue > 100) {
    return { error: "Percentage discount cannot exceed 100%" };
  }

  const { error } = await supabase
    .from("coupons")
    .update({
      code,
      description: description || null,
      discount_type: discountType,
      discount_value: discountValue,
      min_order_amount: minOrderAmount,
      max_discount_amount: discountType === "percentage" ? maxDiscountAmount : null,
      usage_limit: usageLimit,
      is_active: isActive,
      starts_at: startsAt || null,
      expires_at: expiresAt || null,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A coupon with this code already exists" };
    }
    return { error: error.message };
  }

  await logAdminAction({
    action: "update",
    resourceType: "coupon",
    resourceId: id,
    details: { code, discount_type: discountType, discount_value: discountValue },
  });

  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("coupons").delete().eq("id", id);

  if (error) return { error: error.message };
  await logAdminAction({
    action: "delete",
    resourceType: "coupon",
    resourceId: id,
  });
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("coupons")
    .update({ is_active: !isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  await logAdminAction({
    action: "toggle",
    resourceType: "coupon",
    resourceId: id,
    details: { is_active: !isActive },
  });

  revalidatePath("/admin/coupons");
  return { success: true };
}
