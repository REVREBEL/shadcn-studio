// src/app/page.tsx
"use client";
import { useState } from "react";
import { DashboardHero } from "@/components/DashboardHero";

export default function DashboardPage() {
  const [hotel, setHotel] = useState("Foundation Hotel");
  const [month, setMonth] = useState("5");
  const [year, setYear] = useState("2025");

  return (
    <div className="p-10 space-y-6">
      <div className="flex flex-wrap items-end gap-4 pb-6 border-b">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">Hotel Code</label>
          <input
            type="text"
            value={hotel}
            onChange={(e) => setHotel(e.target.value)}
            className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">Month</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="flex h-10 w-[150px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
              <option key={m} value={m}>
                {new Date(2025, m - 1, 1).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-muted-foreground">Year</label>
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="flex h-10 w-[120px] items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight">Hotel Revenue Engine</h1>
      <DashboardHero
        hotelName={hotel}
        year={parseInt(year, 10)}
        month={parseInt(month, 10)}
      />
    </div>
  );
}
