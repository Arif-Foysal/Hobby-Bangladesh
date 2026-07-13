"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function getSearchSuggestions(query: string) {
  const supabase = await createClient();
  try {
    const { data } = await supabase.rpc("search_did_you_mean", { query });
    return (data as { suggestion: string; similarity: number }[]) || [];
  } catch {
    return [];
  }
}

export async function logSearchQuery(
  query: string,
  resultCount: number,
  page: string = "products",
) {
  const supabase = await createClient();
  try {
    const { data: user } = await supabase.auth.getUser();
    await supabase.from("search_queries").insert({
      query,
      result_count: resultCount,
      user_id: user?.user?.id ?? null,
      page,
    });
  } catch {
    // silently fail
  }
}

export async function getProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(name, slug)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getAdminProducts({
  search,
  status,
  category,
  sort = "newest",
  page = 1,
  perPage = 20,
}: {
  search?: string;
  status?: string;
  category?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}) {
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("products")
    .select("*, categories(name, slug)", { count: "exact" });

  if (search) {
    query = query.or(`name.ilike.%${search}%,sku.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  if (status === "active") {
    query = query.eq("is_active", true);
  } else if (status === "inactive") {
    query = query.eq("is_active", false);
  }

  if (category && category !== "all") {
    query = query.eq("category_id", category);
  }

  switch (sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "name_asc":
      query = query.order("name", { ascending: true });
      break;
    case "name_desc":
      query = query.order("name", { ascending: false });
      break;
    case "stock_asc":
      query = query.order("stock_qty", { ascending: true });
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
    products: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / perPage),
  };
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
  minPrice,
  maxPrice,
  inStock,
}: {
  categorySlug?: string;
  search?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
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

  // Search across name, short_desc, and description
  if (search) {
    query = query.or(
      `name.ilike.%${search}%,short_desc.ilike.%${search}%,description.ilike.%${search}%`
    );
  }

  if (minPrice !== undefined) {
    query = query.gte("price", minPrice);
  }

  if (maxPrice !== undefined) {
    query = query.lte("price", maxPrice);
  }

  if (inStock) {
    query = query.gt("stock_qty", 0);
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

  // Push popular results higher when there's a search
  if (search) {
    query = query.order("sold_count", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  // If ilike returned 0 results with a search term, try fuzzy matching
  let fuzzyResults: typeof data = [];
  if (search && data && data.length === 0) {
    const { data: fuzzyIds } = await supabase.rpc("search_products_fuzzy", {
      query: search,
    });
    if (fuzzyIds && fuzzyIds.length > 0) {
      const ids = fuzzyIds.map((r: { id: string }) => r.id);
      const { data: full } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("is_active", true)
        .in("id", ids)
        .order("sold_count", { ascending: false });
      fuzzyResults = full || [];
    }
  }

  return {
    products: data || [],
    total: count || 0,
    totalPages: Math.ceil((count || 0) / perPage),
    fuzzyResults,
  };
}

export async function createProduct(formData: FormData) {
  await requireAdmin();
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
  const featuresJson = formData.get("features") as string;
  const features = featuresJson ? JSON.parse(featuresJson) : [];
  const landingPageEnabled = formData.get("landing_page_enabled") === "true";
  const landingPageSectionsJson = formData.get("landing_page_sections") as string;
  const landingPageSections = landingPageSectionsJson ? JSON.parse(landingPageSectionsJson) : {};

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
      features,
      landing_page_enabled: landingPageEnabled,
      landing_page_sections: landingPageSections,
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
  await logAdminAction({
    action: "create",
    resourceType: "product",
    resourceId: data.id,
    details: { name, slug, price },
  });
  return { success: true, id: data.id };
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();
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
  const featuresJson = formData.get("features") as string;
  const features = featuresJson ? JSON.parse(featuresJson) : [];
  const landingPageEnabled = formData.get("landing_page_enabled") === "true";
  const landingPageSectionsJson = formData.get("landing_page_sections") as string;
  const landingPageSections = landingPageSectionsJson ? JSON.parse(landingPageSectionsJson) : {};

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
      features,
      landing_page_enabled: landingPageEnabled,
      landing_page_sections: landingPageSections,
    })
    .eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "A product with this slug already exists" };
    }
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  await logAdminAction({
    action: "update",
    resourceType: "product",
    resourceId: id,
    details: { name, slug, price },
  });
  return { success: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  await logAdminAction({
    action: "delete",
    resourceType: "product",
    resourceId: id,
  });
  return { success: true };
}

export async function toggleProductActive(id: string, isActive: boolean) {
  await requireAdmin();
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
  await requireAdmin();
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
