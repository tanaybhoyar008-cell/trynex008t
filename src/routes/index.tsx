import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, Play, ChevronRight, Film } from "lucide-react";

import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { Thumbnail } from "@/components/Thumbnail";
import { publicVideosQuery, type VideoCard } from "@/lib/queries";
import { formatCount } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TRYNEX — Watch web series, short films & stories" },
      { name: "description", content: "Stream original web series, short films, and creator stories on TRYNEX. Create, watch, earn." },
      { property: "og:title", content: "TRYNEX — Create. Watch. Earn." },
      { property: "og:description", content: "Stream original web series, short films, and creator stories." },
    ],
  }),
  component: Home,
});

const TABS = [
  { key: "all", label: "For You", type: undefined },
  { key: "series", label: "Web Series", type: "series" as const },
  { key: "short", label: "Short Films", type: "short" as const },
  { key: "video", label: "Movies", type: "video" as const },
];

function Home() {
  const [tabKey, setTabKey] = useState<string>("all");
  const activeTab = TABS.find((t) => t.key === tabKey) ?? TABS[0];

  const { data: videos = [], isLoading } = useQuery(publicVideosQuery({ type: activeTab.type }));
  const hero = videos[0];
  const trending = videos.slice(1, 7);
  const series = videos.filter((v) => v.type === "series");

  return (
    <MobileFrame>
      <div className="pb-28">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 pt-6">
          <Logo className="h-9" />
          <div className="flex items-center gap-2">
            <Link to="/discover" aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full bg-surface ring-1 ring-border">
              <Search className="h-4 w-4" />
            </Link>
            <Link to="/notifications" aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-full bg-surface ring-1 ring-border">
              <Bell className="h-4 w-4" />
            </Link>
          </div>
        </header>

        <div className="scrollbar-hide mt-5 flex gap-2 overflow-x-auto px-5">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTabKey(t.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                t.key === tabKey ? "btn-gradient" : "bg-surface text-muted-foreground ring-1 ring-border"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <Skeleton />
        ) : !hero ? (
          <EmptyState label={activeTab.label} />
        ) : (
          <>
            <HeroCard video={hero} />
            {trending.length > 0 && (
              <>
                <Section title="Trending Now" />
                <div className="scrollbar-hide flex gap-3 overflow-x-auto px-5 pb-2">
                  {trending.map((v) => <TrendingCard key={v.id} video={v} />)}
                </div>
              </>
            )}
            {series.length > 0 && (
              <>
                <Section title="Top Web Series" />
                <div className="scrollbar-hide flex gap-3 overflow-x-auto px-5 pb-4">
                  {series.map((v) => (
                    <Link key={v.id} to="/watch/$id" params={{ id: v.id }} className="w-28 shrink-0">
                      <Thumbnail src={v.thumbnail_signed_url} alt={v.title} className="aspect-square w-full overflow-hidden rounded-xl" />
                      <p className="mt-1.5 line-clamp-1 text-[11px] font-medium">{v.series_title ?? v.title}</p>
                    </Link>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
      <BottomNav />
    </MobileFrame>
  );
}

function HeroCard({ video }: { video: VideoCard }) {
  return (
    <Link to="/watch/$id" params={{ id: video.id }} className="mt-5 block px-5">
      <div className="relative overflow-hidden rounded-3xl shadow-card">
        <Thumbnail src={video.thumbnail_signed_url} alt={video.title} className="aspect-[16/10] w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <span className="rounded-full bg-brand/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
            {video.type === "series" ? "Web Series" : video.type === "short" ? "Short Film" : video.type === "story" ? "Story" : "Video"}
          </span>
          <h2 className="mt-2 font-display text-xl font-bold leading-tight">{video.title}</h2>
          {video.description && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{video.description}</p>}
        </div>
        <div className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full btn-gradient">
          <Play className="h-5 w-5 fill-current" />
        </div>
      </div>
    </Link>
  );
}

function TrendingCard({ video }: { video: VideoCard }) {
  return (
    <Link to="/watch/$id" params={{ id: video.id }} className="w-32 shrink-0">
      <div className="relative overflow-hidden rounded-2xl">
        <Thumbnail src={video.thumbnail_signed_url} alt={video.title} className="aspect-[3/4] w-full" />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <p className="line-clamp-1 text-[11px] font-semibold">{video.series_title ?? video.title}</p>
          {video.episode_number != null && <p className="text-[10px] text-muted-foreground">EP {video.episode_number}</p>}
        </div>
      </div>
      <p className="mt-1.5 text-[10px] text-muted-foreground">{formatCount(video.views)} views</p>
    </Link>
  );
}

function Section({ title }: { title: string }) {
  return (
    <div className="mt-6 flex items-center justify-between px-5 pb-3">
      <h3 className="font-display text-base font-bold">{title}</h3>
      <button className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
        See All <ChevronRight className="h-3 w-3" />
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="mt-5 space-y-4 px-5">
      <div className="aspect-[16/10] w-full animate-pulse rounded-3xl bg-surface" />
      <div className="flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] w-32 animate-pulse rounded-2xl bg-surface" />
        ))}
      </div>
    </div>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="mx-5 mt-10 rounded-3xl bg-surface p-8 text-center ring-1 ring-border">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/20">
        <Film className="h-6 w-6 text-brand-2" />
      </div>
      <h3 className="mt-4 font-display text-base font-bold">No {label} yet</h3>
      <p className="mt-1 text-xs text-muted-foreground">When creators publish here, you'll see it first.</p>
      <Link to="/create" className="mt-5 inline-flex h-10 items-center rounded-full btn-gradient px-5 text-xs font-semibold">
        Upload yours
      </Link>
    </div>
  );
}
