"use server";

import { createClient } from "@/lib/supabase/server";
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

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
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

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function deleteCategory(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function toggleCategoryActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("categories")
    .update({ is_active: !isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/categories");
  return { success: true };
}

export async function uploadCategoryImage(file: File) {
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
