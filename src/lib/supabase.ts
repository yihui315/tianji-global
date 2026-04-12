// ─── Supabase Client ─────────────────────────────────────────────────────────
// Only used server-side (API routes). Client-side uses Supabase Browser Client.

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

// Check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceKey);
}

// Lazy-initialized admin client — only throws at first use if not configured
let _adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!_adminClient) {
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
    }
    _adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return _adminClient;
}

// Legacy export — use getSupabaseAdmin() instead; kept for backward compat
export const supabaseAdmin: SupabaseClient = (() => {
  if (!supabaseUrl || !supabaseServiceKey) {
    // Return a dummy client that will fail on use but not at import time
    return createClient('https://placeholder.supabase.co', 'placeholder', {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
})();
