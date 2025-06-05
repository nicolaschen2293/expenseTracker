import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

// Supabase credentials (Store these in .env file for security)
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

console.log("SUPABASE URL = ", SUPABASE_URL);
console.log("SUPABASE KEY = ", SUPABASE_KEY);

// Initialize Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);