// src/components/DashboardHero.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Percent, Bed, TrendingUp } from "lucide-react"

export function DashboardHero({ hotelName, year, month }) {
  // TODO: Add your useHotelAnalytics() hook call here later.
  // For now, we define a fallback or "data" object to prevent the error.
  const data = {
    total_revenue: 676204,
    rev_var: -12.5,
    occupancy: 69.9,
    occ_var: -6.7,
    adr: 322.20,
    adr_var: -3.01,
    revpar: 225.00,
    revpar_budget: 250.00
  };

  // If data is still null/undefined from a hook, return a loading state
  if (!data) return <div className="p-4 text-muted-foreground">Loading analytics...</div>;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="rounded-none shadow-none border-slate-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium font-['Khand'] uppercase tracking-wider">
            Total Revenue
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {/* Use optional chaining ?. to safely access properties */}
          <div className="text-3xl font-bold font-['Outfit'] tabular-nums">
            ${data.total_revenue?.toLocaleString()}
          </div>
          <p className="text-xs flex items-center gap-1 pt-1">
            <span className={data.rev_var >= 0 ? "text-emerald-500" : "text-rose-500"}>
              {data.rev_var >= 0 ? "+" : ""}{data.rev_var}%
            </span>
            <span className="text-muted-foreground text-[10px]">vs. STLY</span>
          </p>
        </CardContent>
      </Card>
      {/* ... repeat for other cards ... */}
    </div>
  );
}
