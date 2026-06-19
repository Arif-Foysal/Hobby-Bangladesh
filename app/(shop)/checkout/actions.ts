"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getStoreSetting } from "@/lib/supabase/store";

export async function validateCoupon(code: string, subtotal: number) {
  const supabase = await createClient();

  const { data: coupon } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase().trim())
    .eq("is_active", true)
    .single();

  if (!coupon) {
    return { error: "Invalid coupon code" };
  }

  if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
    return { error: "This coupon is not yet active" };
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { error: "This coupon has expired" };
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    return { error: "This coupon has reached its usage limit" };
  }

  if (subtotal < coupon.min_order_amount) {
    return {
      error: `Minimum order amount is ৳ ${coupon.min_order_amount.toLocaleString()}`,
    };
  }

  let discount: number;
  if (coupon.discount_type === "percentage") {
    discount = (subtotal * coupon.discount_value) / 100;
    if (coupon.max_discount_amount) {
      discount = Math.min(discount, coupon.max_discount_amount);
    }
  } else {
    discount = coupon.discount_value;
  }

  discount = Math.min(discount, subtotal);
  discount = Math.round(discount * 100) / 100;

  return {
    success: true,
    couponId: coupon.id,
    code: coupon.code,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
    discount,
  };
}

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
  const couponId = formData.get("coupon_id") as string | null;
  const couponCode = formData.get("coupon_code") as string | null;
  const discountAmount = parseFloat(formData.get("discount_amount") as string) || 0;

  if (!cartItemsJson) return { error: "Cart is empty" };

  const cartItems: { productId: string; quantity: number }[] = JSON.parse(cartItemsJson);
  if (cartItems.length === 0) return { error: "Cart is empty" };

  const productIds = cartItems.map((item) => item.productId);
  const { data: products } = await supabase
    .from("products")
    .select("id, name, price, stock_qty, sold_count, is_active")
    .in("id", productIds);

  if (!products) return { error: "Could not fetch products" };

  const productMap = new Map(products.map((p) => [p.id, p]));

  for (const item of cartItems) {
    const product = productMap.get(item.productId);
    if (!product || !product.is_active) {
      return { error: `${product?.name ?? "A product"} is no longer available` };
    }
    if (product.stock_qty < item.quantity) {
      return { error: `Insufficient stock for ${product.name}. Only ${product.stock_qty} left.` };
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

  let finalDiscount = 0;
  if (couponId && couponCode && discountAmount > 0) {
    const { data: coupon } = await supabase
      .from("coupons")
      .select("id, is_active, expires_at, usage_limit, used_count")
      .eq("id", couponId)
      .single();

    if (
      coupon &&
      coupon.is_active &&
      (!coupon.expires_at || new Date(coupon.expires_at) > new Date()) &&
      (!coupon.usage_limit || coupon.used_count < coupon.usage_limit)
    ) {
      finalDiscount = Math.min(discountAmount, subtotal);
    }
  }

  const total = Math.max(0, subtotal + shippingCost - finalDiscount);

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
      discount: finalDiscount,
      total,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      payment_status: "unpaid",
      coupon_id: finalDiscount > 0 ? couponId : null,
      coupon_code: finalDiscount > 0 ? couponCode : null,
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
          sold_count: product.sold_count + item.quantity,
        })
        .eq("id", item.productId);
    }
  }

  if (finalDiscount > 0 && couponId) {
    await supabase.rpc("increment_coupon_usage", { coupon_id: couponId }).then(
      () => {},
      async () => {
        const { data: c } = await supabase
          .from("coupons")
          .select("used_count")
          .eq("id", couponId)
          .single();
        if (c) {
          await supabase
            .from("coupons")
            .update({ used_count: c.used_count + 1 })
            .eq("id", couponId);
        }
      }
    );
  }

  const { data: authUser } = await supabase.auth.getClaims();
  if (authUser?.claims?.sub) {
    await supabase.from("carts").delete().eq("user_id", authUser.claims.sub);
  }

  revalidatePath("/cart");
  revalidatePath("/admin/orders");
  revalidatePath("/admin/coupons");

  return { success: true, orderId: order.id, orderNumber: order.order_number };
}
