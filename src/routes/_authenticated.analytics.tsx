import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Film } from "lucide-react";

import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { userVideosQuery } from "@/lib/queries";
import { formatCount } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/analytics")({
  head: () => ({ meta: [{ title: "Analytics — TRYNEX" }] }),
  component: Analytics,
});

function Analytics() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const { data: videos = [] } = useQuery(userVideosQuery(user.id));

  const totals = videos.reduce(
    (acc, v) => {
      acc.views += Number(v.views ?? 0);
      acc.likes += v.likes_count;
      acc.comments += v.comments_count;
      return acc;
    },
    { views: 0, likes: 0, comments: 0 },
  );

  return (
    <MobileFrame>
      <div className="pb-28">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 pt-6">
          <button onClick={() => navigate({ to: "/profile" })} className="grid h-9 w-9 place-items-center rounded-full bg-surface ring-1 ring-border">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-center font-display text-base font-bold">Analytics</h1>
          <span className="w-9" />
        </header>

        <div className="mt-5 grid grid-cols-2 gap-3 px-5">
          <KPI label="Total Views" value={formatCount(totals.views)} />
          <KPI label="Total Likes" value={formatCount(totals.likes)} />
          <KPI label="Comments" value={formatCount(totals.comments)} />
          <KPI label="Uploads" value={String(videos.length)} highlight />
        </div>

        <div className="mt-6 px-5">
          <h3 className="mb-2 font-display text-sm font-bold">Top videos</h3>
          {videos.length === 0 ? (
            <div className="rounded-2xl bg-surface p-6 text-center ring-1 ring-border">
              <Film className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">No uploads yet — your stats appear once you publish.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {[...videos].sort((a, b) => Number(b.views) - Number(a.views)).slice(0, 10).map((v) => (
                <div key={v.id} className="flex items-center gap-3 rounded-2xl bg-surface p-2 ring-1 ring-border">
                  <div className="grid h-10 w-14 place-items-center overflow-hidden rounded-lg bg-surface-2">
                    {v.thumbnail_signed_url ? <img src={v.thumbnail_signed_url} alt="" className="h-full w-full object-cover" /> : <Film className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-semibold">{v.title}</p>
                    <p className="text-[10px] text-muted-foreground">{formatCount(v.views)} views · {formatCount(v.likes_count)} likes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}

function KPI({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 ring-1 ring-border ${highlight ? "btn-gradient text-primary-foreground" : "bg-surface"}`}>
      <p className={`text-[11px] ${highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{label}</p>
      <p className="mt-1 font-display text-xl font-bold">{value}</p>
    </div>
  );
}
