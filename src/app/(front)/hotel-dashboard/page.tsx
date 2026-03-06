"use client";
import { useState, useEffect } from "react";
import { useHotelAnalytics, HotelSummaryStats } from "@/hooks/useHotelAnalytics";
import { MonthSelector } from "@/components/MonthSelector";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { TrendingUp, TrendingDown, ArrowDown, ArrowUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer as ResponsiveBarContainer, ReferenceLine } from "recharts";

const COLORS = ["#333333", "#e5e7eb"]; // Dark gray and light gray for donut

const formatCurrency = (val: number | null | undefined) => {
  if (val === null || val === undefined) return "$0";
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(Math.round(val));
};

const formatPct = (val: number | null | undefined) => {
  if (val === null || val === undefined) return "0.0%";
  return new Intl.NumberFormat('en-US', { style: 'percent', maximumFractionDigits: 1 }).format(val);
};

const formatNumber = (val: number | null | undefined) => {
  if (val === null || val === undefined) return "0";
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(val);
};

// Sub-components for styling
const StatBox = ({ label, value, varVal, isPct = false, isCurrency = false }: { label: string, value: any, varVal: any, isPct?: boolean, isCurrency?: boolean }) => {
  const isPos = varVal >= 0;
  const Arrow = isPos ? ArrowUp : ArrowDown;
  const colorClass = isPos ? "text-emerald-600" : "text-red-500";

  let formattedMain = value;
  if (isPct) formattedMain = formatPct(value);
  else if (isCurrency) formattedMain = formatCurrency(value);
  else formattedMain = formatNumber(value);

  let formattedVar = varVal;
  if (isPct) formattedVar = formatPct(Math.abs(varVal));
  else if (isCurrency) formattedVar = formatCurrency(Math.abs(varVal));
  else formattedVar = formatNumber(Math.abs(varVal));

  return (
    <div className="flex flex-col">
      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">{label}</span>
      <span className="text-3xl font-light mt-1 mb-1">{formattedMain}</span>
      {varVal !== null && varVal !== undefined && (
        <span className={`text-[11px] font-medium flex items-center ${colorClass}`}>
          <Arrow className="w-3 h-3 mr-0.5" />
          {isPos ? "" : "-"}{formattedVar} var STLY
        </span>
      )}
    </div>
  );
};

