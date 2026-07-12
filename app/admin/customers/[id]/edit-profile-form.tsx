"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { editUserProfile } from "../actions";
import { toast } from "sonner";

export function EditProfileForm({
  userId,
  currentName,
  currentPhone,
}: {
  userId: string;
  currentName: string | null;
  currentPhone: string | null;
}) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(currentName ?? "");
  const [phone, setPhone] = useState(currentPhone ?? "");

  const hasChanges = name !== (currentName ?? "") || phone !== (currentPhone ?? "");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("phone", phone);

    const result = await editUserProfile(userId, formData);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Profile updated");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Full name"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="edit-phone">Phone</Label>
        <Input
          id="edit-phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="01XXXXXXXXX"
        />
      </div>
      <Button type="submit" size="sm" disabled={loading || !hasChanges}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
}
