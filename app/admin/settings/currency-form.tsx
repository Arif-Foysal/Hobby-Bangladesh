"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { saveCurrency } from "./actions";
import { toast } from "sonner";

export function CurrencyForm({
  initialData,
}: {
  initialData: { code: string; symbol: string; position: string };
}) {
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    const result = await saveCurrency(formData);
    setSaving(false);
    if (result.success) toast.success("Currency settings saved");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Currency</CardTitle>
        <CardDescription>
          Set the currency displayed on product prices.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">Currency Code</Label>
              <Input
                id="code"
                name="code"
                defaultValue={initialData.code}
                placeholder="BDT"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Input
                id="symbol"
                name="symbol"
                defaultValue={initialData.symbol}
                placeholder="৳"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Position</Label>
              <Select name="position" defaultValue={initialData.position}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="before">Before price</SelectItem>
                  <SelectItem value="after">After price</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
