"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { saveBranding, uploadLogoImage } from "./actions";
import { compressImage } from "@/lib/image-compress";
import { IconPhoto, IconTrash, IconUpload } from "@tabler/icons-react";
import { toast } from "sonner";

export function BrandingForm({ initialLogoUrl }: { initialLogoUrl: string | null }) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const compressed = await compressImage(file, { maxDimension: 400, targetSize: 200 * 1024 });
      const result = await uploadLogoImage(compressed);
      if (result.error) {
        toast.error(result.error);
      } else if (result.url) {
        setLogoUrl(result.url);
        setDirty(true);
      }
    } catch {
      toast.error("Could not process image");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleClear = () => {
    setLogoUrl(null);
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    const formData = new FormData();
    formData.set("logo_url", logoUrl ?? "");
    const result = await saveBranding(formData);
    setSaving(false);
    if (result.success) {
      toast.success("Branding saved");
      setDirty(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Brand Logo</CardTitle>
        <CardDescription>
          Upload a custom logo to replace the default in the site header, footer,
          mobile nav, and auth pages. Recommended: transparent PNG/WebP, max height
          64px.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex h-20 w-72 items-center justify-center overflow-hidden rounded-lg border bg-muted/30 p-3">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt="Logo preview"
                width={220}
                height={48}
                className="h-12 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <IconPhoto className="size-5" />
                <span className="text-sm">No logo — default will be used</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  Uploading...
                </>
              ) : (
                <>
                  <IconUpload className="size-4" />
                  {logoUrl ? "Replace" : "Upload"}
                </>
              )}
            </Button>
            {logoUrl && (
              <Button type="button" variant="ghost" size="sm" onClick={handleClear}>
                <IconTrash className="size-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Leave empty to use the built-in HobbyBD text logo. Saved changes appear
          site-wide after refreshing.
        </p>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || uploading || !dirty}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}