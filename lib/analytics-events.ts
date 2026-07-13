/**
 * Client-side analytics event tracking helpers.
 * Conditionally calls gtag (GA4) and fbq (Meta Pixel) if available.
 * Designed to silently no-op if scripts are not loaded.
 */

interface ItemParams {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  category?: string | null;
}

/** Fire a generic custom event to both GA4 and Meta Pixel */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", name, params);
    }
  } catch {
    // silently fail — analytics should never break the app
  }
  try {
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("track", name, params);
    }
  } catch {
    // silently fail
  }
}

/** Track when a user views a product detail page */
export function trackViewItem(product: {
  id: string;
  name: string;
  price?: number;
  category?: string | null;
}) {
  trackEvent("view_item", {
    currency: "BDT",
    value: product.price,
    items: [
      {
        item_id: product.id,
        item_name: product.name,
        price: product.price,
        item_category: product.category,
      },
    ],
  });
  // Meta Pixel uses 'ViewContent' for product views
  try {
    window.fbq?.("track", "ViewContent", {
      content_ids: [product.id],
      content_name: product.name,
      content_type: "product",
      value: product.price,
      currency: "BDT",
    });
  } catch {
    // silently fail
  }
}

/** Track when a user adds a product to cart */
export function trackAddToCart(item: ItemParams) {
  const value = (item.price ?? 0) * (item.quantity ?? 1);
  trackEvent("add_to_cart", {
    currency: "BDT",
    value,
    items: [
      {
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity ?? 1,
        item_category: item.category,
      },
    ],
  });
  // Meta uses 'AddToCart' standard event
  try {
    window.fbq?.("track", "AddToCart", {
      content_ids: [item.id],
      content_name: item.name,
      content_type: "product",
      value,
      currency: "BDT",
    });
  } catch {
    // silently fail
  }
}

/** Track when a user starts the checkout flow */
export function trackBeginCheckout(items: ItemParams[], value: number) {
  trackEvent("begin_checkout", {
    currency: "BDT",
    value,
    items: items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity ?? 1,
    })),
  });
  try {
    window.fbq?.("track", "InitiateCheckout", {
      value,
      currency: "BDT",
      contents: items.map((item) => ({
        id: item.id,
        quantity: item.quantity ?? 1,
        item_price: item.price ?? 0,
      })),
      num_items: items.length,
    });
  } catch {
    // silently fail
  }
}

/** Track when an order is successfully placed */
export function trackPurchase(order: {
  id: string;
  value: number;
  items: ItemParams[];
}) {
  trackEvent("purchase", {
    transaction_id: order.id,
    currency: "BDT",
    value: order.value,
    items: order.items.map((item) => ({
      item_id: item.id,
      item_name: item.name,
      price: item.price,
      quantity: item.quantity ?? 1,
    })),
  });
  // Meta uses 'Purchase' standard event
  try {
    window.fbq?.("track", "Purchase", {
      value: order.value,
      currency: "BDT",
      contents: order.items.map((item) => ({
        id: item.id,
        quantity: item.quantity ?? 1,
        item_price: item.price ?? 0,
      })),
      content_type: "product",
    });
  } catch {
    // silently fail
  }
}