"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createOrder, validateCoupon } from "./actions";
import { clearGuestCart } from "@/lib/cart";
import { toast } from "sonner";
import {
  IconCreditCard,
  IconBuildingBank,
  IconLoader2,
  IconTag,
  IconX,
  IconCheck,
  IconPhotoOff,
} from "@tabler/icons-react";

const divisions = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

interface CartItem {
  productId: string;
  quantity: number;
  name: string;
  price: number;
  image: string | null;
}

interface AppliedCoupon {
  couponId: string;
  code: string;
  discountType: string;
  discountValue: number;
  discount: number;
}

export function CheckoutForm({
  cartItems,
  shipping,
}: {
  cartItems: CartItem[];
  shipping: {
    inside_dhaka: number;
    outside_dhaka: number;
    free_shipping_min: number;
  } | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("sslcommerz");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shippingCost =
    shipping && subtotal >= shipping.free_shipping_min
      ? 0
      : shipping?.inside_dhaka ?? 60;
  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, subtotal + shippingCost - discount);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);

    const result = await validateCoupon(couponCode, subtotal);
    setCouponLoading(false);

    if (result.error) {
      setCouponError(result.error);
      setAppliedCoupon(null);
      return;
    }

    setAppliedCoupon({
      couponId: result.couponId!,
      code: result.code!,
      discountType: result.discountType!,
      discountValue: result.discountValue!,
      discount: result.discount!,
    });
    toast.success(`Coupon applied! ৳ ${result.discount!.toLocaleString()} off`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("payment_method", paymentMethod);
    formData.set(
      "cart_items",
      JSON.stringify(
        cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      )
    );

    if (appliedCoupon) {
      formData.set("coupon_id", appliedCoupon.couponId);
      formData.set("coupon_code", appliedCoupon.code);
      formData.set("discount_amount", String(appliedCoupon.discount));
    }

    const result = await createOrder(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      toast.error(result.error);
      return;
    }

    clearGuestCart();
    toast.success("Order placed successfully!");
    router.push(`/checkout/success?order=${result.orderNumber}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Contact Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" required placeholder="Your name" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="flex flex-col gap-2 sm:col-span-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  required
                  placeholder="+880XXXXXXXXXX"
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label>Division</Label>
                <Select name="division" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select division" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {divisions.map((d) => (
                        <SelectItem key={d} value={d}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" required placeholder="City" />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  name="area"
                  required
                  placeholder="Area / Thana"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  name="address"
                  required
                  placeholder="House, street, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="flex flex-col gap-2"
              >
                <Label
                  htmlFor="sslcommerz"
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    paymentMethod === "sslcommerz"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value="sslcommerz" id="sslcommerz" />
                  <IconCreditCard className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Online Payment</p>
                    <p className="text-xs text-muted-foreground">
                      Cards, bKash, Nagad, Rocket via SSLCommerz
                    </p>
                  </div>
                </Label>
                <Label
                  htmlFor="cod"
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                    paymentMethod === "cod"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <RadioGroupItem value="cod" id="cod" />
                  <IconBuildingBank className="size-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Cash on Delivery</p>
                    <p className="text-xs text-muted-foreground">
                      Pay when you receive
                    </p>
                  </div>
                </Label>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Order Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                name="notes"
                placeholder="Any special instructions..."
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="text-sm">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {cartItems.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3"
                >
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-muted">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-muted-foreground">
                        <IconPhotoOff className="size-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="text-sm font-medium">
                    ৳ {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <Separator />

              {/* Coupon Input */}
              <div className="flex flex-col gap-2">
                <Label className="text-xs">Coupon Code</Label>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between rounded-md border border-success/30 bg-success/5 px-3 py-2">
                    <div className="flex items-center gap-2">
                      <IconCheck className="size-4 text-success" />
                      <div>
                        <p className="text-sm font-medium text-success">
                          {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-success/70">
                          {appliedCoupon.discountType === "percentage"
                            ? `${appliedCoupon.discountValue}% off`
                            : `৳ ${appliedCoupon.discountValue} off`}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-success hover:text-success/80"
                    >
                      <IconX className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <IconTag className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value.toUpperCase());
                          setCouponError(null);
                        }}
                        className="pl-9 uppercase"
                        disabled={couponLoading}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                    >
                      {couponLoading ? (
                        <IconLoader2 className="size-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                )}
                {couponError && (
                  <p className="text-xs text-destructive">{couponError}</p>
                )}
              </div>

              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {shippingCost === 0 ? "Free" : `৳ ${shippingCost}`}
                </span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-success">
                  <span>Discount ({appliedCoupon?.code})</span>
                  <span>-৳ {discount.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>৳ {total.toLocaleString()}</span>
              </div>
            </CardContent>

            {error && (
              <div className="mx-4 mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="p-4 pt-0">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <IconLoader2 className="mr-2 size-4 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </form>
  );
}
