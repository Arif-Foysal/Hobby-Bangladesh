"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createCoupon, updateCoupon } from "./actions";
import { toast } from "sonner";
import type { Coupon } from "@/lib/database/types";

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [discountType, setDiscountType] = useState<string>(coupon?.discount_type ?? "percentage");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = coupon
      ? await updateCoupon(coupon.id, formData)
      : await createCoupon(formData);

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success(coupon ? "Coupon updated" : "Coupon created");
    router.push("/admin/coupons");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {coupon ? "Edit Coupon" : "New Coupon"}
          </h2>
          <p className="text-muted-foreground">
            {coupon ? "Update coupon details." : "Create a discount coupon."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/coupons")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Saving..." : coupon ? "Update Coupon" : "Create Coupon"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="mx-4 mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive lg:mx-6">
          {error}
        </div>
      )}

      <div className="mt-6 grid gap-6 px-4 lg:grid-cols-2 lg:px-6">
        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">Coupon Details</h3>
            <p className="text-xs text-muted-foreground">
              Code, description, and discount settings.
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="code">Coupon Code</Label>
            <Input
              id="code"
              name="code"
              placeholder="e.g. SUMMER20"
              defaultValue={coupon?.code ?? ""}
              required
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">
              Customers enter this code at checkout.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="e.g. 20% off summer collection"
              rows={2}
              defaultValue={coupon?.description ?? ""}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label>Discount Type</Label>
              <Select
                name="discount_type"
                value={discountType}
                onValueChange={setDiscountType}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (৳)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="discount_value">
                Discount Value {discountType === "percentage" ? "(%)" : "(৳)"}
              </Label>
              <Input
                id="discount_value"
                name="discount_value"
                type="number"
                step="0.01"
                min="0"
                max={discountType === "percentage" ? "100" : undefined}
                placeholder={discountType === "percentage" ? "20" : "500"}
                defaultValue={coupon?.discount_value ?? ""}
                required
              />
            </div>
          </div>
          {discountType === "percentage" && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="max_discount_amount">Max Discount Amount (৳)</Label>
              <Input
                id="max_discount_amount"
                name="max_discount_amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 1000"
                defaultValue={coupon?.max_discount_amount ?? ""}
              />
              <p className="text-xs text-muted-foreground">
                Cap the maximum discount for percentage coupons. Leave empty for no limit.
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">Restrictions</h3>
            <p className="text-xs text-muted-foreground">
              Usage limits, order minimums, and validity.
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="min_order_amount">Minimum Order Amount (৳)</Label>
            <Input
              id="min_order_amount"
              name="min_order_amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0"
              defaultValue={coupon?.min_order_amount ?? 0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="usage_limit">Usage Limit</Label>
            <Input
              id="usage_limit"
              name="usage_limit"
              type="number"
              min="1"
              placeholder="Unlimited"
              defaultValue={coupon?.usage_limit ?? ""}
            />
            <p className="text-xs text-muted-foreground">
              Max number of times this coupon can be used. Leave empty for unlimited.
            </p>
          </div>
          {coupon && (
            <div className="rounded-lg border p-3 text-sm">
              <p className="text-muted-foreground">
                Used <span className="font-medium text-foreground">{coupon.used_count}</span> time{coupon.used_count !== 1 ? "s" : ""}
                {coupon.usage_limit && (
                  <> of <span className="font-medium text-foreground">{coupon.usage_limit}</span></>
                )}
              </p>
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="starts_at">Start Date</Label>
              <Input
                id="starts_at"
                name="starts_at"
                type="datetime-local"
                defaultValue={
                  coupon?.starts_at
                    ? new Date(coupon.starts_at).toISOString().slice(0, 16)
                    : ""
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="expires_at">Expiry Date</Label>
              <Input
                id="expires_at"
                name="expires_at"
                type="datetime-local"
                defaultValue={
                  coupon?.expires_at
                    ? new Date(coupon.expires_at).toISOString().slice(0, 16)
                    : ""
                }
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
              <p className="text-xs text-muted-foreground">
                Coupon can be used at checkout
              </p>
            </div>
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={coupon?.is_active ?? true}
            />
          </div>
        </div>
      </div>
    </form>
  );
}
