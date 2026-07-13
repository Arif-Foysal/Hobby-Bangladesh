"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveAnalytics } from "./actions";
import { toast } from "sonner";

export function AnalyticsForm({
  initialData,
}: {
  initialData: {
    enabled?: boolean;
    google_analytics_id?: string;
    meta_pixel_id?: string;
    google_ads_id?: string;
  };
}) {
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(initialData.enabled ?? false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData(e.currentTarget);
    if (enabled) formData.set("enabled", "on");
    const result = await saveAnalytics(formData);
    setSaving(false);
    if (result.success) toast.success("Tracking settings saved");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Analytics &amp; Tracking</CardTitle>
            <CardDescription>
              Connect Google Analytics 4 and Meta Pixel to track visitors and
              conversions on your shop.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="enabled" className="text-sm text-muted-foreground">
              {enabled ? "Enabled" : "Disabled"}
            </Label>
            <Switch
              id="enabled"
              name="enabled"
              checked={enabled}
              onCheckedChange={setEnabled}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="google_analytics_id">Google Analytics 4 ID</Label>
              {initialData.google_analytics_id ? (
                <Badge variant="secondary">Connected</Badge>
              ) : (
                <Badge variant="outline">Not configured</Badge>
              )}
            </div>
            <Input
              id="google_analytics_id"
              name="google_analytics_id"
              defaultValue={initialData.google_analytics_id ?? ""}
              placeholder="G-XXXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Your GA4 Measurement ID. Find it in Google Analytics under{" "}
              <span className="text-foreground">Admin &rsaquo; Data Streams</span>.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="meta_pixel_id">Meta Pixel ID</Label>
              {initialData.meta_pixel_id ? (
                <Badge variant="secondary">Connected</Badge>
              ) : (
                <Badge variant="outline">Not configured</Badge>
              )}
            </div>
            <Input
              id="meta_pixel_id"
              name="meta_pixel_id"
              defaultValue={initialData.meta_pixel_id ?? ""}
              placeholder="123456789012345"
            />
            <p className="text-xs text-muted-foreground">
              Your Facebook/Meta Pixel ID. Find it in Meta Events Manager under{" "}
              <span className="text-foreground">Data Sources &rsaquo; Pixel</span>.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="google_ads_id">Google Ads ID</Label>
              {initialData.google_ads_id ? (
                <Badge variant="secondary">Connected</Badge>
              ) : (
                <Badge variant="outline">Not configured</Badge>
              )}
            </div>
            <Input
              id="google_ads_id"
              name="google_ads_id"
              defaultValue={initialData.google_ads_id ?? ""}
              placeholder="AW-XXXXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Optional. Used for Google Ads conversion tracking alongside GA4.
            </p>
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