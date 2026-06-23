import { useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ImagePlus, Film, Loader2, X, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { MobileFrame } from "@/components/MobileFrame";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type VideoType = Database["public"]["Enums"]["video_type"];

export const Route = createFileRoute("/_authenticated/create")({
  head: () => ({ meta: [{ title: "Upload — Texon" }] }),
  component: Create,
});

const TYPES: { id: VideoType; label: string; desc: string }[] = [
  { id: "video", label: "Video", desc: "A single video" },
  { id: "series", label: "Web Series", desc: "An episode in a series" },
  { id: "short", label: "Short Film", desc: "Your short film" },
  { id: "story", label: "Story", desc: "Story episode" },
];

function Create() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();

  const [type, setType] = useState<VideoType>("video");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [seriesTitle, setSeriesTitle] = useState("");
  const [episode, setEpisode] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [language, setLanguage] = useState("English");
  const [visibility, setVisibility] = useState<"public" | "unlisted" | "private">("public");
  const [allowComments, setAllowComments] = useState(true);

  const [thumbFile, setThumbFile] = useState<File | null>(null);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const thumbInput = useRef<HTMLInputElement>(null);
  const videoInput = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<"upload" | "process" | "publish" | "done">("upload");

  const onThumb = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setThumbFile(f); setThumbPreview(URL.createObjectURL(f));
  };
  const onVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    setVideoFile(f);
  };
  const addTag = () => {
    const t = tagInput.trim().replace(/^#?/, "#");
    if (t.length > 1 && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  };

  const publish = async () => {
    if (!title.trim()) return toast.error("Add a title");
    if (!videoFile) return toast.error("Select a video file");
    setUploading(true); setStep("upload"); setProgress(0);
    try {
      const ext = videoFile.name.split(".").pop() || "mp4";
      const videoPath = `${user.id}/${crypto.randomUUID()}.${ext}`;
      // Simulated progress (Supabase JS uploads don't expose progress)
      const tick = setInterval(() => setProgress((p) => Math.min(p + 3, 85)), 200);
      const { error: vErr } = await supabase.storage.from("videos").upload(videoPath, videoFile, { contentType: videoFile.type });
      clearInterval(tick); setProgress(90);
      if (vErr) throw vErr;

      setStep("process");
      let thumbPath: string | null = null;
      if (thumbFile) {
        const tExt = thumbFile.name.split(".").pop() || "jpg";
        const tp = `${user.id}/${crypto.randomUUID()}.${tExt}`;
        const { error: tErr } = await supabase.storage.from("thumbnails").upload(tp, thumbFile, { contentType: thumbFile.type });
        if (!tErr) thumbPath = tp;
      }

      // probe duration from selected file
      const duration = await getDuration(videoFile).catch(() => null);

      setStep("publish"); setProgress(96);
      const { data: row, error: insErr } = await supabase
        .from("videos")
        .insert({
          creator_id: user.id,
          title: title.trim(),
          description: desc.trim() || null,
          type,
          thumbnail_url: thumbPath,
          video_url: videoPath,
          duration_seconds: duration,
          language,
          tags,
          series_title: type === "series" && seriesTitle ? seriesTitle : null,
          episode_number: type === "series" && episode ? Number(episode) || null : null,
          visibility,
          allow_comments: allowComments,
        })
        .select("id")
        .single();
      if (insErr) throw insErr;

      setProgress(100); setStep("done");
      toast.success("Published!");
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      setTimeout(() => navigate({ to: "/watch/$id", params: { id: row.id } }), 600);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
      setUploading(false);
    }
  };

  if (uploading) return <UploadingView progress={progress} step={step} onCancel={() => navigate({ to: "/" })} />;

  return (
    <MobileFrame>
      <div className="pb-16">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 pt-6">
          <button onClick={() => navigate({ to: "/" })} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface ring-1 ring-border">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-center font-display text-base font-bold">Upload Content</h1>
          <span className="w-9" />
        </header>

        <div className="mt-5 grid grid-cols-2 gap-2 px-5">
          {TYPES.map((t) => (
            <button key={t.id} onClick={() => setType(t.id)}
              className={`rounded-2xl p-3 text-left ring-1 ${type === t.id ? "btn-gradient ring-transparent" : "bg-surface ring-border"}`}>
              <p className="text-xs font-bold">{t.label}</p>
              <p className={`mt-0.5 text-[10px] ${type === t.id ? "text-white/80" : "text-muted-foreground"}`}>{t.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-5 px-5">
          <label className="grid aspect-video w-full cursor-pointer place-items-center overflow-hidden rounded-2xl bg-surface ring-1 ring-dashed ring-border">
            {thumbPreview ? <img src={thumbPreview} alt="Thumb" className="h-full w-full object-cover" /> : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImagePlus className="h-7 w-7" />
                <span className="text-xs">Tap to add thumbnail</span>
              </div>
            )}
            <input ref={thumbInput} type="file" accept="image/*" className="hidden" onChange={onThumb} />
          </label>
        </div>

        <div className="mt-3 px-5">
          <button
            onClick={() => videoInput.current?.click()}
            className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left ring-1 ${videoFile ? "bg-surface ring-brand" : "bg-surface ring-border"}`}
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl btn-gradient">
              <Film className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{videoFile ? videoFile.name : "Choose video file"}</p>
              <p className="text-[10px] text-muted-foreground">{videoFile ? `${(videoFile.size / 1_048_576).toFixed(1)} MB` : "MP4, MOV, WebM"}</p>
            </div>
            <UploadCloud className="h-4 w-4 text-muted-foreground" />
          </button>
          <input ref={videoInput} type="file" accept="video/*" className="hidden" onChange={onVideo} />
        </div>

        <div className="mt-4 space-y-3 px-5">
          <Field label="Title" value={title} onChange={setTitle} placeholder="The New Beginning — Episode 1" />
          <Area label="Description" value={desc} onChange={setDesc} placeholder="What's it about?" />

          {type === "series" && (
            <>
              <Field label="Series title" value={seriesTitle} onChange={setSeriesTitle} placeholder="Series name" />
              <Field label="Episode number" value={episode} onChange={setEpisode} placeholder="1" />
            </>
          )}

          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-2 rounded-2xl bg-surface p-3 ring-1 ring-border">
              {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 rounded-full bg-brand/25 px-2.5 py-1 text-[11px] font-semibold text-brand-2">
                  {t}<button onClick={() => setTags(tags.filter((x) => x !== t))}><X className="h-3 w-3" /></button>
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

          <Select label="Language" value={language} onChange={setLanguage} options={["English", "Hindi", "Tamil", "Telugu", "Bengali"]} />
          <Select label="Visibility" value={visibility} onChange={(v) => setVisibility(v as typeof visibility)} options={["public", "unlisted", "private"]} />

          <div className="flex items-center justify-between rounded-2xl bg-surface px-4 py-3 ring-1 ring-border">
            <span className="text-sm">Allow comments</span>
            <button
              onClick={() => setAllowComments((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition ${allowComments ? "btn-gradient" : "bg-muted"}`}
              aria-label="Toggle comments"
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${allowComments ? "left-5" : "left-0.5"}`} />
            </button>
          </div>

          <button onClick={publish} className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl btn-gradient text-sm font-semibold">
            Publish
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}

function getDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => { resolve(Math.round(v.duration)); URL.revokeObjectURL(v.src); };
    v.onerror = reject;
    v.src = URL.createObjectURL(file);
  });
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="h-12 w-full rounded-2xl bg-surface px-4 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
function Area({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={3}
        className="w-full resize-none rounded-2xl bg-surface p-4 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="h-12 w-full rounded-2xl bg-surface px-4 text-sm capitalize ring-1 ring-border outline-none focus:ring-2 focus:ring-ring">
        {options.map((o) => <option key={o} value={o} className="capitalize">{o}</option>)}
      </select>
    </div>
  );
}

function UploadingView({ progress, step, onCancel }: { progress: number; step: "upload" | "process" | "publish" | "done"; onCancel: () => void }) {
  const steps = [
    { id: "upload", label: "Uploading video" },
    { id: "process", label: "Processing" },
    { id: "publish", label: "Publishing" },
    { id: "done", label: "Done" },
  ] as const;
  const stepIdx = steps.findIndex((s) => s.id === step);
  return (
    <MobileFrame>
      <div className="flex min-h-screen flex-col px-5 pb-12 pt-6">
        <h1 className="text-center font-display text-base font-bold">Uploading</h1>
        <div className="mt-10 grid place-items-center">
          <div className="relative grid h-44 w-44 place-items-center">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="44" stroke="oklch(0.27 0.06 290)" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="44" stroke="url(#g)" strokeWidth="8" fill="none"
                strokeDasharray={2 * Math.PI * 44} strokeDashoffset={(1 - progress / 100) * 2 * Math.PI * 44} strokeLinecap="round" />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="oklch(0.62 0.23 295)" /><stop offset="100%" stopColor="oklch(0.75 0.18 305)" />
                </linearGradient>
              </defs>
            </svg>
            <p className="absolute font-display text-2xl font-bold">{progress}%</p>
          </div>
        </div>
        <div className="mt-8 space-y-3">
          {steps.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-border">
              <div className={`grid h-7 w-7 place-items-center rounded-full ${i < stepIdx ? "btn-gradient" : i === stepIdx ? "bg-brand/30" : "bg-surface-2"}`}>
                {i < stepIdx ? <span className="text-xs">✓</span> : i === stepIdx ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="text-xs">{i + 1}</span>}
              </div>
              <span className={`text-sm ${i <= stepIdx ? "" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
          ))}
        </div>
        <button onClick={onCancel} className="mt-auto h-12 rounded-2xl bg-surface ring-1 ring-border text-sm font-semibold">Close</button>
      </div>
    </MobileFrame>
  );
}
