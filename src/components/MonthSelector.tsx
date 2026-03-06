"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface MonthSelectorProps {
  selectedMonth: number;
  onSelect: (month: number) => void;
}

const months = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
];

export function MonthSelector({ selectedMonth, onSelect }: MonthSelectorProps) {
  return (
    <div className="bg-muted px-1 py-1 flex items-center">
      <div className="bg-black text-white px-6 py-2 text-sm font-semibold">2025</div>
      <ToggleGroup
        type="single"
        value={selectedMonth.toString()}
        onValueChange={(val) => {
          if (val) onSelect(parseInt(val, 10));
        }}
        className="justify-start ml-2 gap-0"
      >
        {months.map((m) => (
          <ToggleGroupItem
            key={m.value}
            value={m.value.toString()}
            className="rounded-none px-6 py-2 text-sm text-muted-foreground data-[state=on]:bg-black data-[state=on]:text-white hover:bg-black/10 transition-colors"
          >
            {m.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <div className="ml-auto text-[10px] text-muted-foreground text-right pr-4 uppercase">
        Last Updated<br/>
        Jul 5, 2025
      </div>
    </div>
  );
}
