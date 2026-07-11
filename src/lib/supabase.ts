import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

function missingEnvMessage(): string {
  return [
    "Missing Supabase environment variables.",
    "Create a .env file in the project root with:",
    "  VITE_SUPABASE_URL=your-project-url",
    "  VITE_SUPABASE_ANON_KEY=your-anon-key",
    "See .env.example for reference.",
  ].join("\n");
}

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

function assertConfigured(): { url: string; anonKey: string } {
  if (!url || !anonKey) {
    if (import.meta.env.DEV) {
      console.error(missingEnvMessage());
      throw new Error(missingEnvMessage());
    }
    throw new Error("Application configuration error. Please contact the administrator.");
  }
  return { url, anonKey };
}

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (_client) return _client;
  const cfg = assertConfigured();
  _client = createClient(cfg.url, cfg.anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}
