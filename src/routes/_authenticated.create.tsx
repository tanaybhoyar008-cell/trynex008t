import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronLeft, Video as VideoIcon, Layers, Clapperboard, BookOpen, ChevronRight } from "lucide-react";

import { MobileFrame } from "@/components/MobileFrame";

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({ meta: [{ title: "Upload — TRYNEX" }] }),
  component: CreateSelectType,
});

const TYPES = [
  { id: "video", icon: VideoIcon, label: "Video", desc: "Upload single video" },
  { id: "series", icon: Layers, label: "Web Series", desc: "Upload episodes in a series" },
  { id: "short", icon: Clapperboard, label: "Short Film", desc: "Upload your short film" },
  { id: "story", icon: BookOpen, label: "Story Episode", desc: "Upload story in parts" },
] as const;

function CreateSelectType() {
  const navigate = useNavigate();
  return (
    <MobileFrame>
      <div className="pb-12">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 pt-6">
          <button onClick={() => navigate({ to: "/" })} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface ring-1 ring-border">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-center font-display text-base font-bold">Upload Content</h1>
          <span className="w-9" />
        </header>
        <p className="mt-1 text-center text-xs text-muted-foreground">What do you want to upload?</p>

        <div className="mt-8 space-y-3 px-5">
          {TYPES.map((t) => (
            <Link
              key={t.id}
              to="/create/details"
              search={{ type: t.id }}
              className="flex items-center gap-4 rounded-2xl bg-surface p-4 ring-1 ring-border hover:bg-surface-2"
            >
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl btn-gradient">
                <t.icon className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold">{t.label}</p>
                <p className="text-[11px] text-muted-foreground">{t.desc}</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>
      </div>
    </MobileFrame>
  );
}
