import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { Thumbnail } from "@/components/Thumbnail";
import { supabase } from "@/integrations/supabase/client";
import { savedVideosQuery } from "@/lib/queries";
import { formatDuration } from "@/lib/format";

export const Route = createFileRoute("/watchlist")({
  head: () => ({ meta: [{ title: "Watchlist — TRYNEX" }] }),
  component: Watchlist,
});

function Watchlist() {
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => setUserId(session?.user?.id ?? null));
    return () => sub.subscription.unsubscribe();
  }, []);

  const { data: saved = [], isLoading } = useQuery({ ...savedVideosQuery(userId ?? ""), enabled: !!userId });

  return (
    <MobileFrame>
      <div className="pb-28 px-5 pt-6">
        <h1 className="font-display text-2xl font-bold">Watchlist</h1>
        <p className="text-xs text-muted-foreground">Your saved videos and series</p>

        {!userId ? (
          <EmptyCard
            title="Sign in to save videos"
            body="Create a free account to build your watchlist."
            cta={{ to: "/auth", label: "Sign in" }}
          />
        ) : isLoading ? (
          <div className="mt-5 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 animate-pulse rounded-2xl bg-surface" />)}
          </div>
        ) : saved.length === 0 ? (
          <EmptyCard
            title="Nothing saved yet"
            body="Tap Save on any video to find it here."
            cta={{ to: "/", label: "Browse home" }}
          />
        ) : (
          <div className="mt-5 space-y-3">
            {saved.map((v) => (
              <Link key={v.id} to="/watch/$id" params={{ id: v.id }} className="flex items-center gap-3 rounded-2xl bg-surface p-2 ring-1 ring-border">
                <Thumbnail src={v.thumbnail_signed_url} alt={v.title} className="h-20 w-28 shrink-0 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-semibold">{v.title}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {v.creator?.display_name ?? "Creator"}{v.duration_seconds ? ` · ${formatDuration(v.duration_seconds)}` : ""}
                  </p>
                </div>
                <Bookmark className="h-4 w-4 fill-brand-2 text-brand-2" />
              </Link>
            ))}
          </div>
        )}
      </div>
      <BottomNav />
    </MobileFrame>
  );
}

function EmptyCard({ title, body, cta }: { title: string; body: string; cta: { to: "/auth" | "/"; label: string } }) {
  return (
    <div className="mt-8 rounded-3xl bg-surface p-8 text-center ring-1 ring-border">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/20">
        <Bookmark className="h-6 w-6 text-brand-2" />
      </div>
      <h3 className="mt-4 font-display text-base font-bold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground">{body}</p>
      <Link to={cta.to} className="mt-5 inline-flex h-10 items-center rounded-full btn-gradient px-5 text-xs font-semibold">{cta.label}</Link>
    </div>
  );
}
