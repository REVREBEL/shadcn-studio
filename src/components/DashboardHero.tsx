"use client";

import { useEffect, useState } from "react";
import { useHotelAnalytics, HotelSummaryStats } from "@/hooks/useHotelAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, TrendingDown, DollarSign, Users, Building } from "lucide-react";

interface DashboardHeroProps {
  hotelName: string;
  year: number;
  month: number;
}

export function DashboardHero({ hotelName, year, month }: DashboardHeroProps) {
  const { isReady, error, getSummaryStats } = useHotelAnalytics();
  const [stats, setStats] = useState<HotelSummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    
    setIsLoading(true);
    getSummaryStats(hotelName, year, month)
      .then((data) => {
        setStats(data);
      })
      .catch((err: any) => {
        console.error("Failed to fetch stats", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [isReady, hotelName, year, month, getSummaryStats]);

  if (error) {
    return (
      <Card className="w-full border-red-200 bg-red-50 dark:bg-red-950/20">
        <CardContent className="pt-6">
          <p className="text-red-600 dark:text-red-400">Failed to load analytics: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  // Formatters
  const formatCurrency = (val: number | undefined) => 
    val === undefined ? "$0" : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  
  const formatPct = (val: number | undefined) => 
    val === undefined ? "0%" : new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(val);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Occupancy Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
          <Building className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading || !isReady ? (
            <Skeleton className="h-8 w-[100px]" />
          ) : stats ? (
            <>
              <div className="text-2xl font-bold">{formatPct(stats.occ_cy)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {stats.occ_var >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={stats.occ_var >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                  {stats.occ_var >= 0 ? "+" : ""}{(stats.occ_var * 100).toFixed(1)}%
                </span>
                {" "}from prior year ({formatPct(stats.occ_py)})
              </p>
            </>
          ) : (
            <div className="text-2xl font-bold">-</div>
          )}
        </CardContent>
      </Card>

      {/* ADR Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Average Daily Rate</CardTitle>
          <Users className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading || !isReady ? (
            <Skeleton className="h-8 w-[100px]" />
          ) : stats ? (
            <>
              <div className="text-2xl font-bold">{formatCurrency(stats.adr_cy)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {stats.adr_var >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={stats.adr_var >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                  {stats.adr_var >= 0 ? "+" : ""}{formatCurrency(stats.adr_var)}
                </span>
                {" "}from prior year ({formatCurrency(stats.adr_py)})
              </p>
            </>
          ) : (
            <div className="text-2xl font-bold">-</div>
          )}
        </CardContent>
      </Card>

      {/* RevPAR Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">RevPAR</CardTitle>
          <DollarSign className="w-4 h-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading || !isReady ? (
            <Skeleton className="h-8 w-[100px]" />
          ) : stats ? (
            <>
              <div className="text-2xl font-bold">{formatCurrency(stats.revpar_cy)}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                {stats.revpar_var >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={stats.revpar_var >= 0 ? "text-emerald-500 font-medium" : "text-red-500 font-medium"}>
                  {stats.revpar_var >= 0 ? "+" : ""}{formatCurrency(stats.revpar_var)}
                </span>
                {" "}from prior year ({formatCurrency(stats.revpar_py)})
              </p>
              
              <div className="mt-4 border-t pt-4 flex justify-between items-center text-xs text-muted-foreground">
                <span>Budget: {formatCurrency(stats.revpar_budget)}</span>
                <span className="font-medium">
                  {formatPct(stats.budget_reach_pct)} reached
                </span>
              </div>
            </>
          ) : (
            <div className="text-2xl font-bold">-</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
