"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { HeroSlide } from "@/lib/database/types";

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

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function uploadHeroImage(file: File) {
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
  const supabase = await createClient();

  const value = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
  };

  await supabase
    .from("store_settings")
    .update({ value })
    .eq("key", "store");

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}

export async function saveCurrency(formData: FormData) {
  const supabase = await createClient();

  const value = {
    code: formData.get("code") as string,
    symbol: formData.get("symbol") as string,
    position: formData.get("position") as string,
  };

  await supabase
    .from("store_settings")
    .update({ value })
    .eq("key", "currency");

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { success: true };
}
