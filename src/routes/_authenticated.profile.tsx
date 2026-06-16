import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Upload, Film, Clapperboard, BookOpen, History, Heart, Bookmark, Wallet, Settings, LogOut } from "lucide-react";
import { toast } from "sonner";

import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { formatCount } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — TRYNEX" }] }),
  component: Profile,
});

function Profile() {
  const navigate = useNavigate();
  const { user } = Route.useRouteContext();
  const { data: profile } = useQuery({
    queryKey: ["profile", user.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      return data;
    },
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const items = [
    { icon: Upload, label: "My Uploads" },
    { icon: Film, label: "My Series" },
    { icon: History, label: "Watch History" },
    { icon: Heart, label: "Liked Videos" },
    { icon: Bookmark, label: "Saved Videos" },
    { icon: Wallet, label: "My Earnings" },
    { icon: Settings, label: "Settings" },
  ];

  return (
    <MobileFrame>
      <div className="pb-28">
        <div className="flex items-center gap-4 px-5 pt-8">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full font-display text-xl font-black"
            style={{ background: "linear-gradient(135deg, var(--color-brand), var(--color-brand-2))" }}>
            {(profile?.display_name ?? user.email ?? "U").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-lg font-bold">{profile?.display_name ?? "Creator"}</p>
            <p className="truncate text-xs text-muted-foreground">@{profile?.username ?? "you"}</p>
            <span className="mt-1 inline-block rounded-full bg-brand/20 px-2 py-0.5 text-[10px] font-semibold text-brand-2">Creator</span>
          </div>
        </div>

        <div className="mx-5 mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-surface p-4 ring-1 ring-border">
          <Stat label="Posts" value="12" />
          <Stat label="Followers" value="2.5K" />
          <Stat label="Following" value="48" />
        </div>

        <div className="mx-5 mt-5 rounded-2xl bg-surface ring-1 ring-border">
          {items.map((it, idx) => (
            <Link
              key={it.label}
              to={it.label === "My Earnings" ? "/analytics" : "/profile"}
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
