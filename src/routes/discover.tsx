import { createFileRoute, Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { SEED_VIDEOS } from "@/lib/seed";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "Discover — TRYNEX" }] }),
  component: Discover,
});

function Discover() {
  return (
    <MobileFrame>
      <div className="pb-28">
        <div className="px-5 pt-6">
          <h1 className="font-display text-2xl font-bold">Discover</h1>
          <div className="mt-3 flex h-11 items-center gap-2 rounded-2xl bg-surface px-3 ring-1 ring-border">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input placeholder="Search series, films, creators…" className="h-full flex-1 bg-transparent text-sm outline-none" />
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 px-5">
          {SEED_VIDEOS.map((v) => (
            <Link key={v.id} to="/watch/$id" params={{ id: v.id }} className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
              <img src={v.thumbnail_url} alt={v.title} className="aspect-[3/4] w-full object-cover" loading="lazy" />
              <div className="p-2">
                <p className="line-clamp-1 text-xs font-semibold">{v.series_title ?? v.title}</p>
                <p className="text-[10px] text-muted-foreground">{v.creator.display_name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
