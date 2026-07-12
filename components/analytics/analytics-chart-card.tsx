import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AnalyticsChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerExtra?: React.ReactNode;
}

export function AnalyticsChartCard({
  title,
  description,
  children,
  className,
  headerExtra,
}: AnalyticsChartCardProps) {
  return (
    <Card className={cn("pt-0", className)}>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {headerExtra}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {children}
      </CardContent>
    </Card>
  );
}