import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { env } from './env.js';

let supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (supabaseAdmin) return supabaseAdmin;

  const supabaseUrl = env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase URL and Service Role Key must be configured on the backend.');
  }

  supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return supabaseAdmin;
}

/**
 * Scopes database queries to a specific firm_id for multi-tenant isolation.
 */
export function scopeFirm<T extends Record<string, any>>(data: T, firmId: string): T & { firm_id: string } {
  return {
    ...data,
    firm_id: firmId,
  };
}
