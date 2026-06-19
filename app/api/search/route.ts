import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 1) {
    return NextResponse.json({ results: [], suggestions: [] });
  }

  const supabase = await createClient();

  // 1. Try full-text search (search_vector now includes category name via trigger)
  try {
    const { data, error } = await supabase
      .from("products")
      .select("id, name, slug, price, compare_at, images, short_desc, categories(name, slug)")
      .eq("is_active", true)
      .textSearch("search_vector", q, { type: "websearch", config: "english" })
      .order("sold_count", { ascending: false })
      .limit(8);

    if (!error && data && data.length > 0) {
      logSearch(supabase, q, data.length);
      return NextResponse.json({ results: data, fuzzy: false, suggestions: [] });
    }
  } catch {
    // fall through to fuzzy
  }

  // 2. Try fuzzy matching via pg_trgm (handles typos like "addidas" -> "adidas")
  try {
    const { data: fuzzyData, error: fuzzyError } = await supabase.rpc(
      "search_products_fuzzy",
      { query: q }
    );

    if (!fuzzyError && fuzzyData && fuzzyData.length > 0) {
      const mapped = fuzzyData.map((r: Record<string, unknown>) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        price: r.price,
        compare_at: r.compare_at,
        images: r.images,
        short_desc: r.short_desc,
        categories: r.categories,
        similarity: r.similarity,
      }));
      logSearch(supabase, q, mapped.length);
      return NextResponse.json({ results: mapped, fuzzy: true, suggestions: [] });
    }
  } catch {
    // fall through to did-you-mean
  }

  // 3. Fallback: ilike across multiple columns + category name
  try {
    const { data } = await supabase
      .from("products")
      .select("id, name, slug, price, compare_at, images, short_desc, categories(name, slug)")
      .eq("is_active", true)
      .or(
        `name.ilike.%${q}%,short_desc.ilike.%${q}%,description.ilike.%${q}%`
      )
      .order("sold_count", { ascending: false })
      .limit(8);

    if (data && data.length > 0) {
      logSearch(supabase, q, data.length);
      return NextResponse.json({ results: data, fuzzy: false, suggestions: [] });
    }
  } catch {
    // fall through
  }

  // 4. No results — get did-you-mean suggestions
  let suggestions: { suggestion: string; similarity: number }[] = [];
  try {
    const { data: sugData } = await supabase.rpc("search_did_you_mean", {
      query: q,
    });
    if (sugData) {
      suggestions = sugData;
    }
  } catch {
    // no suggestions available
  }

  logSearch(supabase, q, 0);
  return NextResponse.json({ results: [], fuzzy: false, suggestions });
}

async function logSearch(
  supabase: Awaited<ReturnType<typeof createClient>>,
  query: string,
  resultCount: number,
) {
  try {
    const { data: user } = await supabase.auth.getUser();
    await supabase.from("search_queries").insert({
      query,
      result_count: resultCount,
      user_id: user?.user?.id ?? null,
      page: "header",
    });
  } catch {
    // silently fail — analytics should never break search
  }
}
