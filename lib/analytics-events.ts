/**
 * Client-side analytics event tracking via Google Tag Manager dataLayer.
 * Pushes events to window.dataLayer — GTM then forwards to GA4, Meta Pixel, etc.
 * based on triggers configured in the GTM dashboard.
 * Silently no-ops if dataLayer is not initialized.
 */

interface ItemParams {
  id: string;
  name: string;
  price?: number;
  quantity?: number;
  category?: string | null;
}

function pushToDataLayer(payload: Record<string, unknown>) {
  try {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(payload);
    }
  } catch {
    // silently fail — analytics should never break the app
  }
}

/** Fire a generic event to dataLayer */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  pushToDataLayer({ event: name, ...params });
}

/** Track when a user views a product detail page */
export function trackViewItem(product: {
  id: string;
  name: string;
  price?: number;
  category?: string | null;
}) {
  pushToDataLayer({
    event: "view_item",
    ecommerce: {
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
    },
  });
}

/** Track when a user adds a product to cart */
export function trackAddToCart(item: ItemParams) {
  const value = (item.price ?? 0) * (item.quantity ?? 1);
  pushToDataLayer({
    event: "add_to_cart",
    ecommerce: {
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
    },
  });
}

/** Track when a user starts the checkout flow */
export function trackBeginCheckout(items: ItemParams[], value: number) {
  pushToDataLayer({
    event: "begin_checkout",
    ecommerce: {
      currency: "BDT",
      value,
      items: items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity ?? 1,
      })),
    },
  });
}

/** Track when an order is successfully placed */
export function trackPurchase(order: {
  id: string;
  value: number;
  items: ItemParams[];
}) {
  pushToDataLayer({
    event: "purchase",
    ecommerce: {
      transaction_id: order.id,
      currency: "BDT",
      value: order.value,
      items: order.items.map((item) => ({
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        quantity: item.quantity ?? 1,
      })),
    },
  });
}