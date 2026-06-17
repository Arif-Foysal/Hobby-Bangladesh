"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getStoreSetting } from "@/lib/supabase/store";

export async function createOrder(formData: FormData) {
  const supabase = await createClient();

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const division = formData.get("division") as string;
  const city = formData.get("city") as string;
  const area = formData.get("area") as string;
  const address = formData.get("address") as string;
  const paymentMethod = formData.get("payment_method") as string;
  const notes = formData.get("notes") as string;
  const cartItemsJson = formData.get("cart_items") as string;

  if (!cartItemsJson) return { error: "Cart is empty" };

  const cartItems: { productId: string; quantity: number }[] = JSON.parse(cartItemsJson);
  if (cartItems.length === 0) return { error: "Cart is empty" };

  const productIds = cartItems.map((item) => item.productId);
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, stock_qty, is_active")
    .in("id", productIds);

  if (!products) return { error: "Could not fetch products" };

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of cartItems) {
    const product = productMap.get(item.productId);
    if (!product || !product.is_active) {
      return { error: `${product?.name ?? "A product"} is no longer available` };
    }
    if (product.stock_qty < item.quantity) {
      return { error: `Insufficient stock for ${product.name}` };
    }
  }

  const { data: authData } = await supabase.auth.getClaims();
  const userId = authData?.claims?.sub ?? null;

  const shippingConfig = await getStoreSetting("shipping");
  const subtotal = cartItems.reduce((sum, item) => {
    const product = productMap.get(item.productId);
    return sum + (product?.price ?? 0) * item.quantity;
  }, 0);
  const shippingCost =
    shippingConfig && subtotal >= (shippingConfig.free_shipping_min ?? 5000)
      ? 0
      : shippingConfig?.inside_dhaka ?? 60;
  const total = subtotal + shippingCost;

  const orderNumber = `HB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  const shippingAddress = { name, email, phone, division, city, area, address };

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

  const orderItems = cartItems.map((item) => {
    const product = productMap.get(item.productId);
    return {
      order_id: order.id,
      product_id: item.productId,
      product_name: product?.name ?? "Unknown",
      quantity: item.quantity,
      unit_price: product?.price ?? 0,
      total: (product?.price ?? 0) * item.quantity,
    };
  });

  await supabase.from("order_items").insert(orderItems);

  for (const item of cartItems) {
    const product = productMap.get(item.productId);
    if (product) {
      await supabase
        .from("products")
        .update({
          stock_qty: product.stock_qty - item.quantity,
          sold_count: item.quantity,
        })
        .eq("id", item.productId);
    }
  }

  revalidatePath("/cart");
  revalidatePath("/admin/orders");

  return { success: true, orderId: order.id, orderNumber: order.order_number };
}
