import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import {
  ChevronLeft, Maximize2, Minimize2, Play, Pause, Cast, PictureInPicture, MoreVertical,
  ThumbsUp, ThumbsDown, MessageCircle, Share2, Download, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

import { MobileFrame } from "@/components/MobileFrame";
import { getSeedVideo, SEED_VIDEOS } from "@/lib/seed";
import { formatCount, formatDuration, timeAgo } from "@/lib/format";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Check } from "lucide-react";

export const Route = createFileRoute("/watch/$id")({
  loader: ({ params }) => {
    const video = getSeedVideo(params.id);
    if (!video) throw notFound();
    return video;
  },
  head: ({ loaderData }) => ({
    meta: loaderData ? [
      { title: `${loaderData.title} — TRYNEX` },
      { name: "description", content: loaderData.description },
      { property: "og:title", content: loaderData.title },
      { property: "og:description", content: loaderData.description },
      { property: "og:image", content: loaderData.thumbnail_url },
    ] : [],
  }),
  notFoundComponent: () => (
    <MobileFrame>
      <div className="grid min-h-screen place-items-center p-8 text-center">
        <div>
          <p className="text-sm text-muted-foreground">Video not found</p>
          <Link to="/" className="mt-4 inline-block rounded-full btn-gradient px-5 py-2 text-sm font-semibold">Back home</Link>
        </div>
      </div>
    </MobileFrame>
  ),
  errorComponent: () => null,
  component: Watch,
});

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

