"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


export interface DateRange {
  from: string;
  to: string;
}

const PRESETS = [
  { label: "Today", days: 0 },
  { label: "7 Days", days: 7 },
  { label: "30 Days", days: 30 },
  { label: "90 Days", days: 90 },
  { label: "12 Months", days: 365 },
];

function toISODate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function DateRangePicker({
  value,
  onChange,
}: {
  value: DateRange;
  onChange: (range: DateRange) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [activePreset, setActivePreset] = React.useState<string | null>(null);

  function applyPreset(days: number) {
    const to = new Date();
    to.setHours(23, 59, 59, 999);
    const from = new Date();
    from.setDate(from.getDate() - days);
    from.setHours(0, 0, 0, 0);
    onChange({ from: toISODate(from), to: toISODate(to) });
    setActivePreset(String(days));
    setOpen(false);
  }

  function handleFromChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newFrom = e.target.value;
    if (newFrom) {
      onChange({ from: newFrom, to: value.to });
      setActivePreset(null);
    }
  }

  function handleToChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTo = e.target.value;
    if (newTo) {
      onChange({ from: value.from, to: newTo });
      setActivePreset(null);
    }
  }

  return (
    <Card className="gap-0 border-none bg-transparent shadow-none">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-4 sm:flex-row">
        <CardTitle className="text-sm font-medium">Date Range</CardTitle>
        <div className="ml-auto flex items-center gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <CalendarIcon className="size-4" />
                {formatDate(value.from)} — {formatDate(value.to)}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-4"
              align="end"
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">From</label>
                      <Input
                        type="date"
                        value={value.from}
                        onChange={handleFromChange}
                        className="w-auto"
                        style={{ colorScheme: "dark light" }}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs text-muted-foreground">To</label>
                      <Input
                        type="date"
                        value={value.to}
                        onChange={handleToChange}
                        className="w-auto"
                        style={{ colorScheme: "dark light" }}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="flex flex-wrap gap-2">
                    {PRESETS.map((preset) => (
                      <Button
                        key={preset.days}
                        variant={
                          activePreset === String(preset.days)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => applyPreset(preset.days)}
                      >
                        {preset.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="px-0" />
    </Card>
  );
}