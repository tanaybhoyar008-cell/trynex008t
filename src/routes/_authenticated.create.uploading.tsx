import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Loader2, ArrowUp } from "lucide-react";
import { toast } from "sonner";

import { MobileFrame } from "@/components/MobileFrame";

export const Route = createFileRoute("/_authenticated/create/uploading")({
  head: () => ({ meta: [{ title: "Uploading — TRYNEX" }] }),
  component: Uploading,
});

const STEPS = ["Uploading Video", "Processing Video", "Adding to Platform", "Publish Successfully"] as const;

function Uploading() {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setProgress((p) => {
      if (p >= 100) { clearInterval(id); setTimeout(() => { toast.success("Published!"); navigate({ to: "/profile" }); }, 800); return 100; }
      return Math.min(100, p + 4);
    }), 180);
    return () => clearInterval(id);
  }, [navigate]);

  const step = Math.min(STEPS.length - 1, Math.floor((progress / 100) * STEPS.length));

  return (
    <MobileFrame>
      <div className="flex min-h-screen flex-col px-5 pb-12 pt-6">
        <h1 className="text-center font-display text-base font-bold">Uploading Video</h1>

        <div className="mt-10 grid place-items-center">
          <div className="relative grid h-48 w-48 place-items-center">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="44" stroke="oklch(0.27 0.06 290)" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="44" stroke="url(#g)" strokeWidth="8" fill="none"
                strokeDasharray={2 * Math.PI * 44} strokeDashoffset={(1 - progress / 100) * 2 * Math.PI * 44}
                strokeLinecap="round" />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.23 295)" />
                  <stop offset="100%" stopColor="oklch(0.75 0.18 305)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute flex flex-col items-center">
              <ArrowUp className="h-5 w-5 text-brand-2" />
              <p className="font-display text-2xl font-bold">{progress}%</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Uploading…</p>
        </div>

        <div className="mt-6 h-2 overflow-hidden rounded-full bg-surface-2">
          <div className="h-full btn-gradient transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 text-right text-[11px] text-muted-foreground">{progress}%</p>

        <div className="mt-8 space-y-3">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-border">
              <div className={`grid h-7 w-7 place-items-center rounded-full ${i < step ? "btn-gradient" : i === step ? "bg-brand/30" : "bg-surface-2"}`}>
                {i < step ? <Check className="h-4 w-4" /> : i === step ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-xs">{i + 1}</span>}
              </div>
              <span className={`text-sm ${i <= step ? "" : "text-muted-foreground"}`}>{s}</span>
            </div>
          ))}
        </div>

        <button onClick={() => navigate({ to: "/" })} className="mt-auto h-12 rounded-2xl bg-surface ring-1 ring-border text-sm font-semibold">Cancel</button>
      </div>
    </MobileFrame>
  );
}
