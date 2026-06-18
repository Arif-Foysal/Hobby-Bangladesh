"use server";

import { createClient } from "@/lib/supabase/server";

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

    await supabase.from("audit_log").insert({
      user_id: userId || null,
      action,
      resource_type: resourceType,
      resource_id: resourceId || null,
      details: details || null,
    });
  } catch {
    // Silently fail - audit logging should not break the main flow
  }
}
