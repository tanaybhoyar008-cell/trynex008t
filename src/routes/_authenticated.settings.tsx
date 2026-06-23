import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ChevronRight, ChevronDown, User, Lock, LogOut, Moon, Wifi, Bell, Languages,
  ShieldCheck, UserX, Flag, Trash, Download, HardDrive, Users, UserPlus, Tv,
  Smartphone, FileText, Shield, BookOpen, ScrollText, Cookie, Info, ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";

import { MobileFrame } from "@/components/MobileFrame";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({ meta: [{ title: "Settings — Texon" }] }),
  component: Settings,
});

type ToggleKey =
  | "darkMode" | "dataSaver" | "notifications" | "privateAccount" | "approvedFollowers";

const defaults: Record<ToggleKey, boolean> = {
  darkMode: true,
  dataSaver: false,
  notifications: true,
  privateAccount: false,
  approvedFollowers: false,
};

function useToggle(key: ToggleKey) {
  const [v, setV] = useState<boolean>(() => {
    if (typeof window === "undefined") return defaults[key];
    const raw = window.localStorage.getItem(`trynex:${key}`);
    return raw === null ? defaults[key] : raw === "1";
  });
  useEffect(() => {
    window.localStorage.setItem(`trynex:${key}`, v ? "1" : "0");
  }, [v, key]);
  return [v, setV] as const;
}

function Settings() {
  const navigate = useNavigate();
  const [open, setOpen] = useState<string | null>("account");
  const [lang, setLang] = useState<string>(() =>
    typeof window === "undefined" ? "en" : window.localStorage.getItem("trynex:lang") ?? "en",
  );
  const [darkMode, setDarkMode] = useToggle("darkMode");
  const [dataSaver, setDataSaver] = useToggle("dataSaver");
  const [notifications, setNotifications] = useToggle("notifications");
  const [privateAccount, setPrivateAccount] = useToggle("privateAccount");
  const [approvedFollowers, setApprovedFollowers] = useToggle("approvedFollowers");

  useEffect(() => { window.localStorage.setItem("trynex:lang", lang); }, [lang]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth" });
  };

  const clearCache = () => {
    try {
      const keep = Object.keys(localStorage).filter((k) => k.startsWith("sb-"));
      const saved = keep.map((k) => [k, localStorage.getItem(k)] as const);
      localStorage.clear();
      saved.forEach(([k, v]) => v !== null && localStorage.setItem(k, v));
      toast.success("Cache cleared");
    } catch { toast.error("Couldn't clear cache"); }
  };

  return (
    <MobileFrame>
      <div className="pb-28">
        <header className="flex items-center gap-3 px-5 pt-6">
          <Link to="/profile" aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface ring-1 ring-border">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <h1 className="font-display text-xl font-bold">Settings</h1>
        </header>

        <Section id="account" title="Account" open={open} setOpen={setOpen}>
          <Row icon={User} label="Edit Profile" to="/profile/edit" />
          <Row icon={Lock} label="Change Password" onClick={async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user?.email) return toast.error("No email on account");
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
              redirectTo: window.location.origin + "/auth",
            });
            if (error) return toast.error(error.message);
            toast.success("Reset link sent to your email");
          }} />
          <Row icon={LogOut} label="Logout" danger onClick={handleSignOut} last />
        </Section>

        <Section id="prefs" title="App Preferences" open={open} setOpen={setOpen}>
          <ToggleRow icon={Moon} label="Dark Mode" value={darkMode} onChange={setDarkMode} />
          <ToggleRow icon={Wifi} label="Data Saver" value={dataSaver} onChange={setDataSaver} />
          <ToggleRow icon={Bell} label="Notifications" value={notifications} onChange={setNotifications} />
          <div className="flex items-center gap-3 px-4 py-3.5">
            <Languages className="h-4 w-4 text-brand-2" />
            <span className="flex-1 text-sm">Language</span>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="rounded-md bg-background px-2 py-1 text-xs ring-1 ring-border"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
            </select>
          </div>
        </Section>

        <Section id="privacy" title="Privacy & Safety" open={open} setOpen={setOpen}>
          <ToggleRow icon={ShieldCheck} label="Private Account" value={privateAccount} onChange={setPrivateAccount} />
          <Row icon={UserX} label="Blocked Users" onClick={() => toast.info("No blocked users")} />
          <Row icon={Flag} label="Report a User" onClick={() => toast.info("Open a video and tap ⋯ to report")} last />
        </Section>

        <Section id="data" title="Data & Storage" open={open} setOpen={setOpen}>
          <Row icon={Trash} label="Clear Cache" onClick={clearCache} />
          <Row icon={Download} label="Download My Data" onClick={() => toast.info("We'll email your data within 48 hours")} />
          <div className="flex items-center gap-3 px-4 py-3.5">
            <HardDrive className="h-4 w-4 text-brand-2" />
            <span className="flex-1 text-sm">Storage Used</span>
            <span className="text-xs text-muted-foreground">~ 12 MB</span>
          </div>
        </Section>

        <Section id="social" title="Social" open={open} setOpen={setOpen}>
          <Row icon={Users} label="Followers" to="/profile" />
          <Row icon={UserPlus} label="Following" to="/profile" />
          <ToggleRow icon={ShieldCheck} label="Only approved followers" value={approvedFollowers} onChange={setApprovedFollowers} />
        </Section>

        <Section id="device" title="Device & Connectivity" open={open} setOpen={setOpen}>
          <Row icon={Tv} label="Cast to TV" onClick={() => toast.info("No cast devices found")} />
          <Row icon={Smartphone} label="Connected Devices" onClick={() => toast.info("This device only")} last />
        </Section>

        <Section id="legal" title="Legal" open={open} setOpen={setOpen}>
          <Row icon={FileText} label="Terms & Conditions" to="/legal/$doc" params={{ doc: "terms" }} />
          <Row icon={Shield} label="Privacy Policy" to="/legal/$doc" params={{ doc: "privacy" }} />
          <Row icon={BookOpen} label="Community Guidelines" to="/legal/$doc" params={{ doc: "community" }} />
          <Row icon={ScrollText} label="Content Policy" to="/legal/$doc" params={{ doc: "content" }} />
          <Row icon={Cookie} label="Cookie Policy" to="/legal/$doc" params={{ doc: "cookies" }} />
          <Row icon={Info} label="About Texon" to="/legal/$doc" params={{ doc: "about" }} last />
        </Section>

        <p className="mt-6 text-center text-[10px] text-muted-foreground">Texon · v1.0.0</p>
      </div>
    </MobileFrame>
  );
}

