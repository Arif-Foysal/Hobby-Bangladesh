"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCart } from "@/app/cart/actions";
import { getGuestCart } from "@/lib/cart";
import { createClient } from "@/lib/supabase/client";
import { CartItemControls } from "./controls";
import { GuestCartItemControls } from "./guest-controls";
import { IconShoppingBag } from "@tabler/icons-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: { url: string }[];
}

export function CartPageContent() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [dbItems, setDbItems] = useState<{
    id: string;
    quantity: number;
    products: Product | null;
  }[]>([]);
  const [guestProducts, setGuestProducts] = useState<{
    productId: string;
    quantity: number;
    product: Product | null;
  }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getClaims().then(async ({ data }) => {
      const loggedIn = !!data?.claims;
      setIsLoggedIn(loggedIn);

      if (loggedIn) {
        const items = await getCart();
        setDbItems(items as unknown as typeof dbItems);
      } else {
        const guestCart = getGuestCart();
        if (guestCart.length > 0) {
          const supabase = createClient();
          const ids = guestCart.map((item) => item.productId);
          const { data: products } = await supabase
            .from("products")
            .select("id, name, slug, price, images")
            .in("id", ids);

          const productMap = new Map(products?.map((p) => [p.id, p]) ?? []);
          setGuestProducts(
            guestCart.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              product: productMap.get(item.productId) ?? null,
            }))
          );
        }
      }
      setLoading(false);
    });
  }, []);

  const items = isLoggedIn
    ? dbItems.map((item) => ({
        key: item.id,
        id: item.id,
        productId: item.products?.id ?? "",
        name: item.products?.name ?? "",
        slug: item.products?.slug ?? "#",
        price: item.products?.price ?? 0,
        image:
          Array.isArray(item.products?.images) && item.products!.images.length > 0
            ? item.products!.images[0]
            : null,
        quantity: item.quantity,
      }))
    : guestProducts.map((item) => ({
        key: item.productId,
        id: item.productId,
        productId: item.productId,
        name: item.product?.name ?? "",
        slug: item.product?.slug ?? "#",
        price: item.product?.price ?? 0,
        image:
          Array.isArray(item.product?.images) && item.product!.images.length > 0
            ? item.product!.images[0]
            : null,
        quantity: item.quantity,
      }));

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = subtotal >= 5000 ? 0 : 60;
  const total = subtotal + shipping;

  if (loading) {
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
        <IconShoppingBag className="size-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
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
      <p className="mt-2 text-muted-foreground">{items.length} item(s) in your cart</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {items.map((item) => (
              <Card key={item.key}>
                <CardContent className="flex gap-4 p-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image?.url ? (
                      <Image
                        src={item.image.url}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
                        N/A
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
                      {isLoggedIn ? (
                        <CartItemControls
                          cartItemId={item.id}
                          quantity={item.quantity}
                        />
                      ) : (
                        <GuestCartItemControls
                          productId={item.productId}
                          quantity={item.quantity}
                          onUpdate={() => {
                            const guestCart = getGuestCart();
                            const supabase = createClient();
                            supabase.auth.getClaims().then(async ({ data }) => {
                              if (data?.claims) {
                                setIsLoggedIn(true);
                                const items = await getCart();
                                setDbItems(items as unknown as typeof dbItems);
                              } else {
                                const ids = guestCart.map((i) => i.productId);
                                const { data: products } = await supabase
                                  .from("products")
                                  .select("id, name, slug, price, images")
                                  .in("id", ids);
                                const productMap = new Map(
                                  products?.map((p) => [p.id, p]) ?? []
                                );
                                setGuestProducts(
                                  guestCart.map((i) => ({
                                    productId: i.productId,
                                    quantity: i.quantity,
                                    product: productMap.get(i.productId) ?? null,
                                  }))
                                );
                              }
                            });
                          }}
                        />
                      )}
                      <span className="font-semibold">
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
            <CardContent className="flex flex-col gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shipping === 0 ? "Free" : `৳ ${shipping}`}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-muted-foreground">
                  Free shipping on orders over ৳ 5,000
                </p>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>৳ {total.toLocaleString()}</span>
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
