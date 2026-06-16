import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, ChevronDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — TRYNEX" }] }),
  component: Analytics,
});

const PERIODS = ["Last 7 Days", "Last 30 Days", "All Time"] as const;
const SERIES = [
  { d: "12 May", v: 8500 }, { d: "13 May", v: 11200 }, { d: "14 May", v: 9800 },
  { d: "15 May", v: 14500 }, { d: "16 May", v: 19000 }, { d: "17 May", v: 23500 }, { d: "18 May", v: 31200 },
];

function Analytics() {
  const navigate = useNavigate();
  const [period, setPeriod] = useState<(typeof PERIODS)[number]>("Last 7 Days");

  return (
    <MobileFrame>
      <div className="pb-28">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 pt-6">
          <button onClick={() => navigate({ to: "/profile" })} className="grid h-9 w-9 place-items-center rounded-full bg-surface ring-1 ring-border">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-center font-display text-base font-bold">Analytics</h1>
          <span className="w-9" />
        </header>

        <div className="mt-5 px-5">
          <button
            onClick={() => { const i = PERIODS.indexOf(period); setPeriod(PERIODS[(i + 1) % PERIODS.length]); }}
            className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold ring-1 ring-border"
          >
            {period} <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 px-5">
          <KPI label="Views" value="256.6K" />
          <KPI label="Watch Time" value="10.5K hrs" />
          <KPI label="Likes" value="22.5K" />
          <KPI label="Comments" value="2.1K" />
          <KPI label="Shares" value="1.2K" />
          <KPI label="Earnings" value="₹12,560" highlight />
        </div>

        <div className="mx-5 mt-6 rounded-2xl bg-surface p-4 ring-1 ring-border">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={SERIES} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineG" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="oklch(0.62 0.23 295)" />
                    <stop offset="100%" stopColor="oklch(0.75 0.18 305)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.05)" vertical={false} />
                <XAxis dataKey="d" stroke="oklch(0.72 0.03 290)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="oklch(0.72 0.03 290)" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(n) => `${n / 1000}K`} />
                <Tooltip contentStyle={{ background: "oklch(0.18 0.045 290)", border: "1px solid oklch(1 0 0 / 0.1)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="v" stroke="url(#lineG)" strokeWidth={3} dot={{ r: 3, fill: "oklch(0.75 0.18 305)" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}

function KPI({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ring-border ${highlight ? "btn-gradient text-primary-foreground" : "bg-surface"}`}>
      <p className={`text-[11px] ${highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{label}</p>
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
    </div>
  );
}
