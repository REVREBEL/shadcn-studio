"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconTrash } from "@tabler/icons-react";
import type { ConsoleEntry } from "./preview-iframe";
import { cn } from "@/lib/utils";

const methodColors: Record<ConsoleEntry["method"], string> = {
  log: "text-foreground",
  info: "text-blue-500",
  warn: "text-amber-500",
  error: "text-red-500",
};

function formatTime(ts: number): string {
  const d = new Date(ts);
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  const s = String(d.getSeconds()).padStart(2, "0");
  const ms = String(d.getMilliseconds()).padStart(3, "0");
  return `${h}:${m}:${s}.${ms}`;
}

interface ConsolePanelProps {
  logs: ConsoleEntry[];
  onClear: () => void;
}

export function ConsolePanel({ logs, onClear }: ConsolePanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  });

  return (
    <div className="flex h-full flex-col bg-background">
      <div className="flex h-8 shrink-0 items-center justify-between border-b border-border px-3">
        <span className="text-[11px] font-medium text-muted-foreground">
          Console
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Clear console"
              onClick={onClear}
            >
              <IconTrash className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Clear</TooltipContent>
        </Tooltip>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto p-2">
        {logs.length === 0 ? (
          <p className="text-[11px] text-muted-foreground/50 px-1 py-0.5">
            No logs yet
          </p>
        ) : (
          logs.map((entry) => (
            <div
              key={entry.id}
              className={cn(
                "flex gap-2 px-1 py-0.5 text-[12px] font-mono leading-relaxed",
                methodColors[entry.method],
              )}
            >
              <span className="shrink-0 text-muted-foreground/60">
                {formatTime(entry.timestamp)}
              </span>
              <span className="whitespace-pre-wrap break-all">
                {entry.args.join(" ")}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
