"use client";

import { useEffect } from "react";
import { trackViewItem } from "@/lib/analytics-events";

interface ViewItemTrackerProps {
  id: string;
  name: string;
  price?: number;
  category?: string | null;
}

export function ViewItemTracker({ id, name, price, category }: ViewItemTrackerProps) {
  useEffect(() => {
    trackViewItem({ id, name, price, category });
  }, [id, name, price, category]);

  return null;
}