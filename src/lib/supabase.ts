import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Lazy-loaded singleton instance
let _supabase: SupabaseClient | null = null;

/**
 * Returns the Supabase client, lazily initializing it only when first accessed.
 * Does NOT throw on startup if env vars are missing — instead defers the error
 * to the first actual API call, allowing the app to boot even without DB config.
 */
export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a dummy client that will surface a useful error on first query
    // rather than crashing the entire app at import time.
    console.warn(
      '[supabase] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Database features will be unavailable until these are set.'
    );
    // Create a minimal client with empty credentials — calls will fail gracefully
    _supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseAnonKey || 'placeholder-key');
    return _supabase;
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

/** Direct export for backwards-compatibility — resolves lazily */
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return Reflect.get(getSupabase(), prop);
  },
});
