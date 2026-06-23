import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft, Maximize2, Minimize2, Play, Pause, MoreVertical,
  ThumbsUp, MessageCircle, Share2, Bookmark, Check, Film,
  SkipBack, SkipForward,
} from "lucide-react";
import { toast } from "sonner";

import { MobileFrame } from "@/components/MobileFrame";
import { Avatar } from "@/components/Avatar";
import { Thumbnail } from "@/components/Thumbnail";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { supabase } from "@/integrations/supabase/client";
import { videoByIdQuery, videoCommentsQuery, publicVideosQuery } from "@/lib/queries";
import { formatCount, formatDuration, timeAgo } from "@/lib/format";

export const Route = createFileRoute("/watch/$id")({
  head: () => ({ meta: [{ title: "Watch — TRYNEX" }] }),
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
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: video, isLoading } = useQuery(videoByIdQuery(id));
  const { data: nextList = [] } = useQuery(publicVideosQuery());
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // increment view once per load
  useEffect(() => {
    if (!video?.id) return;
    supabase.rpc("increment_video_views", { p_video_id: video.id });
  }, [video?.id]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => { if (videoRef.current) videoRef.current.playbackRate = speed; }, [speed]);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Liked / saved / followed state
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [followed, setFollowed] = useState(false);

  useEffect(() => {
    if (!userId || !video) return;
    (async () => {
      const [{ data: l }, { data: s }, { data: f }] = await Promise.all([
        supabase.from("likes").select("video_id").eq("user_id", userId).eq("video_id", video.id).maybeSingle(),
        supabase.from("saved_videos").select("video_id").eq("user_id", userId).eq("video_id", video.id).maybeSingle(),
        video.creator?.id
          ? supabase.from("follows").select("follower_id").eq("follower_id", userId).eq("following_id", video.creator.id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      setLiked(!!l); setSaved(!!s); setFollowed(!!f);
    })();
  }, [userId, video?.id, video?.creator?.id]);

  if (isLoading) {
    return (
      <MobileFrame>
        <div className="aspect-video w-full animate-pulse bg-surface" />
        <div className="space-y-2 px-5 pt-4">
          <div className="h-5 w-3/4 animate-pulse rounded bg-surface" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
        </div>
      </MobileFrame>
    );
  }
  if (!video) {
    return (
      <MobileFrame>
        <div className="grid min-h-screen place-items-center p-8 text-center">
          <div>
            <Film className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">Video not found.</p>
            <Link to="/" className="mt-4 inline-block rounded-full btn-gradient px-5 py-2 text-sm font-semibold">Back home</Link>
          </div>
        </div>
      </MobileFrame>
    );
  }

  const togglePlay = () => {
    const v = videoRef.current; if (!v) return;
    if (v.paused) { v.play().then(() => setPlaying(true)).catch(() => {}); } else { v.pause(); setPlaying(false); }
  };
  const toggleFullscreen = async () => {
    const el = containerRef.current; if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen?.();
        setFullscreen(true);
        const orient = (screen as any).orientation;
        if (orient?.lock) { try { await orient.lock("landscape"); } catch {} }
      } else {
        const orient = (screen as any).orientation;
        if (orient?.unlock) { try { orient.unlock(); } catch {} }
        await document.exitFullscreen?.();
        setFullscreen(false);
      }
    } catch {}
  };
  const onTime = () => {
    const v = videoRef.current; if (!v) return;
    setCurrent(v.currentTime);
    if (v.duration) { setDuration(v.duration); setProgress((v.currentTime / v.duration) * 100); }
  };
  const seekFromPointer = (clientX: number, target: HTMLElement) => {
    const v = videoRef.current; if (!v || !v.duration) return;
    const rect = target.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    v.currentTime = ratio * v.duration;
  };
  const onSeekPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    seekFromPointer(e.clientX, el);
  };
  const onSeekPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      seekFromPointer(e.clientX, e.currentTarget);
    }
  };
  const skip = (delta: number) => {
    const v = videoRef.current; if (!v) return;
    v.currentTime = Math.max(0, Math.min((v.duration || 0), v.currentTime + delta));
  };

  const requireAuth = () => {
    if (!userId) { navigate({ to: "/auth", search: { redirect: window.location.pathname } }); return false; }
    return true;
  };

  const toggleLike = async () => {
    if (!requireAuth()) return;
    const next = !liked; setLiked(next);
    if (next) {
      const { error } = await supabase.from("likes").insert({ user_id: userId!, video_id: video.id });
      if (error) { setLiked(false); toast.error("Couldn't like"); }
    } else {
      await supabase.from("likes").delete().eq("user_id", userId!).eq("video_id", video.id);
    }
    queryClient.invalidateQueries({ queryKey: ["video", video.id] });
  };

  const toggleSave = async () => {
    if (!requireAuth()) return;
    const next = !saved; setSaved(next);
    if (next) {
      const { error } = await supabase.from("saved_videos").insert({ user_id: userId!, video_id: video.id });
      if (error) { setSaved(false); toast.error("Couldn't save"); }
      else toast.success("Saved to watchlist");
    } else {
      await supabase.from("saved_videos").delete().eq("user_id", userId!).eq("video_id", video.id);
    }
    queryClient.invalidateQueries({ queryKey: ["saved", userId] });
  };

  const toggleFollow = async () => {
    if (!requireAuth() || !video.creator?.id) return;
    if (video.creator.id === userId) { toast.info("That's you ✨"); return; }
    const next = !followed; setFollowed(next);
    if (next) {
      const { error } = await supabase.from("follows").insert({ follower_id: userId!, following_id: video.creator.id });
      if (error) { setFollowed(false); toast.error("Couldn't follow"); }
      else toast.success(`Following ${video.creator.display_name}`);
    } else {
      await supabase.from("follows").delete().eq("follower_id", userId!).eq("following_id", video.creator.id);
    }
  };

  const share = () => {
    if (navigator.share) navigator.share({ title: video.title, url: window.location.href }).catch(() => {});
    else { navigator.clipboard.writeText(window.location.href); toast.success("Link copied"); }
  };

  const upNext = nextList.find((x) => x.id !== video.id);

  return (
    <MobileFrame>
      <div className="pb-24">
        <div ref={containerRef} className={`relative bg-black ${fullscreen ? "aspect-auto h-screen" : "aspect-video w-full"}`}>
          {video.video_signed_url ? (
            <video
              ref={videoRef}
              src={video.video_signed_url}
              poster={video.thumbnail_signed_url ?? undefined}
              className="absolute inset-0 h-full w-full object-contain"
              onClick={togglePlay}
              onTimeUpdate={onTime}
              onLoadedMetadata={onTime}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
              playsInline
              controls={false}
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center text-xs text-white/60">Video unavailable</div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent p-3">
            <button onClick={() => navigate({ to: "/" })} className="grid h-9 w-9 place-items-center rounded-full bg-black/40">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <MoreSheet speed={speed} setSpeed={setSpeed} />
          </div>

          {video.video_signed_url && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center gap-6">
              <button
                onClick={(e) => { e.stopPropagation(); skip(-10); }}
                className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full bg-black/50 text-white"
                aria-label="Back 10 seconds"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                className="pointer-events-auto grid h-16 w-16 place-items-center rounded-full btn-gradient"
                aria-label={playing ? "Pause" : "Play"}
              >
                {playing ? <Pause className="h-7 w-7 fill-current" /> : <Play className="h-7 w-7 fill-current" />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); skip(10); }}
                className="pointer-events-auto grid h-12 w-12 place-items-center rounded-full bg-black/50 text-white"
                aria-label="Forward 10 seconds"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-white/80">
              <span>{formatDuration(current)} / {formatDuration(duration || video.duration_seconds || 0)}</span>
              <div className="flex items-center gap-1">
                <SpeedSheet speed={speed} setSpeed={setSpeed} />
                <button onClick={toggleFullscreen} className="grid h-7 w-7 place-items-center rounded-full bg-black/40">
                  {fullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
            <div
              onPointerDown={onSeekPointerDown}
              onPointerMove={onSeekPointerMove}
              className="relative -my-2 py-2 cursor-pointer touch-none"
            >
              <div className="h-1.5 rounded-full bg-white/20">
                <div className="h-full rounded-full" style={{ width: `${progress}%`, background: "linear-gradient(90deg, var(--color-brand), var(--color-brand-2))" }} />
              </div>
              <div
                className="absolute top-1/2 -translate-y-1/2 h-3 w-3 -ml-1.5 rounded-full bg-white shadow"
                style={{ left: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {!fullscreen && (
          <div className="px-5 pt-4">
            <h1 className="font-display text-lg font-bold leading-snug">{video.title}</h1>
            {video.tags?.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {video.tags.map((t: string) => (
                  <span key={t} className="rounded-full bg-accent/60 px-2 py-0.5 text-[10px] font-medium text-brand-2">{t}</span>
                ))}
              </div>
            )}
            <p className="mt-2 text-[11px] text-muted-foreground">
              {formatCount(video.views)} views · {timeAgo(video.created_at)}
            </p>

            <div className="mt-4 grid grid-cols-4 gap-1 text-center text-[10px] text-muted-foreground">
              <Action icon={ThumbsUp} label={formatCount(video.likes_count + (liked ? 1 : 0))} active={liked} onClick={toggleLike} />
              <Action icon={MessageCircle} label={formatCount(video.comments_count)} onClick={() => setShowComments(true)} />
              <Action icon={Share2} label="Share" onClick={share} />
              <Action icon={Bookmark} label={saved ? "Saved" : "Save"} active={saved} onClick={toggleSave} />
            </div>

            {video.creator && (
              <Link
                to="/profile"
                onClick={(e) => { if (video.creator?.id !== userId) e.preventDefault(); }}
                className="mt-5 flex items-center gap-3 rounded-2xl bg-surface p-3 ring-1 ring-border"
              >
                <Avatar src={video.creator.avatar_signed_url} name={video.creator.display_name} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{video.creator.display_name}</p>
                  <p className="text-[11px] text-muted-foreground">@{video.creator.username}</p>
                </div>
                {video.creator.id !== userId && (
                  <button
                    onClick={(e) => { e.preventDefault(); toggleFollow(); }}
                    className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold ${followed ? "bg-surface-2 ring-1 ring-border" : "btn-gradient"}`}
                  >{followed ? "Following" : "Follow"}</button>
                )}
              </Link>
            )}

            {upNext && (
              <div className="mt-6">
                <h3 className="mb-2 font-display text-sm font-bold text-muted-foreground">Up Next</h3>
                <Link to="/watch/$id" params={{ id: upNext.id }} className="flex items-center gap-3 rounded-2xl bg-surface p-2 ring-1 ring-border">
                  <Thumbnail src={upNext.thumbnail_signed_url} alt={upNext.title} className="h-16 w-24 shrink-0 rounded-xl" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-semibold">{upNext.title}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">{upNext.duration_seconds ? formatDuration(upNext.duration_seconds) : ""}</p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      <CommentsSheet videoId={video.id} open={showComments} onOpenChange={setShowComments} userId={userId} canComment={video.allow_comments} />
    </MobileFrame>
  );
}

function Action({ icon: Icon, label, onClick, active }: { icon: typeof ThumbsUp; label: string; onClick?: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1">
      <Icon className={`h-5 w-5 ${active ? "fill-current text-brand-2" : ""}`} />
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
    { label: "Quality", value: "Auto" },
    { label: "Speed", value: speed === 1 ? "Normal" : `${speed}x` },
    { label: "Report" },
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

function CommentsSheet({ videoId, open, onOpenChange, userId, canComment }: {
  videoId: string; open: boolean; onOpenChange: (v: boolean) => void; userId: string | null; canComment: boolean;
}) {
  const queryClient = useQueryClient();
  const { data: comments = [], isLoading } = useQuery({ ...videoCommentsQuery(videoId), enabled: open });
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    if (!userId) { onOpenChange(false); window.location.href = "/auth"; return; }
    const text = body.trim(); if (!text) return;
    setSending(true);
    const { error } = await supabase.from("comments").insert({ video_id: videoId, user_id: userId, body: text });
    setSending(false);
    if (error) { toast.error("Couldn't post comment"); return; }
    setBody("");
    queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
    queryClient.invalidateQueries({ queryKey: ["video", videoId] });
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto max-w-[480px] border-t border-border bg-surface">
        <div className="flex max-h-[70vh] flex-col">
          <div className="px-4 py-3 text-center text-sm font-semibold">Comments</div>
          <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-3">
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-surface-2" />)}
              </div>
            ) : comments.length === 0 ? (
              <p className="py-8 text-center text-xs text-muted-foreground">Be the first to comment.</p>
            ) : (
              comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <Avatar src={c.author?.avatar_signed_url} name={c.author?.display_name} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold">{c.author?.display_name ?? "Someone"} <span className="ml-1 font-normal text-muted-foreground">· {timeAgo(c.created_at)}</span></p>
                    <p className="mt-0.5 text-sm">{c.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>
          {canComment ? (
            <div className="flex items-center gap-2 border-t border-border px-3 py-3">
              <input
                value={body}
                onChange={(e) => setBody(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") send(); }}
                placeholder={userId ? "Add a comment…" : "Sign in to comment"}
                disabled={!userId || sending}
                className="h-10 flex-1 rounded-full bg-surface-2 px-4 text-sm outline-none placeholder:text-muted-foreground"
              />
              <button
                onClick={send}
                disabled={!body.trim() || sending}
                className="rounded-full btn-gradient px-4 py-2 text-xs font-semibold disabled:opacity-40"
              >Post</button>
            </div>
          ) : (
            <p className="border-t border-border py-3 text-center text-xs text-muted-foreground">Comments are disabled for this video.</p>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
