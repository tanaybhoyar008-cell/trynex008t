import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Bell, Play, ChevronRight } from "lucide-react";

import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { Logo } from "@/components/Logo";
import { SEED_VIDEOS } from "@/lib/seed";
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

const TABS = ["For You", "Web Series", "Short Films", "Movies"] as const;

function Home() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("For You");
  const hero = SEED_VIDEOS[0];
  const trending = SEED_VIDEOS.slice(2, 6);
  const topSeries = SEED_VIDEOS.filter((v) => v.type === "series");

  return (
    <MobileFrame>
      <div className="pb-28">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-5 pt-6">
          <Logo className="text-2xl" />
          <div className="flex items-center gap-2">
            <button aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full bg-surface ring-1 ring-border">
              <Search className="h-4 w-4" />
            </button>
            <button aria-label="Notifications" className="grid h-10 w-10 place-items-center rounded-full bg-surface ring-1 ring-border">
              <Bell className="h-4 w-4" />
            </button>
          </div>
        </header>

        <div className="scrollbar-hide mt-5 flex gap-2 overflow-x-auto px-5">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                tab === t ? "btn-gradient" : "bg-surface text-muted-foreground ring-1 ring-border"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* HERO */}
        <Link to="/watch/$id" params={{ id: hero.id }} className="mt-5 block px-5">
          <div className="relative overflow-hidden rounded-3xl shadow-card">
            <img src={hero.thumbnail_url} alt={hero.title} className="aspect-[16/10] w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <span className="rounded-full bg-brand/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                Trynex Original
              </span>
              <h2 className="mt-2 font-display text-xl font-bold leading-tight">{hero.title}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{hero.description}</p>
            </div>
            <div className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full btn-gradient">
              <Play className="h-5 w-5 fill-current" />
            </div>
          </div>
        </Link>

        {/* TRENDING */}
        <Section title="Trending Now" />
        <div className="scrollbar-hide flex gap-3 overflow-x-auto px-5 pb-2">
          {trending.map((v) => (
            <Link key={v.id} to="/watch/$id" params={{ id: v.id }} className="w-32 shrink-0">
              <div className="relative overflow-hidden rounded-2xl">
                <img src={v.thumbnail_url} alt={v.title} className="aspect-[3/4] w-full object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <p className="line-clamp-1 text-[11px] font-semibold">{v.series_title ?? v.title}</p>
                  <p className="text-[10px] text-muted-foreground">EP {v.episode_number ?? 1}</p>
                </div>
              </div>
              <p className="mt-1.5 text-[10px] text-muted-foreground">{formatCount(v.views)} views</p>
            </Link>
          ))}
        </div>

        {/* TOP WEB SERIES */}
        <Section title="Top Web Series" />
        <div className="scrollbar-hide flex gap-3 overflow-x-auto px-5 pb-4">
          {topSeries.map((v) => (
            <Link key={v.id} to="/watch/$id" params={{ id: v.id }} className="w-28 shrink-0">
              <div className="overflow-hidden rounded-xl">
                <img src={v.thumbnail_url} alt={v.title} className="aspect-square w-full object-cover" loading="lazy" />
              </div>
              <p className="mt-1.5 line-clamp-1 text-[11px] font-medium">{v.series_title}</p>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
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
