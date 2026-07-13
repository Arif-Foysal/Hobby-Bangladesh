"use server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";

export async function toggleReviewApproval(id: string, isApproved: boolean) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("reviews")
    .update({ is_approved: !isApproved })
    .eq("id", id);

  if (error) return { error: error.message };

  await logAdminAction({
    action: "toggle",
    resourceType: "review",
    resourceId: id,
    details: { is_approved: !isApproved },
  });

  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function deleteReview(id: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);

  if (error) return { error: error.message };

  await logAdminAction({
    action: "delete",
    resourceType: "review",
    resourceId: id,
  });

  revalidatePath("/admin/reviews");
  return { success: true };
}
