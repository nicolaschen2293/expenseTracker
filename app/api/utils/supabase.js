import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

// Use this for public/server-side service (no user)
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Use this to create a client with a user token for RLS
export const createSupabaseClientWithToken = (token) => {
  return createClient(SUPABASE_URL, SUPABASE_KEY, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};