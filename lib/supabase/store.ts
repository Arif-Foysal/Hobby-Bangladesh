import { createClient } from "@/lib/supabase/server";
import type {
  StoreCurrency,
  StoreTax,
  StoreShipping,
  StoreInfo,
  StoreAnalytics,
  StoreSetting,
} from "@/lib/database/types";

const settingCache = new Map<string, StoreSetting["value"]>();

function emptyCache() {
  settingCache.clear();
}

/**
 * Get a store setting by key. Results are cached for the request duration.
 * Call `emptyCache()` if settings are mutated during the request.
 */
export async function getStoreSetting<K extends string>(
  key: K
): Promise<K extends "currency" ? StoreCurrency
     : K extends "tax" ? StoreTax
     : K extends "shipping" ? StoreShipping
     : K extends "store" ? StoreInfo
     : K extends "analytics" ? StoreAnalytics
     : Record<string, unknown> | null> {
  if (settingCache.has(key)) {
    return settingCache.get(key) as never;
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("store_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) {
    return null as never;
  }

  const value = (data as Pick<StoreSetting, "value">).value;
  settingCache.set(key, value);

  return value as never;
}

export async function updateStoreSetting(
  key: string,
  value: Record<string, unknown>
) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("store_settings")
    .update({ value })
    .eq("key", key);

  if (error) throw error;

  settingCache.delete(key);
}

export async function getAllStoreSettings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("store_settings")
    .select("*")
    .order("key");

  if (error) throw error;
  return data;
}

export { emptyCache };
