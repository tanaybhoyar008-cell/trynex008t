import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronRight, History, Heart, Bookmark, Wallet, Settings, LogOut, Pencil, Upload, Film, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { Avatar } from "@/components/Avatar";
import { Thumbnail } from "@/components/Thumbnail";
import { supabase } from "@/integrations/supabase/client";
import { profileByIdQuery, userVideosQuery } from "@/lib/queries";
import { formatCount } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — TRYNEX" }] }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const { data: profile } = useQuery(profileByIdQuery(user.id));
  const { data: myVideos = [] } = useQuery(userVideosQuery(user.id));

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const items = [
    { icon: History, label: "Watch History", to: "/profile" as const },
    { icon: Heart, label: "Liked Videos", to: "/profile" as const },
    { icon: Bookmark, label: "Saved Videos", to: "/watchlist" as const },
    { icon: Wallet, label: "Earnings & Analytics", to: "/analytics" as const },
    { icon: Settings, label: "Settings", to: "/profile/edit" as const },
  ];

  return (
    <MobileFrame>
      <div className="pb-28">
        <div className="flex items-center gap-4 px-5 pt-8">
          <Avatar src={profile?.avatar_signed_url} name={profile?.display_name ?? user.email ?? "U"} size={64} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-bold">{profile?.display_name ?? "Creator"}</p>
            <p className="truncate text-xs text-muted-foreground">@{profile?.username ?? "you"}</p>
            {profile?.bio && <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{profile.bio}</p>}
          </div>
          <Link
            to="/profile/edit"
            aria-label="Edit profile"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface ring-1 ring-border"
          >
            <Pencil className="h-4 w-4" />
          </Link>
        </div>

        <div className="mx-5 mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-surface p-4 ring-1 ring-border">
          <Stat label="Posts" value={formatCount(profile?.posts_count ?? 0)} />
          <Stat label="Followers" value={formatCount(profile?.followers_count ?? 0)} />
          <Stat label="Following" value={formatCount(profile?.following_count ?? 0)} />
        </div>

        <div className="mt-6 px-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold">My Uploads</h3>
            <Link to="/create" className="flex items-center gap-1 text-[11px] text-brand-2">
              <Upload className="h-3 w-3" /> Upload new
            </Link>
          </div>
          {myVideos.length === 0 ? (
            <div className="mt-3 rounded-2xl bg-surface p-6 text-center ring-1 ring-border">
              <Film className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-2 text-xs text-muted-foreground">No uploads yet. Tap “Upload new” to publish your first.</p>
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {myVideos.map((v) => (
                <Link key={v.id} to="/watch/$id" params={{ id: v.id }} className="overflow-hidden rounded-xl">
                  <Thumbnail src={v.thumbnail_signed_url} alt={v.title} className="aspect-[3/4] w-full" />
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mx-5 mt-6 rounded-2xl bg-surface ring-1 ring-border">
          {items.map((it, idx) => (
            <Link
              key={it.label}
              to={it.to}
              className={`flex w-full items-center gap-3 px-4 py-3.5 ${idx < items.length - 1 ? "border-b border-border" : ""}`}
            >
              <it.icon className="h-4 w-4 text-brand-2" />
              <span className="flex-1 text-sm">{it.label}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          ))}
        </div>

        <button onClick={handleSignOut} className="mx-5 mt-5 flex w-[calc(100%-2.5rem)] items-center justify-center gap-2 rounded-2xl bg-surface px-4 py-3 text-sm font-semibold text-destructive ring-1 ring-border">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="font-display text-lg font-bold">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}
