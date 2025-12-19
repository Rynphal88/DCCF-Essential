// src/lib/supabase/server.ts

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseServerClient: SupabaseClient | null = null;

/**
 * Returns a singleton Supabase client for server-side usage (API routes, server components, AI services).
 * Uses service URL + anon key from environment variables.
 */
export function getSupabaseServerClient(): SupabaseClient {
  if (!supabaseServerClient) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars. ' +
          'Make sure they are set in your .env.local file.'
      );
    }

    supabaseServerClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false, // server-side, no browser storage
      },
    });
  }

  return supabaseServerClient;
}
