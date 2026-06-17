"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { createOrder } from "./actions";
import { IconCreditCard, IconBuildingBank } from "@tabler/icons-react";

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

export function CheckoutForm({
  cart,
  addresses,
  shipping,
}: {
  cart: {
    id: string;
    quantity: number;
    products: {
      id: string;
      name: string;
      price: number;
      images: { url: string }[];
    } | null;
  }[];
  addresses: {
    id: string;
    name: string;
    phone: string;
    division: string;
    city: string;
    area: string;
    address: string;
    is_default: boolean;
  }[];
  shipping: { inside_dhaka: number; outside_dhaka: number; free_shipping_min: number } | null;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string>("new");
  const [paymentMethod, setPaymentMethod] = useState<string>("sslcommerz");

  const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];

  const subtotal = cart.reduce(
    (sum, item) => sum + (item.products?.price ?? 0) * item.quantity,
    0
  );
  const shippingCost =
    shipping && subtotal >= shipping.free_shipping_min ? 0 : shipping?.inside_dhaka ?? 60;
  const total = subtotal + shippingCost;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (selectedAddress !== "new" && defaultAddr) {
      formData.set("name", defaultAddr.name);
      formData.set("phone", defaultAddr.phone);
      formData.set("division", defaultAddr.division);
      formData.set("city", defaultAddr.city);
      formData.set("area", defaultAddr.area);
      formData.set("address", defaultAddr.address);
    }
    formData.set("payment_method", paymentMethod);

    const result = await createOrder(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/checkout/success?order=${result.orderNumber}`);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-sm font-medium">Shipping Address</h3>
            {addresses.length > 0 && (
              <div className="mb-4 flex flex-col gap-2">
                {defaultAddr && (
                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                      selectedAddress === "saved"
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="address_choice"
                      value="saved"
                      checked={selectedAddress === "saved"}
                      onChange={() => setSelectedAddress("saved")}
                      className="mt-1"
                    />
                    <div className="text-sm">
                      <p className="font-medium">{defaultAddr.name}</p>
                      <p className="text-muted-foreground">
                        {defaultAddr.address}, {defaultAddr.area}, {defaultAddr.city},{" "}
                        {defaultAddr.division}
                      </p>
                      <p className="text-muted-foreground">{defaultAddr.phone}</p>
                      {defaultAddr.is_default && (
                        <Badge variant="secondary" className="mt-1">Default</Badge>
                      )}
                    </div>
                  </label>
                )}
                <label
                  className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                    selectedAddress === "new"
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="address_choice"
                    value="new"
                    checked={selectedAddress === "new"}
                    onChange={() => setSelectedAddress("new")}
                    className="mt-1"
                  />
                  <span className="text-sm font-medium">Use a new address</span>
                </label>
              </div>
            )}

            {selectedAddress === "new" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" name="phone" required placeholder="+880..." />
                </div>
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
                  <Input id="city" name="city" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="area">Area</Label>
                  <Input id="area" name="area" required />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="address">Address</Label>
                  <Input id="address" name="address" required placeholder="House, street, etc." />
                </div>
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Switch id="save_address" name="save_address" />
                  <Label htmlFor="save_address" className="cursor-pointer text-sm">
                    Save this address for future orders
                  </Label>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-sm font-medium">Payment Method</h3>
            <div className="flex flex-col gap-2">
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  paymentMethod === "sslcommerz"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method_choice"
                  value="sslcommerz"
                  checked={paymentMethod === "sslcommerz"}
                  onChange={() => setPaymentMethod("sslcommerz")}
                />
                <IconCreditCard className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Online Payment</p>
                  <p className="text-xs text-muted-foreground">
                    Cards, bKash, Nagad, Rocket via SSLCommerz
                  </p>
                </div>
              </label>
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                  paymentMethod === "cod"
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method_choice"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <IconBuildingBank className="size-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Cash on Delivery</p>
                  <p className="text-xs text-muted-foreground">Pay when you receive</p>
                </div>
              </label>
            </div>
          </div>

          <div className="rounded-lg border p-4">
            <h3 className="mb-4 text-sm font-medium">Order Notes (Optional)</h3>
            <Textarea name="notes" placeholder="Any special instructions..." rows={3} />
          </div>
        </div>

        <div>
          <div className="sticky top-4 rounded-lg border p-4">
            <h3 className="mb-4 text-sm font-medium">Order Summary</h3>
            <div className="flex flex-col gap-3">
              {cart.map((item) => {
                const product = item.products;
                if (!product) return null;
                return (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {product.name} x{item.quantity}
                    </span>
                    <span>৳ {(product.price * item.quantity).toLocaleString()}</span>
                  </div>
                );
              })}
              <Separator />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>৳ {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `৳ ${shippingCost}`}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>৳ {total.toLocaleString()}</span>
              </div>
            </div>

            {error && (
              <p className="mt-3 rounded-md bg-destructive/10 p-2 text-xs text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" className="mt-4 w-full" disabled={loading}>
              {loading ? "Placing Order..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
