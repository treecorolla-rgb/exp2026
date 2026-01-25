import { createClient } from '@supabase/supabase-js';

// Safely access environment variables using type assertion and optional chaining
// This prevents the "Cannot read properties of undefined" error if env is missing
const env = (import.meta as any).env;

const supabaseUrl = env?.VITE_SUPABASE_URL;
const supabaseAnonKey = env?.VITE_SUPABASE_ANON_KEY;

// Only export client if keys are present
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;
