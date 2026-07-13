"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

async function getRequestIp(): Promise<string | null> {
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();
    const realIp = headerList.get("x-real-ip");
    if (realIp) return realIp.trim();
    return null;
  } catch {
    return null;
  }
}

export async function logAdminAction({
  action,
  resourceType,
  resourceId,
  details,
}: {
  action: string;
  resourceType: string;
  resourceId?: string;
  details?: Record<string, unknown>;
}) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getClaims();
    const userId = authData?.claims?.sub;
    const ipAddress = await getRequestIp();

    await supabase.from("audit_log").insert({
      user_id: userId || null,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      details: details || null,
      ip_address: ipAddress,
    });
  } catch {
    // Silently fail - audit logging should not break the main flow
  }
}

export async function logAuthEvent(
  action: string,
  details?: Record<string, unknown>
) {
  try {
    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getClaims();
    const userId = authData?.claims?.sub ?? null;
    const ipAddress = await getRequestIp();

    await supabase.from("audit_log").insert({
      user_id: userId,
      action,
      resource_type: "auth",
      resource_id: null,
      details: details || null,
      ip_address: ipAddress,
    });
  } catch {
    // Silently fail
  }
}

export async function logDeniedAccess(
  ipAddress: string | null,
  path: string
) {
  try {
    const supabase = await createClient();
    await supabase.from("audit_log").insert({
      user_id: null,
      action: "denied_access",
      resource_type: "auth",
      resource_id: null,
      details: { path },
      ip_address: ipAddress,
    });
  } catch {
    // Silently fail
  }
}