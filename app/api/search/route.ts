import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }

  const supabase = await createClient();

  // Try full-text search first (requires search_vector column from migration).
  // Fallback to ilike across name, short_desc, and description.
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, compare_at, images, short_desc, categories(name, slug)")
      .eq("is_active", true)
      .textSearch("search_vector", q, { type: "websearch", config: "english" })
      .order("sold_count", { ascending: false })
      .limit(8);

    if (!error) {
      return NextResponse.json({ results: data || [] });
    }
  } catch {
    // fallback below
  }

  // Fallback: ilike across multiple columns
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, compare_at, images, short_desc, categories(name, slug)")
    .eq("is_active", true)
    .or(
      `name.ilike.%${q}%,short_desc.ilike.%${q}%,description.ilike.%${q}%`
    )
    .order("sold_count", { ascending: false })
    .limit(8);

  return NextResponse.json({ results: data || [] });
}
