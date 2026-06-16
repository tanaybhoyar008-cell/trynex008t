import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { signMany, signOne, isExternalUrl } from "@/lib/storage";
import type { Database } from "@/integrations/supabase/types";

type VideoRow = Database["public"]["Tables"]["videos"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type VideoCard = VideoRow & {
  thumbnail_signed_url: string | null;
  creator: Pick<ProfileRow, "id" | "username" | "display_name" | "avatar_url"> & {
    avatar_signed_url: string | null;
  } | null;
  likes_count: number;
  comments_count: number;
};

async function hydrate(videos: VideoRow[]): Promise<VideoCard[]> {
  if (!videos.length) return [];
  const creatorIds = Array.from(new Set(videos.map((v) => v.creator_id)));
  const ids = videos.map((v) => v.id);

  const [{ data: profiles }, thumbMap, likesByVideo, commentsByVideo] = await Promise.all([
    supabase.from("profiles").select("id,username,display_name,avatar_url").in("id", creatorIds),
    signMany("thumbnails", videos.map((v) => (isExternalUrl(v.thumbnail_url) ? null : v.thumbnail_url))),
    supabase.from("likes").select("video_id").in("video_id", ids).then(({ data }) => {
      const m: Record<string, number> = {};
      data?.forEach((r) => { m[r.video_id] = (m[r.video_id] ?? 0) + 1; });
      return m;
    }),
    supabase.from("comments").select("video_id").in("video_id", ids).then(({ data }) => {
      const m: Record<string, number> = {};
      data?.forEach((r) => { m[r.video_id] = (m[r.video_id] ?? 0) + 1; });
      return m;
    }),
  ]);

  const avatarPaths = (profiles ?? []).map((p) => (isExternalUrl(p.avatar_url) ? null : p.avatar_url));
  const avatarMap = await signMany("avatars", avatarPaths);

  const profileMap: Record<string, ProfileRow> = {};
  (profiles ?? []).forEach((p) => { profileMap[p.id] = p as ProfileRow; });

  return videos.map((v) => {
    const p = profileMap[v.creator_id];
    return {
      ...v,
      thumbnail_signed_url: v.thumbnail_url
        ? (isExternalUrl(v.thumbnail_url) ? v.thumbnail_url : thumbMap[v.thumbnail_url] ?? null)
        : null,
      creator: p
        ? {
            id: p.id,
            username: p.username,
            display_name: p.display_name,
            avatar_url: p.avatar_url,
            avatar_signed_url: p.avatar_url
              ? (isExternalUrl(p.avatar_url) ? p.avatar_url : avatarMap[p.avatar_url] ?? null)
              : null,
          }
        : null,
      likes_count: likesByVideo[v.id] ?? 0,
      comments_count: commentsByVideo[v.id] ?? 0,
    };
  });
}

export function publicVideosQuery(filter?: { type?: VideoRow["type"]; search?: string }) {
  return queryOptions({
    queryKey: ["videos", "public", filter ?? {}],
    queryFn: async (): Promise<VideoCard[]> => {
      let q = supabase
        .from("videos")
        .select("*")
        .eq("visibility", "public")
        .order("created_at", { ascending: false })
        .limit(60);
      if (filter?.type) q = q.eq("type", filter.type);
      if (filter?.search) q = q.ilike("title", `%${filter.search}%`);
      const { data, error } = await q;
      if (error) throw error;
      return hydrate(data ?? []);
    },
  });
}

export function videoByIdQuery(id: string) {
  return queryOptions({
    queryKey: ["video", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("videos").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const [card] = await hydrate([data]);
      const videoSignedUrl = isExternalUrl(data.video_url)
        ? data.video_url
        : await signOne("videos", data.video_url);
      return { ...card, video_signed_url: videoSignedUrl };
    },
  });
}

export function profileByIdQuery(id: string) {
  return queryOptions({
    queryKey: ["profile", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
      if (error) throw error;
      if (!data) return null;
      const avatar_signed_url = data.avatar_url
        ? (isExternalUrl(data.avatar_url) ? data.avatar_url : await signOne("avatars", data.avatar_url))
        : null;
      const [{ count: posts }, { count: followers }, { count: following }] = await Promise.all([
        supabase.from("videos").select("id", { count: "exact", head: true }).eq("creator_id", id),
        supabase.from("follows").select("follower_id", { count: "exact", head: true }).eq("following_id", id),
        supabase.from("follows").select("following_id", { count: "exact", head: true }).eq("follower_id", id),
      ]);
      return {
        ...data,
        avatar_signed_url,
        posts_count: posts ?? 0,
        followers_count: followers ?? 0,
        following_count: following ?? 0,
      };
    },
  });
}

export function userVideosQuery(userId: string) {
  return queryOptions({
    queryKey: ["videos", "user", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .eq("creator_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return hydrate(data ?? []);
    },
  });
}

export function savedVideosQuery(userId: string) {
  return queryOptions({
    queryKey: ["saved", userId],
    queryFn: async () => {
      const { data: rows, error } = await supabase
        .from("saved_videos")
        .select("video_id, videos(*)")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      const videos = (rows ?? []).map((r) => r.videos as VideoRow).filter(Boolean);
      return hydrate(videos);
    },
  });
}

export function videoCommentsQuery(videoId: string) {
  return queryOptions({
    queryKey: ["comments", videoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comments")
        .select("id, body, created_at, user_id")
        .eq("video_id", videoId)
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      const rows = data ?? [];
      const userIds = Array.from(new Set(rows.map((r) => r.user_id)));
      const { data: profs } = await supabase
        .from("profiles")
        .select("id,username,display_name,avatar_url")
        .in("id", userIds);
      const avatarMap = await signMany(
        "avatars",
        (profs ?? []).map((p) => (isExternalUrl(p.avatar_url) ? null : p.avatar_url)),
      );
      const profMap: Record<string, ProfileRow> = {};
      (profs ?? []).forEach((p) => { profMap[p.id] = p as ProfileRow; });
      return rows.map((r) => {
        const p = profMap[r.user_id];
        return {
          ...r,
          author: p
            ? {
                display_name: p.display_name,
                username: p.username,
                avatar_signed_url: p.avatar_url
                  ? (isExternalUrl(p.avatar_url) ? p.avatar_url : avatarMap[p.avatar_url] ?? null)
                  : null,
              }
            : null,
        };
      });
    },
  });
}
