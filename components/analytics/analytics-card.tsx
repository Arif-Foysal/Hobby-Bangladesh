import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AnalyticsCardProps {
  title: string;
  value: string;
  description: string;
  changePct?: number | null;
  changeLabel?: string;
  icon?: React.ReactNode;
}

export function AnalyticsCard({
  title,
  value,
  description,
  changePct,
  changeLabel = "vs previous period",
  icon,
}: AnalyticsCardProps) {
  const hasChange = changePct !== null && changePct !== undefined && changePct !== 0;

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>{title}</CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          {value}
        </CardTitle>
        <div className="flex items-center gap-2">
          {hasChange && (
            <Badge variant="outline">
              {changePct > 0 ? <IconTrendingUp /> : <IconTrendingDown />}
              {changePct > 0 ? "+" : ""}
              {changePct}%
            </Badge>
          )}
          {icon}
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          {hasChange ? (
            <>
              {changePct >= 0 ? "Trending up" : "Trending down"}{" "}
              {changePct >= 0 ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </>
          ) : (
            <span className="text-muted-foreground">{description}</span>
          )}
        </div>
        <div className="text-muted-foreground">{changeLabel}</div>
      </CardFooter>
    </Card>
  );
}