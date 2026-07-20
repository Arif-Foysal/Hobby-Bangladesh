"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import type { Location } from "@/lib/database/types";

/**
 * Flat list of all locations for the admin table.
 * Sorted: divisions first (by sort_order), then cities under each, etc.
 */
export async function getLocations(): Promise<Location[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .order("type", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data || []) as Location[];
}

/**
 * Active divisions only, sorted by sort_order then name.
 * Used to populate the checkout Division <Select>.
 */
export async function getActiveDivisions(): Promise<Location[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("is_active", true)
    .eq("type", "division")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return (data || []) as Location[];
}

export async function getLocation(id: string): Promise<Location | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Location;
}

/**
 * Look up a location by name + type. Used by checkout server action to
 * resolve the selected division's delivery_charge.
 */
export async function findLocationByName(
  name: string,
  type: "division" | "city" | "area" = "division"
): Promise<Location | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("locations")
    .select("*")
    .ilike("name", name)
    .eq("type", type)
    .eq("is_active", true)
    .limit(1)
    .single();

  return (data as Location) ?? null;
}

export async function createLocation(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = (formData.get("name") as string).trim();
  const type = formData.get("type") as "division" | "city" | "area";
  const parentId = formData.get("parent_id") as string;
  const deliveryCharge = parseFloat(formData.get("delivery_charge") as string);
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;
  const isActive = formData.get("is_active") === "on";

  if (!name || !type) return { error: "Name and type are required" };
  if (Number.isNaN(deliveryCharge) || deliveryCharge < 0) {
    return { error: "Delivery charge must be 0 or greater" };
  }

  const { data, error } = await supabase
    .from("locations")
    .insert({
      name,
      type,
      parent_id: parentId && parentId !== "none" ? parentId : null,
      delivery_charge: deliveryCharge,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: `A ${type} with this name already exists` };
    }
    return { error: error.message };
  }

  await logAdminAction({
    action: "create",
    resourceType: "location",
    resourceId: data.id,
    details: { name, type, delivery_charge: deliveryCharge },
  });

  revalidatePath("/admin/locations");
  revalidatePath("/checkout");
  return { success: true };
}

export async function updateLocation(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = (formData.get("name") as string).trim();
  const type = formData.get("type") as "division" | "city" | "area";
  const parentId = formData.get("parent_id") as string;
  const deliveryCharge = parseFloat(formData.get("delivery_charge") as string);
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;
  const isActive = formData.get("is_active") === "on";

  if (!name || !type) return { error: "Name and type are required" };
  if (Number.isNaN(deliveryCharge) || deliveryCharge < 0) {
    return { error: "Delivery charge must be 0 or greater" };
  }

  // Prevent a location from being its own parent.
  const resolvedParentId =
    parentId && parentId !== "none" && parentId !== id ? parentId : null;

  const { error } = await supabase
    .from("locations")
    .update({
      name,
      type,
      parent_id: resolvedParentId,
      delivery_charge: deliveryCharge,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: `A ${type} with this name already exists` };
    }
    return { error: error.message };
  }

  await logAdminAction({
    action: "update",
    resourceType: "location",
    resourceId: id,
    details: { name, type, delivery_charge: deliveryCharge },
  });

  revalidatePath("/admin/locations");
  revalidatePath("/checkout");
  return { success: true };
}

export async function deleteLocation(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("locations").delete().eq("id", id);

  if (error) return { error: error.message };

  await logAdminAction({
    action: "delete",
    resourceType: "location",
    resourceId: id,
  });

  revalidatePath("/admin/locations");
  revalidatePath("/checkout");
  return { success: true };
}

export async function toggleLocationActive(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("locations")
    .update({ is_active: !isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  await logAdminAction({
    action: "toggle",
    resourceType: "location",
    resourceId: id,
    details: { is_active: !isActive },
  });

  revalidatePath("/admin/locations");
  revalidatePath("/checkout");
  return { success: true };
}