function Section({
  id, title, open, setOpen, children,
}: { id: string; title: string; open: string | null; setOpen: (v: string | null) => void; children: React.ReactNode }) {
  const isOpen = open === id;
  return (
    <div className="mx-5 mt-4">
      <button
        onClick={() => setOpen(isOpen ? null : id)}
        className="flex w-full items-center justify-between rounded-2xl bg-surface px-4 py-3 ring-1 ring-border"
      >
        <span className="font-display text-sm font-bold">{title}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="mt-2 overflow-hidden rounded-2xl bg-surface ring-1 ring-border">
          {children}
        </div>
      )}
    </div>
  );
}

type RowProps = {
  icon: typeof User;
  label: string;
  danger?: boolean;
  last?: boolean;
} & ({ to: string; params?: Record<string, string>; onClick?: never } | { onClick: () => void; to?: never; params?: never });

function Row({ icon: Icon, label, danger, last, to, params, onClick }: RowProps) {
  const cls = `flex w-full items-center gap-3 px-4 py-3.5 text-left ${last ? "" : "border-b border-border"} ${danger ? "text-destructive" : ""}`;
  const inner = (
    <>
      <Icon className={`h-4 w-4 ${danger ? "text-destructive" : "text-brand-2"}`} />
      <span className="flex-1 text-sm">{label}</span>
      <ChevronRight className="h-4 w-4 text-muted-foreground" />
    </>
  );
  if (to) {
    return (
      <Link to={to as any} params={params as any} className={cls}>{inner}</Link>
    );
  }
  return <button onClick={onClick} className={cls}>{inner}</button>;
}

function ToggleRow({
  icon: Icon, label, value, onChange,
}: { icon: typeof User; label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center gap-3 border-b border-border px-4 py-3.5 last:border-b-0">
      <Icon className="h-4 w-4 text-brand-2" />
      <span className="flex-1 text-sm">{label}</span>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        className={`relative h-6 w-11 rounded-full transition-colors ${value ? "bg-brand" : "bg-border"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${value ? "left-[22px]" : "left-0.5"}`} />
      </button>
    </div>
  );
}
