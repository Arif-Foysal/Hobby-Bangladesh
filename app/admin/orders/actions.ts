"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin-client";
import { requireAdmin } from "@/lib/supabase/admin";
import { logAdminAction } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { getStoreSetting } from "@/lib/supabase/store";
import type { InvoiceData } from "@/lib/database/types";

export async function getAllOrders() {
  await requireAdmin();
  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  if (!orders || orders.length === 0) return [];

  const userIds = [...new Set(orders.map((o) => o.user_id).filter(Boolean))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, phone")
    .in("id", userIds);

  const profileMap = new Map(
    (profiles || []).map((p) => [p.id, { name: p.name, phone: p.phone }])
  );

  return orders.map((order) => ({
    ...order,
    profiles: profileMap.get(order.user_id) ?? null,
  }));
}

export async function getAdminOrders({
  search,
  status,
  paymentStatus,
  sort = "newest",
  page = 1,
  perPage = 20,
}: {
  search?: string;
  status?: string;
  paymentStatus?: string;
  sort?: string;
  page?: number;
  perPage?: number;
}) {
  await requireAdmin();
  const supabase = await createClient();
  const from = (page - 1) * perPage;
  const to = from + perPage - 1;

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" });

  if (search) {
    query = query.or(`order_number.ilike.%${search}%`);
  }

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (paymentStatus && paymentStatus !== "all") {
    query = query.eq("payment_status", paymentStatus);
  }

  switch (sort) {
    case "oldest":
      query = query.order("created_at", { ascending: true });
      break;
    case "total_asc":
      query = query.order("total", { ascending: true });
      break;
    case "total_desc":
      query = query.order("total", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data: orders, error, count } = await query;
  if (error) throw error;

  const userIds = [...new Set((orders || []).map((o) => o.user_id).filter(Boolean))];
  let profileMap = new Map<string, { name: string | null; phone: string | null }>();

  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, name, phone")
      .in("id", userIds);

    profileMap = new Map(
      (profiles || []).map((p) => [p.id, { name: p.name, phone: p.phone }])
    );
  }

  const ordersWithProfiles = (orders || []).map((order) => ({
    ...order,
    profiles: profileMap.get(order.user_id) ?? null,
  }));

  return {
    orders: ordersWithProfiles,
    total: count || 0,
    totalPages: Math.ceil((count || 0) / perPage),
  };
}

export async function getOrder(orderId: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (orderError || !order) {
    if (orderError) console.error("getOrder error:", orderError);
    return null;
  }

  if (order.user_id) {
    // profiles has no email column — select only existing columns.
    const { data: profile } = await supabase
      .from("profiles")
      .select("name, phone")
      .eq("id", order.user_id)
      .single();

    // Fetch the verified account email from auth.users via the admin client.
    let customerEmail: string | null = null;
    try {
      const admin = createAdminClient();
      const { data } = await admin.auth.admin.getUserById(order.user_id);
      customerEmail = data?.user?.email ?? null;
    } catch {
      // service role key may be missing in dev — fall back to shipping address email
    }

    return { ...order, profiles: profile ?? null, customerEmail };
  }

  return { ...order, profiles: null, customerEmail: null };
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  await logAdminAction({
    action: "update_status",
    resourceType: "order",
    resourceId: orderId,
    details: { newStatus: status },
  });
  return { success: true };
}

export async function updatePaymentStatus(orderId: string, paymentStatus: string) {
  await requireAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ payment_status: paymentStatus })
    .eq("id", orderId);

  if (error) return { error: error.message };
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  await logAdminAction({
    action: "update_payment",
    resourceType: "order",
    resourceId: orderId,
    details: { paymentStatus },
  });
  return { success: true };
}

export async function addOrderNote(orderId: string, note: string) {
  await requireAdmin();
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("notes")
    .eq("id", orderId)
    .single();

  const existingNotes = order?.notes ? `${order.notes}\n---\n` : "";
  const timestamp = new Date().toISOString();
  const newNotes = `${existingNotes}[${timestamp}] ${note}`;

  const { error } = await supabase
    .from("orders")
    .update({ notes: newNotes })
    .eq("id", orderId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function getInvoiceData(orderId: string): Promise<InvoiceData | null> {
  await requireAdmin();
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .single();

  if (orderError || !order) return null;

  const [storeInfo, currency, tax, branding, profileData] = await Promise.all([
    getStoreSetting("store"),
    getStoreSetting("currency"),
    getStoreSetting("tax"),
    getStoreSetting("branding"),
    order.user_id
      ? supabase.from("profiles").select("name, phone").eq("id", order.user_id).single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  let customerEmail: string | null = null;
  if (order.user_id) {
    try {
      const admin = createAdminClient();
      const { data } = await admin.auth.admin.getUserById(order.user_id);
      customerEmail = data?.user?.email ?? null;
    } catch {
      // fall back to shipping_address.email
    }
  }

  const addr = (order.shipping_address ?? {}) as {
    name?: string; email?: string; phone?: string;
    division?: string; city?: string; area?: string; address?: string;
  };

  await logAdminAction({
    action: "print_invoice",
    resourceType: "order",
    resourceId: orderId,
    details: { order_number: order.order_number },
  });

  return {
    order: {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      created_at: order.created_at,
      subtotal: order.subtotal,
      shipping_cost: order.shipping_cost,
      discount: order.discount,
      total: order.total,
      payment_method: order.payment_method,
      payment_status: order.payment_status,
      transaction_id: order.transaction_id,
      coupon_code: order.coupon_code,
      notes: order.notes,
      shipping_address: {
        name: addr.name ?? "",
        email: addr.email,
        phone: addr.phone ?? "",
        division: addr.division ?? "",
        city: addr.city ?? "",
        area: addr.area ?? "",
        address: addr.address ?? "",
      },
    },
    items: order.order_items.map((item: { id: string; product_name: string; quantity: number; unit_price: number; total: number }) => ({
      id: item.id,
      product_name: item.product_name,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total,
    })),
    customer: {
      name: profileData?.data?.name ?? addr.name ?? null,
      email: customerEmail ?? addr.email ?? null,
      phone: profileData?.data?.phone ?? addr.phone ?? null,
      is_guest: !order.user_id,
    },
    store: {
      name: storeInfo?.name ?? "Hobby Bangladesh",
      email: storeInfo?.email ?? null,
      phone: storeInfo?.phone ?? null,
      address: storeInfo?.address ?? null,
      whatsapp_number: storeInfo?.whatsapp_number,
      logo_url: branding?.logo_url ?? null,
      tax_label: tax?.label ?? null,
      tax_rate: tax?.rate ?? 0,
    },
    currency: {
      code: currency?.code ?? "BDT",
      symbol: currency?.symbol ?? "৳",
      position: currency?.position ?? "before",
    },
  };
}
