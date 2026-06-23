import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BellOff } from "lucide-react";
import { MobileFrame } from "@/components/MobileFrame";
import { BottomNav } from "@/components/BottomNav";

export const Route = createFileRoute("/_authenticated/notifications")({
  head: () => ({ meta: [{ title: "Notifications — Texon" }] }),
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <MobileFrame>
      <div className="pb-28">
        <header className="flex items-center gap-3 px-5 pt-6">
          <Link to="/" aria-label="Back" className="grid h-10 w-10 place-items-center rounded-full bg-surface ring-1 ring-border">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-display text-lg font-bold">Notifications</h1>
        </header>

        <div className="mx-5 mt-12 rounded-3xl bg-surface p-8 text-center ring-1 ring-border">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand/20">
            <BellOff className="h-6 w-6 text-brand-2" />
          </div>
          <h3 className="mt-4 font-display text-base font-bold">You're all caught up</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            New likes, comments, and follows will appear here.
          </p>
        </div>
      </div>
      <BottomNav />
    </MobileFrame>
  );
}
