import { useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { ChevronLeft, ImagePlus } from "lucide-react";
import { toast } from "sonner";

import { MobileFrame } from "@/components/MobileFrame";

const searchSchema = z.object({
  type: z.enum(["video", "series", "short", "story"]).default("video"),
});

export const Route = createFileRoute("/_authenticated/create/details")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Add Details — TRYNEX" }] }),
  component: Details,
});

function Details() {
  const navigate = useNavigate();
  const { type } = useSearch({ from: "/_authenticated/create/details" });
  const [thumb, setThumb] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const next = () => {
    if (!title.trim()) { toast.error("Add a title"); return; }
    navigate({ to: "/create/meta", search: { type, title, desc, thumb: thumb ?? "" } });
  };

  return (
    <MobileFrame>
      <div className="pb-12">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 pt-6">
          <button onClick={() => navigate({ to: "/create" })} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface ring-1 ring-border">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-center font-display text-base font-bold">Add Details</h1>
          <span className="w-9" />
        </header>

        <div className="mt-6 px-5">
          <label className="grid aspect-video w-full cursor-pointer place-items-center overflow-hidden rounded-2xl bg-surface ring-1 ring-dashed ring-border">
            {thumb ? <img src={thumb} alt="Thumbnail" className="h-full w-full object-cover" /> : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="h-7 w-7" />
                <span className="text-xs">Tap to add thumbnail</span>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const f = e.target.files?.[0]; if (f) setThumb(URL.createObjectURL(f));
            }} />
          </label>
          {thumb && <button onClick={() => setThumb(null)} className="mt-2 text-center text-[11px] text-brand-2 w-full">Change Thumbnail</button>}

          <div className="mt-5 space-y-3">
            <FieldText label="Title" value={title} onChange={setTitle} placeholder="The New Beginning - Episode 1" />
            <FieldArea label="Description" value={desc} onChange={setDesc} placeholder="A story of friendship, dreams and never giving up." />
          </div>

          <button onClick={next} className="mt-8 flex h-12 w-full items-center justify-center rounded-2xl btn-gradient text-sm font-semibold">
            Next
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}

function FieldText({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="h-12 w-full rounded-2xl bg-surface px-4 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
function FieldArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={4}
        className="w-full resize-none rounded-2xl bg-surface p-4 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
