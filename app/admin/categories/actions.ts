"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getAdminCategories({
  search,
  status,
  sort = "sort_order",
  page = 1,
  perPage = 50,
}: {
  search?: string;
  status?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}) {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("categories")
    .select("*, parent:parent_id(name)", { count: "exact" });

  if (search) {
    query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  switch (sort) {
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    case "name_desc":
      query = query.order("name", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("sort_order", { ascending: true }).order("name", { ascending: true });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    categories: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

export async function getCategory(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("image_url") as string;
  const parentId = formData.get("parent_id") as string;
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;
  const isActive = formData.get("is_active") === "on";

  const { error } = await supabase.from("categories").insert({
    name,
    slug,
    description: description || null,
    image_url: imageUrl || null,
    parent_id: parentId && parentId !== "none" ? parentId : null,
    sort_order: sortOrder,
    is_active: isActive,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "A category with this slug already exists" };
    }
    return { error: error.message };
  }

  await logAdminAction({
    action: "create",
    resourceType: "category",
    details: { name, slug },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("image_url") as string;
  const parentId = formData.get("parent_id") as string;
  const sortOrder = parseInt(formData.get("sort_order") as string) || 0;
  const isActive = formData.get("is_active") === "on";

  const { error } = await supabase
    .from("categories")
    .update({
      name,
      slug,
      description: description || null,
      image_url: imageUrl || null,
      parent_id: parentId && parentId !== "none" ? parentId : null,
      sort_order: sortOrder,
      is_active: isActive,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A category with this slug already exists" };
    }
    return { error: error.message };
  }

  await logAdminAction({
    action: "update",
    resourceType: "category",
    resourceId: id,
    details: { name, slug },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  await logAdminAction({
    action: "delete",
    resourceType: "category",
    resourceId: id,
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategorySortOrders(ids: string[]) {
  await requireAdmin();
  const supabase = await createClient();

  const updates = ids.map((id, index) =>
    supabase
      .from("categories")
      .update({ sort_order: index })
      .eq("id", id)
  );

  await Promise.all(updates);

  await logAdminAction({
    action: "reorder",
    resourceType: "category",
    details: { count: ids.length },
  });

  revalidatePath("/");
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return { success: true };
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: !isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  await logAdminAction({
    action: "toggle",
    resourceType: "category",
    resourceId: id,
    details: { is_active: !isActive },
  });

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function uploadCategoryImage(file: File) {
  await requireAdmin();
  const supabase = await createClient();

  const ext = file.name.split(".").pop();
  const path = `categories/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("hobby-bangladesh")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("hobby-bangladesh").getPublicUrl(path);

  return { url: publicUrl };
}
