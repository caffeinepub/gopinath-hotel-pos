// Supabase client stub — @supabase/supabase-js is not bundled.
// All functions return null/false when unconfigured.

const STORAGE_KEY_URL = "gopinath_supabase_url";
const STORAGE_KEY_KEY = "gopinath_supabase_anon_key";

function getConfig() {
  return {
    url: localStorage.getItem(STORAGE_KEY_URL) ?? "",
    key: localStorage.getItem(STORAGE_KEY_KEY) ?? "",
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getConfig();
  return url.startsWith("https://") && key.length > 20;
}

export function saveSupabaseConfig(url: string, key: string) {
  localStorage.setItem(STORAGE_KEY_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_KEY, key.trim());
  window.location.reload();
}

export function getSupabaseConfig() {
  return getConfig();
}

// Supabase client is null — package not available in this build.
// To enable Supabase, add @supabase/supabase-js to package.json and rebuild.
export const supabase: null = null;
