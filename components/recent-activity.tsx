import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import {
  formatAuditAction,
  formatAuditDetails,
  getActionDotColor,
} from "@/lib/audit-format";

async function getRecentActivity() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_log")
    .select("*, profiles(name)")
    .order("created_at", { ascending: false })
    .limit(8);

  return data || [];
}

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  if (seconds > 0) return `${seconds}s ago`;
  return "just now";
}

export async function RecentActivity() {
  const logs = await getRecentActivity();

  if (logs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center text-sm text-muted-foreground">
          No activity recorded yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Recent Activity</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/audit-log">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {logs.map((log) => {
            const entry = log as {
              id: string;
              created_at: string;
              action: string;
              resource_type: string;
              resource_id: string | null;
              details: Record<string, unknown> | null;
              profiles?: { name: string } | null;
            };
            return (
              <div key={entry.id} className="flex items-start gap-3">
                <div
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${getActionDotColor(entry.action)}`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">
                    <span className="font-medium">
                      {entry.profiles?.name ?? "System"}
                    </span>{" "}
                    <span className="text-muted-foreground">
                      {formatAuditAction(entry.action).toLowerCase()}
                    </span>{" "}
                    <span className="capitalize text-muted-foreground">
                      {entry.resource_type}
                    </span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {formatAuditDetails(entry)}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {relativeTime(entry.created_at)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}