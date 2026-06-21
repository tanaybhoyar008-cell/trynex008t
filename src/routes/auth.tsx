import { useState, type FormEvent } from "react";
import { createFileRoute, useNavigate, useSearch, redirect, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Logo } from "@/components/Logo";
import { MobileFrame } from "@/components/MobileFrame";

const searchSchema = z.object({
  redirect: z.string().optional(),
}).optional();

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  beforeLoad: async ({ search }) => {
    const { data } = await supabase.auth.getSession();
    if (data.session) throw redirect({ to: (search?.redirect as string) || "/" });
  },
  head: () => ({
    meta: [
      { title: "Sign in — TRYNEX" },
      { name: "description", content: "Sign in to TRYNEX to watch and create web series, short films, and stories." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const back = () => navigate({ to: (search?.redirect as string) || "/" });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        toast.success("Welcome to TRYNEX!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
      }
      back();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin });
      if (result.error) {
        toast.error("Could not sign in with Google");
        setBusy(false);
        return;
      }
      if (result.redirected) return;
      back();
    } catch {
      toast.error("Could not sign in with Google");
      setBusy(false);
    }
  };

  return (
    <MobileFrame>
      <div className="flex min-h-screen flex-col px-6 pt-16 pb-10">
        <div className="text-center">
          <Logo className="h-14" />
          <h1 className="mt-8 font-display text-3xl font-bold">Welcome {mode === "signin" ? "back" : ""}!</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "signin" ? "Login to Continue" : "Create your TRYNEX account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-10 space-y-3">
          <Field icon={Mail} type="email" placeholder="Email / Mobile Number" value={email} onChange={setEmail} />
          <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} />

          {mode === "signin" && (
            <div className="pt-1 text-right">
              <button type="button" className="text-xs text-muted-foreground hover:text-foreground">Forgot Password?</button>
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="mt-3 flex h-12 w-full items-center justify-center rounded-2xl btn-gradient text-sm font-semibold disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "signin" ? "Login" : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" />
          <span>or</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <div className="flex items-center justify-center gap-4">
          <SocialBtn onClick={handleGoogle} aria="Continue with Google">
            <GoogleIcon />
          </SocialBtn>
          <SocialBtn onClick={() => toast.info("Facebook sign-in not enabled")} aria="Continue with Facebook">
            <span className="font-display text-lg font-black text-[#1877F2]">f</span>
          </SocialBtn>
          <SocialBtn onClick={() => toast.info("Apple sign-in not enabled")} aria="Continue with Apple">
            <AppleIcon />
          </SocialBtn>
        </div>

        <p className="mt-auto pt-10 text-center text-xs text-muted-foreground">
          {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="font-semibold text-brand-2">
            {mode === "signin" ? "Sign Up" : "Sign In"}
          </button>
        </p>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">Continue browsing without an account</Link>
        </p>
      </div>
    </MobileFrame>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange }: { icon: typeof Mail; type: string; placeholder: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex h-12 items-center gap-3 rounded-2xl bg-surface px-4 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
      />
    </label>
  );
}

function SocialBtn({ children, onClick, aria }: { children: React.ReactNode; onClick: () => void; aria: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={aria}
      className="grid h-12 w-12 place-items-center rounded-2xl bg-surface ring-1 ring-border hover:bg-surface-2"
    >
      {children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path fill="#EA4335" d="M12 11v3.2h5c-.2 1.4-1.8 4.2-5 4.2-3 0-5.5-2.5-5.5-5.4S9 7.5 12 7.5c1.7 0 2.9.7 3.6 1.3l2.4-2.3C16.5 5.1 14.5 4 12 4 7.6 4 4 7.6 4 12s3.6 8 8 8c4.6 0 7.6-3.2 7.6-7.8 0-.5 0-.9-.1-1.2H12z"/>
    </svg>
  );
}
function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 fill-foreground" aria-hidden>
      <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.9-1.4-.1-2.8.9-3.5.9-.7 0-1.9-.8-3.1-.8-1.6 0-3.1.9-3.9 2.4-1.7 2.9-.4 7.2 1.2 9.5.8 1.1 1.7 2.4 3 2.4 1.2 0 1.6-.8 3-.8 1.4 0 1.8.8 3 .8 1.3 0 2.1-1.1 2.9-2.3.9-1.3 1.3-2.6 1.3-2.7-.1 0-2.5-1-2.5-3.9zM14.2 5.6c.6-.8 1.1-1.9.9-3-1 0-2.2.6-2.8 1.4-.6.7-1.1 1.9-1 2.9 1.1.1 2.2-.5 2.9-1.3z"/>
    </svg>
  );
}
