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

    let active = true;
    setIsLoading(true);
    // Clear stale stats immediately when inputs change
    setStats(null);

    getSummaryStats(hotelName, year, month)
      .then((data) => {
        if (active) setStats(data);
      })
      .catch((err: unknown) => {
        console.error("Failed to fetch stats", err);
        if (active) setStats(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => { active = false; };
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

  // Formatters with null safety
  const formatCurrency = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "$0";
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatPct = (val: number | null | undefined) => {
    if (val === null || val === undefined) return "0%";
    return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(val);
  };

  // Variance display helper with robust null and zero handling
  const renderVariance = (val: number | null | undefined, pyVal: number | null | undefined, type: 'currency' | 'percent') => {
    if (val === null || val === undefined) return null;

    const isPos = val >= 0;
    const Icon = isPos ? TrendingUp : TrendingDown;
    const colorClass = isPos ? "text-emerald-500 font-medium" : "text-red-500 font-medium";
    const iconColor = isPos ? "text-emerald-500" : "text-red-500";

    const formattedVal = type === 'percent'
      ? `${(val * 100).toFixed(1)}%`
      : formatCurrency(Math.abs(val));

    return (
      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
        <Icon className={`w-3 h-3 ${iconColor}`} />
        <span className={colorClass}>
          {isPos ? "+" : "-"}
          {formattedVal}
        </span>
        {pyVal !== undefined && pyVal !== null && (
          <> from prior year ({type === 'percent' ? formatPct(pyVal) : formatCurrency(pyVal)})</>
        )}
      </p>
    );
  };

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
              {renderVariance(stats.occ_var, stats.occ_py, 'percent')}
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
              {renderVariance(stats.adr_var, stats.adr_py, 'currency')}
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
              {renderVariance(stats.revpar_var, stats.revpar_py, 'currency')}

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
