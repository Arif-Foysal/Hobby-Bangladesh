"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { clearCart } from "@/app/cart/actions";
import { getStoreSetting } from "@/lib/supabase/store";

export async function getCheckoutData() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) return { error: "Not authenticated" };

  const userId = authData.claims.sub;

  const [cartResult, addressesResult, profileResult, shippingResult] =
    await Promise.all([
      supabase
        .from("carts")
        .select("*, products(id, name, slug, price, images, stock_qty, is_active)")
        .eq("user_id", userId),
      supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId)
        .order("is_default", { ascending: false }),
      supabase.from("profiles").select("*").eq("id", userId).single(),
      getStoreSetting("shipping"),
    ]);

  return {
    cart: cartResult.data || [],
    addresses: addressesResult.data || [],
    profile: profileResult.data,
    shipping: shippingResult,
  };
}

export async function createOrder(formData: FormData) {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) return { error: "Not authenticated" };

  const userId = authData.claims.sub;

  const cart = await supabase
    .from("carts")
    .select("*, products(id, name, price, stock_qty, is_active)")
    .eq("user_id", userId);

  if (!cart.data || cart.data.length === 0) {
    return { error: "Cart is empty" };
  }

  for (const item of cart.data) {
    const product = item.products;
    if (!product || !product.is_active) {
      return { error: `${product?.name ?? "A product"} is no longer available` };
    }
    if (product.stock_qty < item.quantity) {
      return { error: `Insufficient stock for ${product.name}` };
    }
  }

  const name = formData.get("name") as string;
  const phone = formData.get("phone") as string;
  const division = formData.get("division") as string;
  const city = formData.get("city") as string;
  const area = formData.get("area") as string;
  const address = formData.get("address") as string;
  const paymentMethod = formData.get("payment_method") as string;
  const notes = formData.get("notes") as string;
  const saveAddress = formData.get("save_address") === "on";

  const shippingConfig = await getStoreSetting("shipping");
  const subtotal = cart.data.reduce(
    (sum, item) => sum + (item.products?.price ?? 0) * item.quantity,
    0
  );
  const shippingCost =
    shippingConfig && subtotal >= (shippingConfig.free_shipping_min ?? 5000)
      ? 0
      : shippingConfig?.inside_dhaka ?? 60;
  const total = subtotal + shippingCost;

  const orderNumber = `HB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const shippingAddress = { name, phone, division, city, area, address };

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      order_number: orderNumber,
      status: "pending",
      subtotal,
      shipping_cost: shippingCost,
      discount: 0,
      total,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      payment_status: "unpaid",
      notes: notes || null,
    })
    .select("id, order_number")
    .single();

  if (orderError) return { error: orderError.message };

  const orderItems = cart.data.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name: item.products?.name ?? "Unknown",
    quantity: item.quantity,
    unit_price: item.products?.price ?? 0,
    total: (item.products?.price ?? 0) * item.quantity,
  }));

  await supabase.from("order_items").insert(orderItems);

  for (const item of cart.data) {
    await supabase
      .from("products")
      .update({
        stock_qty: (item.products?.stock_qty ?? 0) - item.quantity,
        sold_count: item.quantity,
      })
      .eq("id", item.product_id);
  }

  await clearCart();

  if (saveAddress) {
    await supabase.from("addresses").upsert(
      {
        user_id: userId,
        label: "Home",
        name,
        phone,
        division,
        city,
        area,
        address,
        is_default: true,
      },
      { onConflict: "user_id,label" }
    );
  }

  revalidatePath("/cart");
  revalidatePath("/admin/orders");

  return { success: true, orderId: order.id, orderNumber: order.order_number };
}
