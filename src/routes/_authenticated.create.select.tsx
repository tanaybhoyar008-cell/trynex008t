import { useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { ChevronLeft, Film } from "lucide-react";

import { MobileFrame } from "@/components/MobileFrame";

const searchSchema = z.object({
  type: z.string().default("video"),
  title: z.string().default(""),
  desc: z.string().default(""),
  thumb: z.string().default(""),
});

export const Route = createFileRoute("/_authenticated/create/select")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Select Video — TRYNEX" }] }),
  component: SelectVideo,
});

const MOCK_FILES = [
  { name: "VID_20260520_01.mp4", quality: "720P", size: "45.6 MB" },
  { name: "VID_20260519_02.mp4", quality: "720P", size: "33.1 MB" },
  { name: "VID_20260518_03.mp4", quality: "1080P", size: "78.3 MB" },
  { name: "VID_20260517_04.mp4", quality: "720P", size: "56.2 MB" },
  { name: "VID_20260516_05.mp4", quality: "1080P", size: "65.4 MB" },
];

function SelectVideo() {
  const navigate = useNavigate();
  const params = useSearch({ from: "/_authenticated/create/select" });
  const [tab, setTab] = useState<"videos" | "gallery">("videos");
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <MobileFrame>
      <div className="pb-12">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 pt-6">
          <button onClick={() => navigate({ to: "/create/meta", search: params })} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface ring-1 ring-border">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-center font-display text-base font-bold">Select Video</h1>
          <span className="w-9" />
        </header>

        <div className="mt-4 flex gap-2 px-5">
          {(["videos", "gallery"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold ${tab === t ? "btn-gradient" : "bg-surface text-muted-foreground ring-1 ring-border"}`}>
              {t === "videos" ? "Videos" : "Gallery"}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-2 px-5">
          {MOCK_FILES.map((f) => (
            <button
              key={f.name}
              onClick={() => setSelected(f.name)}
              className={`flex w-full items-center gap-3 rounded-2xl bg-surface p-3 text-left ring-1 ${selected === f.name ? "ring-brand" : "ring-border"}`}
            >
              <div className="grid h-12 w-16 shrink-0 place-items-center rounded-xl bg-surface-2"><Film className="h-5 w-5 text-muted-foreground" /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold">{f.name}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{f.quality} · {f.size}</p>
              </div>
              <span className={`h-4 w-4 rounded-full border ${selected === f.name ? "border-brand bg-brand" : "border-muted-foreground/40"}`} />
            </button>
          ))}
        </div>

        <div className="px-5 pt-6">
          <button
            disabled={!selected}
            onClick={() => navigate({ to: "/create/uploading", search: params })}
            className="flex h-12 w-full items-center justify-center rounded-2xl btn-gradient text-sm font-semibold disabled:opacity-40"
          >Next</button>
        </div>
      </div>
    </MobileFrame>
  );
}
