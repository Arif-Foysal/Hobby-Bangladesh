"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import type { HeroSlide } from "@/lib/database/types";
import { emptyCache } from "@/lib/supabase/store";

export async function getHeroSlides(): Promise<HeroSlide[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", "hero_slides")
    .single();

  if (!data?.value) return [];
  return (data.value as { slides: HeroSlide[] }).slides || [];
}

export async function saveHeroSlides(slides: HeroSlide[]) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("store_settings")
    .select("id")
    .eq("key", "hero_slides")
    .single();

  if (existing) {
    await supabase
      .from("store_settings")
      .update({ value: { slides } })
      .eq("key", "hero_slides");
  } else {
    await supabase
      .from("store_settings")
      .insert({ key: "hero_slides", value: { slides } });
  }

  await logAdminAction({
    action: "update",
    resourceType: "settings",
    details: { key: "hero_slides", slide_count: slides.length },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function uploadHeroImage(file: File) {
  await requireAdmin();
  const supabase = await createClient();

  const ext = file.name.split(".").pop();
  const path = `hero/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("hobby-bangladesh")
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from("hobby-bangladesh").getPublicUrl(path);

  return { url: publicUrl };
}

export async function saveStoreInfo(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const value = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    whatsapp_number: (formData.get("whatsapp_number") as string) || undefined,
  };

  const { data: existing } = await supabase
    .from("store_settings")
    .select("id")
    .eq("key", "store")
    .single();

  if (existing) {
    await supabase
      .from("store_settings")
      .update({ value })
      .eq("key", "store");
  } else {
    await supabase
      .from("store_settings")
      .insert({ key: "store", value });
  }

  emptyCache();

  await logAdminAction({
    action: "update",
    resourceType: "settings",
    details: { key: "store", name: value.name },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function saveCurrency(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const value = {
    code: formData.get("code") as string,
    symbol: formData.get("symbol") as string,
    position: formData.get("position") as string,
  };

  const { data: existing } = await supabase
    .from("store_settings")
    .select("id")
    .eq("key", "currency")
    .single();

  if (existing) {
    await supabase
      .from("store_settings")
      .update({ value })
      .eq("key", "currency");
  } else {
    await supabase
      .from("store_settings")
      .insert({ key: "currency", value });
  }

  emptyCache();

  await logAdminAction({
    action: "update",
    resourceType: "settings",
    details: { key: "currency", code: value.code, symbol: value.symbol },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function saveAnalytics(formData: FormData) {
  await requireAdmin();
  const supabase = await createClient();

  const value = {
    enabled: formData.get("enabled") === "on",
    google_analytics_id: (formData.get("google_analytics_id") as string) || undefined,
    meta_pixel_id: (formData.get("meta_pixel_id") as string) || undefined,
    google_ads_id: (formData.get("google_ads_id") as string) || undefined,
  };

  const { data: existing } = await supabase
    .from("store_settings")
    .select("id")
    .eq("key", "analytics")
    .single();

  if (existing) {
    await supabase
      .from("store_settings")
      .update({ value })
      .eq("key", "analytics");
  } else {
    await supabase
      .from("store_settings")
      .insert({ key: "analytics", value });
  }

  emptyCache();

  await logAdminAction({
    action: "update",
    resourceType: "settings",
    details: {
      key: "analytics",
      ga: !!value.google_analytics_id,
      pixel: !!value.meta_pixel_id,
      ads: !!value.google_ads_id,
    },
  });

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}
