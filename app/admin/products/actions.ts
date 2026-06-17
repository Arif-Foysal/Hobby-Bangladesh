"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getProduct(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) return null;
  return data;
}

export async function getProductsForListing({
  categorySlug,
  search,
  sort,
  page,
  perPage = 12,
}: {
  categorySlug?: string;
  search?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}) {
  const supabase = await createClient();
  const from = ((page || 1) - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("products")
    .select("*, categories(name, slug)", { count: "exact" })
    .eq("is_active", true);

  if (categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .single();
    if (cat) {
      query = query.eq("category_id", cat.id);
    }
  }

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
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

  return { products: data, total: count || 0, totalPages: Math.ceil((count || 0) / perPage) };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const shortDesc = formData.get("short_desc") as string;
  const price = parseFloat(formData.get("price") as string);
  const compareAt = parseFloat(formData.get("compare_at") as string) || null;
  const costPrice = parseFloat(formData.get("cost_price") as string) || null;
  const sku = formData.get("sku") as string;
  const stockQty = parseInt(formData.get("stock_qty") as string) || 0;
  const categoryId = formData.get("category_id") as string;
  const isActive = formData.get("is_active") === "on";

  const imagesJson = formData.get("images") as string;
  const images = imagesJson ? JSON.parse(imagesJson) : [];

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      description: description || null,
      short_desc: shortDesc || null,
      price,
      compare_at: compareAt,
      cost_price: costPrice,
      sku: sku || null,
      stock_qty: stockQty,
      category_id: categoryId && categoryId !== "none" ? categoryId : null,
      is_active: isActive,
      images,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { error: "A product with this slug already exists" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  return { success: true, id: data.id };
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;
  const description = formData.get("description") as string;
  const shortDesc = formData.get("short_desc") as string;
  const price = parseFloat(formData.get("price") as string);
  const compareAt = parseFloat(formData.get("compare_at") as string) || null;
  const costPrice = parseFloat(formData.get("cost_price") as string) || null;
  const sku = formData.get("sku") as string;
  const stockQty = parseInt(formData.get("stock_qty") as string) || 0;
  const categoryId = formData.get("category_id") as string;
  const isActive = formData.get("is_active") === "on";

  const imagesJson = formData.get("images") as string;
  const images = imagesJson ? JSON.parse(imagesJson) : [];

  const { error } = await supabase
    .from("products")
    .update({
      name,
      slug,
      description: description || null,
      short_desc: shortDesc || null,
      price,
      compare_at: compareAt,
      cost_price: costPrice,
      sku: sku || null,
      stock_qty: stockQty,
      category_id: categoryId && categoryId !== "none" ? categoryId : null,
      is_active: isActive,
      images,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A product with this slug already exists" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  return { success: true };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({ is_active: !isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  return { success: true };
}

export async function uploadProductImage(file: File, productId: string) {
  const supabase = await createClient();

  const ext = file.name.split(".").pop();
  const path = `products/${productId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("hobby-bangladesh")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("hobby-bangladesh").getPublicUrl(path);

  return { url: publicUrl };
}
