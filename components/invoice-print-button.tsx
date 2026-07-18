"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IconPrinter } from "@tabler/icons-react";

export function InvoicePrintButton() {
  useEffect(() => {
    // Auto-trigger print dialog on load for the most ergonomic "open → print" flow.
    // Wrapped in setTimeout so the layout/paint settles before the native dialog opens.
    const t = setTimeout(() => window.print(), 400);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="no-print mb-6 flex items-center justify-between gap-3 print:hidden">
      <p className="text-sm text-muted-foreground">
        Tip: choose &ldquo;Save as PDF&rdquo; in the print dialog to download.
      </p>
      <Button onClick={() => window.print()}>
        <IconPrinter className="size-4" />
        Print Invoice
      </Button>
    </div>
  );
}