import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Film } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { Thumbnail } from "@/components/Thumbnail";
import { publicVideosQuery } from "@/lib/queries";

export const Route = createFileRoute("/discover")({
  head: () => ({ meta: [{ title: "Discover — Texon" }] }),
  component: Discover,
});

function Discover() {
  const [search, setSearch] = useState("");
  const { data: videos = [], isLoading } = useQuery(publicVideosQuery({ search: search.trim() || undefined }));

  return (
    <MobileFrame>
      <div className="pb-28">
        <div className="px-5 pt-6">
          <h1 className="font-display text-2xl font-bold">Discover</h1>
          <div className="mt-3 flex h-11 items-center gap-2 rounded-2xl bg-surface px-3 ring-1 ring-border">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search series, films, creators…"
              className="h-full flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="mt-5 grid grid-cols-2 gap-3 px-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-surface" />
            ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="mx-5 mt-10 rounded-3xl bg-surface p-8 text-center ring-1 ring-border">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/20">
              <Film className="h-6 w-6 text-brand-2" />
            </div>
            <h3 className="mt-4 font-display text-base font-bold">Nothing to discover yet</h3>
            <p className="mt-1 text-xs text-muted-foreground">{search ? "No results for your search." : "Be the first creator to upload."}</p>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 px-5">
            {videos.map((v) => (
              <Link key={v.id} to="/watch/$id" params={{ id: v.id }} className="overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
                <Thumbnail src={v.thumbnail_signed_url} alt={v.title} className="aspect-[3/4] w-full" />
                <div className="p-2">
                  <p className="line-clamp-1 text-xs font-semibold">{v.series_title ?? v.title}</p>
                  <p className="text-[10px] text-muted-foreground">{v.creator?.display_name ?? "Creator"}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
