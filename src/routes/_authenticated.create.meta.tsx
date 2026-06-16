import { useState } from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { z } from "zod";
import { ChevronLeft, X } from "lucide-react";

import { MobileFrame } from "@/components/MobileFrame";

const searchSchema = z.object({
  type: z.enum(["video", "series", "short", "story"]).default("video"),
  title: z.string().default(""),
  desc: z.string().default(""),
  thumb: z.string().default(""),
});

export const Route = createFileRoute("/_authenticated/create/meta")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Add Details — TRYNEX" }] }),
  component: Meta,
});

function Meta() {
  const navigate = useNavigate();
  const params = useSearch({ from: "/_authenticated/create/meta" });
  const [episode, setEpisode] = useState("Episode 1");
  const [tags, setTags] = useState<string[]>(["#friendship", "#college", "#drama", "#motivation"]);
  const [tagInput, setTagInput] = useState("");
  const [language, setLanguage] = useState("English");
  const [visibility, setVisibility] = useState("Public");
  const [comments, setComments] = useState(true);

  const addTag = () => {
    const t = tagInput.trim().replace(/^#?/, "#");
    if (t.length > 1 && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  return (
    <MobileFrame>
      <div className="pb-12">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 pt-6">
          <button onClick={() => navigate({ to: "/create/details", search: { type: params.type } })} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface ring-1 ring-border">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-center font-display text-base font-bold">Add Details</h1>
          <span className="w-9" />
        </header>

        <div className="mt-6 space-y-4 px-5">
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Episode Number</p>
            <input value={episode} onChange={(e) => setEpisode(e.target.value)}
              className="h-12 w-full rounded-2xl bg-surface px-4 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-ring" />
          </div>

          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Tags (Optional)</p>
            <div className="flex flex-wrap gap-2 rounded-2xl bg-surface p-3 ring-1 ring-border">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 rounded-full bg-brand/25 px-2.5 py-1 text-[11px] font-semibold text-brand-2">
                  {t}
                  <button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
                </span>
              ))}
              <input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                placeholder="Add tag…"
                className="min-w-[100px] flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          <SelectField label="Language" value={language} onChange={setLanguage} options={["English", "Hindi", "Tamil", "Telugu", "Bengali"]} />
          <SelectField label="Visibility" value={visibility} onChange={setVisibility} options={["Public", "Unlisted", "Private"]} />

          <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
            <span className="text-sm">Allow Comments</span>
            <button
              onClick={() => setComments((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition ${comments ? "btn-gradient" : "bg-muted"}`}
              aria-label="Toggle comments"
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${comments ? "left-5" : "left-0.5"}`} />
            </button>
          </div>

          <button
            onClick={() => navigate({ to: "/create/select", search: params })}
            className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl btn-gradient text-sm font-semibold"
          >Next</button>
        </div>
      </div>
    </MobileFrame>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-2xl bg-surface px-4 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-ring">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}
