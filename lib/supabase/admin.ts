import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/database/types";

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;
  return data as Profile;
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient();

  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) return null;

  return getProfile(authData.claims.sub);
}

export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.role === "admin";
}

export async function requireAdmin(): Promise<Profile> {
  const profile = await getCurrentProfile();

  if (!profile) {
    throw new Error("Not authenticated");
  }

  if (profile.role !== "admin") {
    throw new Error("Not authorized — admin role required");
  }

  return profile;
}

export async function getCustomers() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Profile[];
}

export async function makeAdmin(userId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId);

  if (error) throw error;
}
