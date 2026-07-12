import { Card, CardContent } from "@/components/ui/card";
import { InboxIcon } from "lucide-react";

export function AnalyticsEmpty({ message }: { message?: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
        <InboxIcon className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {message ?? "No data available for the selected period."}
        </p>
      </CardContent>
    </Card>
  );
}