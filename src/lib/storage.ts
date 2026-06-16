import { supabase } from "@/integrations/supabase/client";

const ONE_YEAR = 60 * 60 * 24 * 365;

export async function signOne(bucket: string, path: string | null | undefined, ttl = ONE_YEAR): Promise<string | null> {
  if (!path) return null;
  const { data } = await supabase.storage.from(bucket).createSignedUrl(path, ttl);
  return data?.signedUrl ?? null;
}

export async function signMany(bucket: string, paths: (string | null | undefined)[], ttl = ONE_YEAR): Promise<Record<string, string>> {
  const unique = Array.from(new Set(paths.filter((p): p is string => Boolean(p))));
  if (!unique.length) return {};
  const { data } = await supabase.storage.from(bucket).createSignedUrls(unique, ttl);
  const map: Record<string, string> = {};
  data?.forEach((item) => {
    if (item.signedUrl && item.path) map[item.path] = item.signedUrl;
  });
  return map;
}

export function isExternalUrl(value: string | null | undefined): value is string {
  return !!value && /^https?:\/\//i.test(value);
}

/** Storage helpers store *paths* in DB columns. If we encounter a full URL we return it as-is. */
export async function resolveMedia(bucket: string, value: string | null | undefined): Promise<string | null> {
  if (!value) return null;
  if (isExternalUrl(value)) return value;
  return signOne(bucket, value);
}
