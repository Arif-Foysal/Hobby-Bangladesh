"use client";

import { useOptimistic, useTransition, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateCartQuantity, removeFromCart } from "@/app/cart/actions";
import {
  updateGuestCartQuantity,
  removeFromGuestCart,
  getGuestCart,
} from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import {
  IconMinus,
  IconPlus,
  IconTrash,
  IconShoppingBag,
  IconPhotoOff,
} from "@tabler/icons-react";
import type { StoreShipping as ShippingSettings } from "@/lib/database/types";

interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { url: string }[];
  stock_qty: number;
}

interface CartItem {
  id: string;
  quantity: number;
  products: CartProduct | null;
}

type OptimisticAction =
  | { type: "update"; id: string; quantity: number }
  | { type: "remove"; id: string }
  | { type: "set"; items: CartItem[] };

function optimisticReducer(
  state: CartItem[],
  action: OptimisticAction
): CartItem[] {
  switch (action.type) {
    case "update":
      return state.map((item) =>
        item.id === action.id ? { ...item, quantity: action.quantity } : item
      );
    case "remove":
      return state.filter((item) => item.id !== action.id);
    case "set":
      return action.items;
  }
}

interface DisplayItem {
  key: string;
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: { url: string } | null;
  quantity: number;
  stockQty: number;
}

export function CartPageContent({
  initialItems,
  isGuest,
  shipping,
}: {
  initialItems: CartItem[];
  isGuest: boolean;
  shipping: ShippingSettings | null;
}) {
  const [optimisticItems, dispatchOptimistic] = useOptimistic(
    initialItems,
    optimisticReducer
  );
  const [isPending, startTransition] = useTransition();

  // Guest state
  const [guestItems, setGuestItems] = useState<CartItem[]>([]);
  const [guestLoaded, setGuestLoaded] = useState(false);

  useEffect(() => {
    if (!isGuest) return;

    const loadGuestCart = async () => {
      const guestCart = getGuestCart();
      if (guestCart.length === 0) {
        setGuestLoaded(true);
        return;
      }

      const supabase = createClient();
      const ids = guestCart.map((i) => i.productId);
      const { data: products } = await supabase
        .from("products")
        .select("id, name, slug, price, images, stock_qty")
        .in("id", ids);

      const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);
      setGuestItems(
        guestCart.map((i) => ({
          id: i.productId,
          quantity: i.quantity,
          products: (productMap.get(i.productId) as CartProduct) ?? null,
        }))
      );
      setGuestLoaded(true);
    };

    loadGuestCart();
  }, [isGuest]);

  const refreshGuestCart = async () => {
    const guestCart = getGuestCart();
    if (guestCart.length === 0) {
      setGuestItems([]);
      return;
    }
    const supabase = createClient();
    const ids = guestCart.map((i) => i.productId);
    const { data: products } = await supabase
      .from("products")
      .select("id, name, slug, price, images, stock_qty")
      .in("id", ids);

    const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);
    setGuestItems(
      guestCart.map((i) => ({
        id: i.productId,
        quantity: i.quantity,
        products: (productMap.get(i.productId) as CartProduct) ?? null,
      }))
    );
  };

  // Logged-in handlers
  const handleUpdate = (itemId: string, newQty: number) => {
    startTransition(async () => {
      dispatchOptimistic({ type: "update", id: itemId, quantity: newQty });
      await updateCartQuantity(itemId, newQty);
    });
  };

  const handleRemove = (itemId: string) => {
    startTransition(async () => {
      dispatchOptimistic({ type: "remove", id: itemId });
      await removeFromCart(itemId);
    });
  };

  // Guest handlers
  const handleGuestUpdate = (productId: string, newQty: number) => {
    updateGuestCartQuantity(productId, newQty);
    refreshGuestCart();
  };

  const handleGuestRemove = (productId: string) => {
    removeFromGuestCart(productId);
    refreshGuestCart();
  };

  const sourceItems = isGuest ? guestItems : optimisticItems;
  const items: DisplayItem[] = sourceItems.map((item) => ({
    key: item.id,
    id: item.id,
    productId: item.products?.id ?? item.id,
    name: item.products?.name ?? "",
    slug: item.products?.slug ?? "#",
    price: item.products?.price ?? 0,
    image:
      Array.isArray(item.products?.images) &&
      item.products!.images.length > 0
        ? item.products!.images[0]
        : null,
    quantity: item.quantity,
    stockQty: item.products?.stock_qty ?? 0,
  }));

  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const freeShippingMin = shipping?.free_shipping_min ?? 5000;
  const defaultShipping = shipping?.inside_dhaka ?? 60;
  const shippingCost = subtotal >= freeShippingMin ? 0 : defaultShipping;
  const total = subtotal + shippingCost;

  if (isGuest && !guestLoaded) {
    return (
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        </div>
        <div className="h-64 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <IconShoppingBag className="size-16 text-muted-foreground" />
        <h2 className="font-display text-3xl font-bold">Your cart is empty</h2>
        <p className="text-muted-foreground">
          Browse our products and add something to your cart.
        </p>
        <Button asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    );
  }

  return (
    <>
      <p className="mt-2 text-muted-foreground">
        {items.length} item{items.length !== 1 ? "s" : ""} in your cart
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <Card
                key={item.key}
                className={isPending ? "opacity-70 transition-opacity" : ""}
              >
                <CardContent className="flex gap-4 p-4">
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image?.url ? (
                      <Image
                        src={item.image.url}
                        alt={item.name}
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <IconPhotoOff className="size-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <Link
                        href={`/products/${item.slug}`}
                        className="font-medium hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="text-sm text-muted-foreground">
                        ৳ {item.price.toLocaleString()} each
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-10"
                          onClick={() =>
                            isGuest
                              ? handleGuestUpdate(
                                  item.productId,
                                  item.quantity - 1
                                )
                              : handleUpdate(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || isPending}
                        >
                          <IconMinus className="size-4" />
                        </Button>
                        <span className="w-10 text-center text-base font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="size-10"
                          onClick={() =>
                            isGuest
                              ? handleGuestUpdate(
                                  item.productId,
                                  item.quantity + 1
                                )
                              : handleUpdate(item.id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= item.stockQty || isPending
                          }
                        >
                          <IconPlus className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="ml-2 size-10 text-muted-foreground"
                          onClick={() =>
                            isGuest
                              ? handleGuestRemove(item.productId)
                              : handleRemove(item.id)
                          }
                          disabled={isPending}
                        >
                          <IconTrash className="size-4" />
                        </Button>
                      </div>
                      <span className="font-semibold text-primary">
                        ৳ {(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shippingCost === 0 ? "Free" : `৳ ${shippingCost}`}
                  {shippingCost > 0 && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      (inside Dhaka)
                    </span>
                  )}
                </span>
              </div>
              {shippingCost > 0 && (
                <p className="text-xs text-muted-foreground">
                  Final charge calculated at checkout based on your location.
                  Free shipping on orders over ৳ {freeShippingMin.toLocaleString()}.
                </p>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span className="text-primary">৳ {total.toLocaleString()}</span>
              </div>
              <Button asChild size="lg" className="mt-2 w-full">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