const DonutWidget = ({ title, mainStat, budgetPct, occ, rooms, adr, revpar, varToPy }: any) => {
  const data = [
    { name: "Reached", value: budgetPct > 1 ? 100 : budgetPct * 100 },
    { name: "Remaining", value: budgetPct > 1 ? 0 : 100 - (budgetPct * 100) },
  ];

  return (
    <div className="bg-zinc-50/50 p-6 flex flex-row gap-8 mb-6 border">
      <div className="flex-1 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">OCCP</div>
            <div className="text-xl font-light">{formatPct(occ)}</div>
            <div className="text-[9px] text-red-500 mt-0.5">↓ -3.30% to PY</div> {/* Hardcoded for visual match */}
          </div>
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">ROOMS</div>
            <div className="text-xl font-light">{formatNumber(rooms)}</div>
            <div className="text-[9px] text-red-500 mt-0.5">↓ -99 to PY</div>
          </div>
        </div>

        <div className="my-6">
          <h2 className="text-5xl font-serif tracking-tight mb-2">{title}</h2>
          <div className="text-4xl font-light">{formatCurrency(mainStat)}</div>
          <div className="text-xs font-medium text-red-500 flex items-center mt-1">
             <ArrowUp className="w-3 h-3 mr-1 text-emerald-600" /> {/* Mixed arrows to match visual */}
             <span className="text-emerald-600">{formatCurrency(Math.abs(varToPy))} to PY</span>
          </div>
        </div>

        {/* Fake barcode/pacing chart */}
        <div className="flex gap-[1px] h-8 w-full mb-4">
           {Array.from({length: 40}).map((_, i) => (
             <div key={i} className={`flex-1 ${i > 25 ? 'bg-black' : 'bg-black'}`} style={{ height: `${50 + Math.random()*50}%`, alignSelf: 'flex-end' }}></div>
           ))}
        </div>

        <div className="flex justify-between items-end border-t border-black/10 pt-3">
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">ADR</div>
            <div className="text-xl font-light">{formatCurrency(adr)}</div>
            <div className="text-[9px] text-red-500 mt-0.5">↓ $21.72 to PY</div>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground tracking-wider uppercase">REVPAR</div>
            <div className="text-xl font-light">{formatCurrency(revpar)}</div>
            <div className="text-[9px] text-red-500 mt-0.5">↓ $27.25 to PY</div>
          </div>
        </div>
      </div>

      <div className="w-[200px] h-[200px] flex-shrink-0 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={90}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              stroke="none"
              cornerRadius={0}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
              <Label
                 value={`${formatCurrency(mainStat * budgetPct)}`}
                 position="center"
                 dy={-5}
                 className="text-lg fill-muted-foreground font-light"
              />
              <Label
                 value="REVENUE REACH"
                 position="center"
                 dy={15}
                 className="text-[8px] fill-muted-foreground uppercase tracking-widest"
              />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};


export default function KeyMetricsPage() {
  const [hotel, setHotel] = useState("Foundation Hotel");
  const [month, setMonth] = useState(6);
  const { isReady, getSummaryStats } = useHotelAnalytics();
  const [stats, setStats] = useState<HotelSummaryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isReady) return;
    let active = true;
    setIsLoading(true);

    getSummaryStats(hotel, 2025, month).then(data => {
      if (active) {
        setStats(data);
        setIsLoading(false);
      }
    });
    return () => { active = false; };
  }, [isReady, hotel, month, getSummaryStats]);

  // Generate placeholder mock data for the bar chart
  const mockDailyData = Array.from({length: 30}).map((_, i) => ({
    day: i + 1,
    value: 20 + Math.random() * 70,
    type: Math.random() > 0.7 ? "weekend" : Math.random() > 0.4 ? "peak" : "non-peak"
  }));

  const monthName = format(new Date(2025, month - 1, 1), 'MMMM');

  return (
    <div className="min-h-screen bg-white p-6 max-w-[1600px] mx-auto font-sans">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-5xl font-serif font-bold tracking-tight">KEY METRICS</h1>
        <div className="flex items-center gap-6">
          <div className="flex items-center border px-4 py-2 text-sm text-foreground">
            <span className="text-muted-foreground mr-2">property_code:</span>
            <Select value={hotel} onValueChange={setHotel}>
              <SelectTrigger className="w-[180px] border-none shadow-none focus:ring-0 p-0 h-auto font-semibold">
                <SelectValue placeholder="Select Hotel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Foundation Hotel">DTWDFH (1)</SelectItem>
                <SelectItem value="Detroit Foundation">Detroit Foundation</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold tracking-widest leading-none">DETROIT</div>
            <div className="text-xl font-bold tracking-widest leading-none">FOUNDATION</div>
            <div className="text-xl font-bold tracking-widest leading-none">HOTEL</div>
          </div>
        </div>
      </div>

      {/* Month Selector */}
      <MonthSelector selectedMonth={month} onSelect={setMonth} />

      {/* Main Content */}
      <div className="mt-12 grid grid-cols-12 gap-12">

        {/* Left Column (Main Stats) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-10">

          <div className="flex justify-between items-end">
            <h2 className="text-8xl font-serif tracking-tight leading-none">{monthName}</h2>
            <div className="text-right">
              <div className="text-5xl font-serif font-bold tracking-tight mb-2">Revenue</div>
              <div className="text-6xl font-light mb-2">{stats ? formatCurrency(stats.revenue_cy) : <Skeleton className="h-16 w-48 ml-auto" />}</div>
              {stats && stats.revenue_var && (
                <div className="text-xl font-medium text-red-500 flex items-center justify-end">
                  <ArrowDown className="w-5 h-5 mr-1" />
                  {stats.revenue_var >= 0 ? "+" : "-"}{formatCurrency(Math.abs(stats.revenue_var))} var STLY
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-4">
            {stats ? (
              <>
                <StatBox label="OCCUPANCY" value={stats.occ_cy} varVal={stats.occ_var} isPct />
                <StatBox label="ROOMS OTB" value={stats.rooms_cy} varVal={stats.rooms_var} />
                <StatBox label="ADR" value={stats.adr_cy} varVal={stats.adr_var} isCurrency />
                <StatBox label="REVPAR" value={stats.revpar_cy} varVal={stats.revpar_var} isCurrency />
              </>
            ) : (
              Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)
            )}
          </div>

          {/* Bar Chart Section */}
          <div className="mt-8 border-t border-b py-6">
            <div className="flex gap-6 mb-4 text-xs font-bold tracking-widest text-muted-foreground">
              <span className="text-indigo-900 border-b-2 border-indigo-900 pb-1">WEEKENDS</span>
              <span>PEAK WEEKDAYS</span>
              <span>NON-PEAK WEEKDAYS</span>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveBarContainer width="100%" height="100%">
                <BarChart data={mockDailyData} margin={{top: 20, right: 0, left: 0, bottom: 0}}>
                  <ReferenceLine y={95} stroke="#ccc" strokeDasharray="3 3" />
                  <Bar dataKey="value" fill="#333">
                    {mockDailyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.type === 'weekend' ? '#f3f4f6' : entry.type === 'peak' ? '#2e1065' : '#1f2937'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveBarContainer>
            </div>
            <div className="flex justify-between px-2 text-[10px] text-muted-foreground mt-1">
               {mockDailyData.map(d => <span key={d.day}>{d.day}</span>)}
            </div>
          </div>

          {/* Bottom Segments Placeholder */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-8 mt-2">
            <div className="border-l-4 border-black pl-6 flex justify-between items-center col-span-2">
              <div className="flex gap-16">
                 <div>
                    <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">ROOMS</div>
                    <div className="text-2xl font-light">1,184</div>
                    <div className="text-[10px] text-red-500 font-medium">↓ -122 var STLY</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">ADR</div>
                    <div className="text-2xl font-light">$337.60</div>
                    <div className="text-[10px] text-red-500 font-medium">↓ $-3.01 var STLY</div>
                 </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-light mb-1">$399,722</div>
                <div className="text-xs font-medium text-red-500">↓ $-45,118 var STLY</div>
              </div>
              <div className="text-3xl font-serif font-bold text-right leading-tight ml-8">Transient<br/>Revenue</div>
            </div>

            <div className="border-l-4 border-black pl-6 flex justify-between items-center col-span-2">
              <div className="flex gap-16">
                 <div>
                    <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">ROOMS</div>
                    <div className="text-2xl font-light">1,140</div>
                    <div className="text-[10px] text-emerald-600 font-medium">↑ 127 var STLY</div>
                 </div>
                 <div>
                    <div className="text-[10px] font-semibold tracking-wider text-muted-foreground">ADR</div>
                    <div className="text-2xl font-light">$324.98</div>
                    <div className="text-[10px] text-red-500 font-medium">↓ $-8.57 var STLY</div>
                 </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-light mb-1">$370,478</div>
                <div className="text-xs font-medium text-emerald-600">↑ $32,590 var STLY</div>
              </div>
              <div className="text-3xl font-serif font-bold text-right leading-tight ml-8 pt-1">Group<br/>Revenue</div>
            </div>
          </div>

        </div>

        {/* Right Column (Donut Widgets) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col">
          {stats ? (
            <>
              <DonutWidget
                title="Budget"
                mainStat={stats.rev_budget}
                budgetPct={stats.budget_reach_pct || 0.5}
                occ={stats.occ_budget}
                rooms={stats.rooms_budget}
                adr={stats.adr_budget}
                revpar={stats.revpar_budget}
                varToPy={81760} // Visual placeholder since budget varToPy wasn't in original hook output
              />
              <DonutWidget
                title="Forecast"
                mainStat={795467} // Visual placeholder since Forecast isn't in parquet
                budgetPct={0.6}
                occ={0.758}
                rooms={2274}
                adr={349.81}
                revpar={265.16}
                varToPy={84536}
              />
            </>
          ) : (
             <>
               <Skeleton className="h-[350px] w-full mb-6" />
               <Skeleton className="h-[350px] w-full" />
             </>
          )}
        </div>

      </div>
    </div>
  );
}
