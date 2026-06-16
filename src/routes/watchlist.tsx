import { createFileRoute, Link } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { SEED_VIDEOS } from "@/lib/seed";
import { formatDuration } from "@/lib/format";

export const Route = createFileRoute("/watchlist")({
  head: () => ({ meta: [{ title: "Watchlist — TRYNEX" }] }),
  component: Watchlist,
});

function Watchlist() {
  const saved = SEED_VIDEOS.slice(0, 4);
  return (
    <MobileFrame>
      <div className="pb-28 px-5 pt-6">
        <h1 className="font-display text-2xl font-bold">Watchlist</h1>
        <p className="text-xs text-muted-foreground">Your saved videos and series</p>
        <div className="mt-5 space-y-3">
          {saved.map((v) => (
            <Link key={v.id} to="/watch/$id" params={{ id: v.id }} className="flex items-center gap-3 rounded-2xl bg-surface p-2 ring-1 ring-border">
              <img src={v.thumbnail_url} alt={v.title} className="h-20 w-28 shrink-0 rounded-xl object-cover" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-semibold">{v.title}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{v.creator.display_name} · {formatDuration(v.duration_seconds)}</p>
              </div>
              <Bookmark className="h-4 w-4 fill-brand-2 text-brand-2" />
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
