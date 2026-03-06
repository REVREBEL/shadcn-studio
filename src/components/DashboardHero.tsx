"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, DollarSign, Percent, Bed } from "lucide-react"

// Assuming 'data' comes from your useHotelAnalytics() hook
export function KPICards({ data }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Revenue Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.total_revenue?.toLocaleString()}</div>
          <p className="text-xs flex items-center gap-1 pt-1">
            <span className={data.rev_var >= 0 ? "text-emerald-500" : "text-rose-500"}>
              {data.rev_var >= 0 ? "+" : ""}{data.rev_var}%
            </span>
            <span className="text-muted-foreground text-[10px]">vs. STLY</span>
          </p>
        </CardContent>
      </Card>

      {/* Occupancy Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Occupancy</CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.occupancy}%</div>
          <p className="text-xs flex items-center gap-1 pt-1">
            <span className={data.occ_var >= 0 ? "text-emerald-500" : "text-rose-500"}>
              {data.occ_var >= 0 ? "+" : ""}{data.occ_var}%
            </span>
            <span className="text-muted-foreground text-[10px]">vs. STLY</span>
          </p>
        </CardContent>
      </Card>

      {/* ADR Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">ADR</CardTitle>
          <Bed className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.adr?.toFixed(2)}</div>
          <p className="text-xs flex items-center gap-1 pt-1 text-muted-foreground">
            {data.adr_var >= 0 ? <TrendingUp className="h-3 w-3 text-emerald-500" /> : <TrendingDown className="h-3 w-3 text-rose-500" />}
            <span>${Math.abs(data.adr_var)} variance</span>
          </p>
        </CardContent>
      </Card>

      {/* RevPAR Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">RevPAR</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.revpar?.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground pt-1">
            Target: <span className="font-medium text-foreground">${data.revpar_budget}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
