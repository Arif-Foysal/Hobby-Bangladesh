import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getCart } from "@/app/cart/actions";
import { CartItemControls } from "./controls";
import { IconShoppingBag } from "@tabler/icons-react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Cart | Hobby Bangladesh",
};

export default async function CartPage() {
  const supabase = await createClient();
  const { data: authData } = await supabase.auth.getClaims();
  if (!authData?.claims) redirect("/auth/login");

  const items = await getCart();

  const subtotal = items.reduce((sum, item) => {
    const product = item.products;
    if (!product) return sum;
    return sum + product.price * item.quantity;
  }, 0);

  const shipping = subtotal >= 5000 ? 0 : 60;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <IconShoppingBag className="size-12 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
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
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
      <p className="text-muted-foreground">{items.length} item(s) in your cart</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-4">
            {items.map((item) => {
              const product = item.products;
              if (!product) return null;
              const image =
                Array.isArray(product.images) && product.images.length > 0
                  ? product.images[0]
                  : null;

              return (
                <Card key={item.id}>
                  <CardContent className="flex gap-4 p-4">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-md bg-muted">
                      {image?.url ? (
                        <Image
                          src={image.url}
                          alt={product.name}
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
                          href={`/products/${product.slug}`}
                          className="font-medium hover:underline"
                        >
                          {product.name}
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          ৳ {product.price.toLocaleString()} each
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <CartItemControls
                          cartItemId={item.id}
                          quantity={item.quantity}
                        />
                        <span className="font-semibold">
                          ৳ {(product.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
    </div>
  );
}
