"use client";

export interface GuestCartItem {
  productId: string;
  quantity: number;
}

const CART_KEY = "hobby-bangladesh-cart";

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function setGuestCart(items: GuestCartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart-updated"));
}

export function addToGuestCart(productId: string, quantity: number = 1) {
  const cart = getGuestCart();
  const existing = cart.find((item) => item.productId === productId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }

  setGuestCart(cart);
}

export function updateGuestCartQuantity(productId: string, quantity: number) {
  if (quantity <= 0) {
    removeFromGuestCart(productId);
    return;
  }

  const cart = getGuestCart();
  const item = cart.find((item) => item.productId === productId);
  if (item) {
    item.quantity = quantity;
    setGuestCart(cart);
  }
}

export function removeFromGuestCart(productId: string) {
  const cart = getGuestCart().filter((item) => item.productId !== productId);
  setGuestCart(cart);
}

export function clearGuestCart() {
  setGuestCart([]);
}

export function getGuestCartCount(): number {
  return getGuestCart().reduce((sum, item) => sum + item.quantity, 0);
}
