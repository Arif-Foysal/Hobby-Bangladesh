"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { saveAnalytics } from "./actions";
import { toast } from "sonner";

export function AnalyticsForm({
  initialData,
}: {
  initialData: {
    enabled?: boolean;
    gtm_container_id?: string;
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
              Connect Google Tag Manager to manage all your tracking tags (GA4,
              Meta Pixel, Google Ads, etc.) from a single dashboard.
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
              <Label htmlFor="gtm_container_id">GTM Container ID</Label>
              {initialData.gtm_container_id ? (
                <Badge variant="secondary">Connected</Badge>
              ) : (
                <Badge variant="outline">Not configured</Badge>
              )}
            </div>
            <Input
              id="gtm_container_id"
              name="gtm_container_id"
              defaultValue={initialData.gtm_container_id ?? ""}
              placeholder="GTM-XXXXXXX"
            />
            <p className="text-xs text-muted-foreground">
              Your Google Tag Manager Container ID. Find it in GTM under{" "}
              <span className="text-foreground">
                Admin &rsaquo; Container &rsaquo; Install
              </span>
              . Once connected, configure GA4, Meta Pixel, and other tags inside
              the GTM dashboard.
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