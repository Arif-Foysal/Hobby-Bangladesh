"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveShipping } from "./actions";
import { toast } from "sonner";

export function ShippingForm({
  initialData,
}: {
  initialData: {
    inside_dhaka: number;
    outside_dhaka: number;
    free_shipping_min: number;
  };
}) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await saveShipping(formData);
    setSaving(false);
    if (result.success) toast.success("Shipping defaults saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Defaults</CardTitle>
        <CardDescription>
          Fallback delivery charges used when a selected division is not in the
          Locations table. Per-location charges are managed under
          {" "}<strong>Locations</strong> in the sidebar. The free-shipping
          threshold applies globally.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="inside_dhaka">Inside Dhaka (৳)</Label>
              <Input
                id="inside_dhaka"
                name="inside_dhaka"
                type="number"
                min="0"
                step="1"
                defaultValue={initialData.inside_dhaka}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="outside_dhaka">Outside Dhaka (৳)</Label>
              <Input
                id="outside_dhaka"
                name="outside_dhaka"
                type="number"
                min="0"
                step="1"
                defaultValue={initialData.outside_dhaka}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="free_shipping_min">
                Free Shipping Min (৳)
              </Label>
              <Input
                id="free_shipping_min"
                name="free_shipping_min"
                type="number"
                min="0"
                step="1"
                defaultValue={initialData.free_shipping_min}
                required
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Orders with subtotal ≥ this threshold ship free regardless of
            location.
          </p>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Defaults"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}