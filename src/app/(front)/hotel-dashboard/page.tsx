"use client";

import { DashboardHero } from "@/components/DashboardHero";

export default function HotelDashboardPage() {
  return (
    <div className="p-10 space-y-6">
      <h1 className="text-4xl font-extrabold tracking-tight">Hotel Revenue Engine</h1>
      <DashboardHero
        hotelName="Example Hotel"
        year={2025}
        month={6}
      />
    </div>
  );
}
