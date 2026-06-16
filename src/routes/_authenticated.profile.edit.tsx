import { useEffect, useState, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { MobileFrame } from "@/components/MobileFrame";
import { Avatar } from "@/components/Avatar";
import { supabase } from "@/integrations/supabase/client";
import { profileByIdQuery } from "@/lib/queries";

export const Route = createFileRoute("/_authenticated/profile/edit")({
  head: () => ({ meta: [{ title: "Edit Profile — TRYNEX" }] }),
  component: EditProfile,
});

function EditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = Route.useRouteContext();
  const { data: profile } = useQuery(profileByIdQuery(user.id));

  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name ?? "");
    setUsername(profile.username ?? "");
    setBio(profile.bio ?? "");
    setAvatarPreview(profile.avatar_signed_url ?? null);
  }, [profile]);

  const pickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Choose an image"); return; }
    setAvatarFile(f);
    setAvatarPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    const cleanedUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (cleanedUsername.length < 3) { toast.error("Username must be at least 3 characters (a-z, 0-9, _)"); return; }
    if (!displayName.trim()) { toast.error("Add a display name"); return; }
    setSaving(true);
    try {
      let avatarPath: string | undefined;
      if (avatarFile) {
        const ext = avatarFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${user.id}/avatar-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("avatars")
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
        if (upErr) throw upErr;
        avatarPath = path;
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          display_name: displayName.trim(),
          username: cleanedUsername,
          bio: bio.trim() || null,
          ...(avatarPath ? { avatar_url: avatarPath } : {}),
        })
        .eq("id", user.id);
      if (error) {
        if (error.code === "23505") throw new Error("That username is taken");
        throw error;
      }
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["profile", user.id] });
      navigate({ to: "/profile" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <MobileFrame>
      <div className="pb-12">
        <header className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-5 pt-6">
          <button onClick={() => navigate({ to: "/profile" })} aria-label="Back" className="grid h-9 w-9 place-items-center rounded-full bg-surface ring-1 ring-border">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h1 className="text-center font-display text-base font-bold">Edit Profile</h1>
          <span className="w-9" />
        </header>

        <div className="mt-6 grid place-items-center">
          <button onClick={() => fileRef.current?.click()} className="relative" aria-label="Change avatar">
            <Avatar src={avatarPreview} name={displayName || "U"} size={96} />
            <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full btn-gradient ring-2 ring-background">
              <Camera className="h-4 w-4" />
            </span>
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={pickFile} />
        </div>

        <div className="mt-8 space-y-4 px-5">
          <Field label="Display name" value={displayName} onChange={setDisplayName} placeholder="Your name" />
          <Field label="Username" value={username} onChange={setUsername} placeholder="username" prefix="@" />
          <div>
            <p className="mb-1.5 text-xs text-muted-foreground">Bio</p>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={160}
              placeholder="Tell people about yourself"
              className="w-full resize-none rounded-2xl bg-surface p-4 text-sm ring-1 ring-border outline-none focus:ring-2 focus:ring-ring"
            />
            <p className="mt-1 text-right text-[10px] text-muted-foreground">{bio.length}/160</p>
          </div>

          <button
            onClick={save}
            disabled={saving}
            className="flex h-12 w-full items-center justify-center rounded-2xl btn-gradient text-sm font-semibold disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
          </button>
        </div>
      </div>
    </MobileFrame>
  );
}

function Field({ label, value, onChange, placeholder, prefix }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; prefix?: string }) {
  return (
    <div>
      <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
      <div className="flex h-12 items-center rounded-2xl bg-surface px-4 ring-1 ring-border focus-within:ring-2 focus-within:ring-ring">
        {prefix && <span className="mr-1 text-sm text-muted-foreground">{prefix}</span>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
    </div>
  );
}