function Watch() {
  const video = Route.useLoaderData();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(video.duration_seconds);
  const [fullscreen, setFullscreen] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [liked, setLiked] = useState(false);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    const v = videoRef.current; if (!v) return;
    v.playbackRate = speed;
  }, [speed]);

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current; if (!el) return;
    if (!document.fullscreenElement) { await el.requestFullscreen?.(); setFullscreen(true); }
    else { await document.exitFullscreen?.(); setFullscreen(false); }
  };

  const onTime = () => {
    const v = videoRef.current; if (!v) return;
    setCurrent(v.currentTime);
    if (v.duration) { setDuration(v.duration); setProgress((v.currentTime / v.duration) * 100); }
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current; if (!v || !v.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    v.currentTime = pct * v.duration;
  };

  const upNext = SEED_VIDEOS.find((x) => x.id !== video.id)!;

  return (
    <MobileFrame>
      <div className="pb-24">
        {/* PLAYER */}
        <div
          ref={containerRef}
          className={`relative bg-black ${fullscreen ? "aspect-auto h-screen" : "aspect-video w-full"}`}
        >
          <video
            ref={videoRef}
            src={video.video_url}
            poster={video.thumbnail_url}
            className="absolute inset-0 h-full w-full object-cover"
            onClick={togglePlay}
            onTimeUpdate={onTime}
            onLoadedMetadata={onTime}
            onEnded={() => setPlaying(false)}
            playsInline
          />

          {/* Top bar */}
          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-3">
            <button onClick={() => navigate({ to: "/" })} className="grid h-9 w-9 place-items-center rounded-full bg-black/40">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              <button className="grid h-9 w-9 place-items-center rounded-full bg-black/40"><PictureInPicture className="h-4 w-4" /></button>
              <button className="grid h-9 w-9 place-items-center rounded-full bg-black/40"><Cast className="h-4 w-4" /></button>
              <MoreSheet speed={speed} setSpeed={setSpeed} />
            </div>
          </div>

          {/* Center play */}
          {!playing && (
            <button onClick={togglePlay} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 grid h-16 w-16 place-items-center rounded-full btn-gradient">
              <Play className="h-7 w-7 fill-current" />
            </button>
          )}

          {/* Bottom controls */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-white/80">
              <span>{formatDuration(current)} / {formatDuration(duration)}</span>
              <div className="flex items-center gap-1">
                <SpeedSheet speed={speed} setSpeed={setSpeed} />
                <button onClick={toggleFullscreen} className="grid h-7 w-7 place-items-center rounded-full bg-black/40">
                  {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div onClick={seek} className="group h-1 cursor-pointer rounded-full bg-white/20">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--color-brand), var(--color-brand-2))" }} />
            </div>
          </div>
        </div>

        {!fullscreen && (
          <div className="px-5 pt-4">
            <h1 className="font-display text-lg font-bold leading-snug">{video.title}</h1>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {video.tags.map((t) => (
                <span key={t} className="rounded-full bg-accent/60 px-2 py-0.5 text-[10px] font-medium text-brand-2">{t}</span>
              ))}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {formatCount(video.views)} views · {timeAgo(video.created_at)}
            </p>

            {/* Actions */}
            <div className="mt-4 grid grid-cols-5 gap-1 text-center text-[10px] text-muted-foreground">
              <Action icon={ThumbsUp} label={formatCount(video.likes + (liked ? 1 : 0))} active={liked} onClick={() => setLiked((v) => !v)} />
              <Action icon={ThumbsDown} label="Dislike" />
              <Action icon={MessageCircle} label={formatCount(video.comments)} />
              <Action icon={Share2} label="Share" onClick={() => {
                if (navigator.share) navigator.share({ title: video.title, url: window.location.href }).catch(() => {});
                else { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }
              }} />
              <Action icon={Download} label="Save" onClick={() => toast.success("Saved to your library")} />
            </div>

            {/* Creator */}
            <div className="mt-5 flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-border">
              <div
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full font-display font-bold"
                style={{ background: `linear-gradient(135deg, oklch(0.6 0.2 ${video.creator.avatar_hue}), oklch(0.5 0.2 ${video.creator.avatar_hue + 30}))` }}
              >{video.creator.display_name.charAt(0)}</div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{video.creator.display_name}</p>
                <p className="text-[11px] text-muted-foreground">{formatCount(video.creator.followers)} Followers</p>
              </div>
              <button
                onClick={() => { setFollowed((v) => !v); toast.success(followed ? "Unfollowed" : "Following"); }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${followed ? "bg-surface-2 ring-1 ring-border" : "btn-gradient"}`}
              >{followed ? "Following" : "Follow"}</button>
            </div>

            {/* Up next */}
            <div className="mt-6">
              <h3 className="mb-2 font-display text-sm font-bold text-muted-foreground">Up Next</h3>
              <Link to="/watch/$id" params={{ id: upNext.id }} className="flex items-center gap-3 rounded-2xl bg-surface p-2 ring-1 ring-border">
                <img src={upNext.thumbnail_url} alt={upNext.title} className="h-16 w-24 shrink-0 rounded-xl object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-semibold">{upNext.title}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{formatDuration(upNext.duration_seconds)}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </MobileFrame>
  );
}

function Action({ icon: Icon, label, onClick, active }: { icon: typeof ThumbsUp; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <Icon className={`h-5 w-5 ${active ? "text-brand-2" : ""}`} />
      <span>{label}</span>
    </button>
  );
}

function SpeedSheet({ speed, setSpeed }: { speed: number; setSpeed: (n: number) => void }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="rounded-full bg-black/40 px-2 py-1 text-[11px] font-semibold">{speed}x</button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-[480px] border-t border-border bg-surface">
        <div className="px-2 py-3">
          <p className="mb-2 px-3 text-xs font-semibold text-muted-foreground">Playback speed</p>
          {SPEEDS.map((s) => (
            <button key={s} onClick={() => setSpeed(s)} className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 hover:bg-surface-2">
              <span className="text-sm">{s === 1 ? "Normal" : `${s}x`}</span>
              {speed === s && <Check className="h-4 w-4 text-brand-2" />}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function MoreSheet({ speed, setSpeed }: { speed: number; setSpeed: (n: number) => void }) {
  const items = [
    { label: "Quality", value: "1080P" },
    { label: "Speed", value: speed === 1 ? "Normal" : `${speed}x` },
    { label: "Report" },
    { label: "Download" },
    { label: "Save" },
    { label: "Help & Feedback" },
  ];
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button className="grid h-9 w-9 place-items-center rounded-full bg-black/40" aria-label="More"><MoreVertical className="h-4 w-4" /></button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto max-w-[480px] border-t border-border bg-surface">
        <div className="px-2 py-3">
          {items.map((it) => (
            <button
              key={it.label}
              onClick={() => {
                if (it.label === "Speed") { const next = SPEEDS[(SPEEDS.indexOf(speed as 1) + 1) % SPEEDS.length]; setSpeed(next); }
                else toast.info(it.label);
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-3 hover:bg-surface-2"
            >
              <span className="text-sm">{it.label}</span>
              {it.value && <span className="text-xs text-muted-foreground">{it.value}</span>}
            </button>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
