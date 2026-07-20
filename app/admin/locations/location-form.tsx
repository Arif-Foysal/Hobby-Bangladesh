"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { createLocation, updateLocation } from "./actions";
import { toast } from "sonner";
import type { Location, LocationType } from "@/lib/database/types";

export function LocationForm({
  location,
  parents,
}: {
  location?: Location;
  parents: Location[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<LocationType>(location?.type ?? "division");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    // Select components emit hidden inputs with native form submission,
    // but radix's Select hides them — ensure type and parent_id are set explicitly.
    formData.set("type", type);

    const result = location
      ? await updateLocation(location.id, formData)
      : await createLocation(formData);

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      setLoading(false);
      return;
    }

    toast.success(location ? "Location updated" : "Location created");
    router.push("/admin/locations");
  };

  // For city/area, parents are divisions/cities respectively.
  const parentOptions =
    type === "city"
      ? parents.filter((p) => p.type === "division" && p.id !== location?.id)
      : type === "area"
        ? parents.filter((p) => p.type === "city" && p.id !== location?.id)
        : [];

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {location ? "Edit Location" : "New Location"}
          </h2>
          <p className="text-muted-foreground">
            {location
              ? "Update this delivery location and its charge."
              : "Add a delivery area with its own delivery charge."}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/locations")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading
              ? "Saving..."
              : location
                ? "Update Location"
                : "Create Location"}
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
            <h3 className="text-sm font-medium">Details</h3>
            <p className="text-xs text-muted-foreground">
              Name and location type.
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g. Dhaka, Mohammadpur"
              defaultValue={location?.name ?? ""}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Type</Label>
            <Select
              name="type"
              defaultValue={location?.type ?? "division"}
              onValueChange={(v) => setType(v as LocationType)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="division">Division</SelectItem>
                  <SelectItem value="city">City</SelectItem>
                  <SelectItem value="area">Area</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {type === "division"
                ? "Top-level region — drives the default delivery charge at checkout."
                : type === "city"
                  ? "Belongs to a division — overrides the division's charge when selected."
                  : "Belongs to a city — overrides the city's charge when selected."}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-lg border p-4">
          <div>
            <h3 className="text-sm font-medium">Charge & Visibility</h3>
            <p className="text-xs text-muted-foreground">
              Delivery charge and parent (for cities/areas).
            </p>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <Label htmlFor="delivery_charge">Delivery Charge (৳)</Label>
            <Input
              id="delivery_charge"
              name="delivery_charge"
              type="number"
              min="0"
              step="1"
              placeholder="60"
              defaultValue={location?.delivery_charge ?? 60}
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Parent Location</Label>
            {type === "division" ? (
              <Input
                disabled
                placeholder="Divisions are top-level"
                value="None"
              />
            ) : parentOptions.length === 0 ? (
              <Input
                disabled
                placeholder={`No ${type === "city" ? "divisions" : "cities"} exist yet`}
                value=""
              />
            ) : (
              <Select
                name="parent_id"
                defaultValue={location?.parent_id ?? "none"}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {parentOptions.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            )}
            {type !== "division" && parentOptions.length === 0 && (
              <p className="text-xs text-destructive">
                Create at least one {type === "city" ? "division" : "city"} first.
              </p>
            )}
            <input
              type="hidden"
              name="parent_id"
              value={
                type === "division"
                  ? "none"
                  : location?.parent_id ?? "none"
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              name="sort_order"
              type="number"
              min="0"
              placeholder="0"
              defaultValue={location?.sort_order ?? 0}
            />
            <p className="text-xs text-muted-foreground">
              Lower numbers appear first in the checkout dropdown.
            </p>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
              <p className="text-xs text-muted-foreground">
                Location is selectable at checkout.
              </p>
            </div>
            <Switch
              id="is_active"
              name="is_active"
              defaultChecked={location?.is_active ?? true}
            />
          </div>
        </div>
      </div>
    </form>
  );
}