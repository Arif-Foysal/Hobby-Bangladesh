import { IconLoader2 } from "@tabler/icons-react";

export default function Loading() {
  return (
    <div className="flex items-center justify-center px-4 py-24 lg:px-6">
      <IconLoader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
}