/**
 * Supabase Admin Client
 *
 * Uses the Service Role Key to bypass RLS for admin operations.
 * This should ONLY be used on the server side.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.warn(
    '⚠️  SUPABASE_URL is not set. Database operations will fail.'
  );
}

if (!supabaseServiceRoleKey) {
  console.warn(
    '⚠️  SUPABASE_SERVICE_ROLE_KEY is not set. Database operations will fail.'
  );
}

/**
 * Supabase Admin Client
 * Uses service_role key to bypass Row Level Security
 */
export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceRoleKey || 'placeholder-key',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Check if Supabase is properly configured
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseServiceRoleKey);
}
