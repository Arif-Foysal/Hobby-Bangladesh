"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <h1 className="text-2xl font-bold">Admin Error</h1>
      <p className="max-w-md text-muted-foreground">
        Something went wrong in the admin panel. Please try again.
      </p>
      <Button onClick={reset}>Try Again</Button>
    </div>
  );
}
