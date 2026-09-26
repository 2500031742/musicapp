import { createClient } from "@supabase/supabase-js";

// Fallback: If .env fails to read, use direct string
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://your-project-id.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "paste_your_long_anon_key_here";

console.log("Supabase URL loaded:", supabaseUrl ? "Found" : "MISSING");
console.log("Supabase Key loaded:", supabaseAnonKey ? "Found" : "MISSING");

export const supabase = createClient(supabaseUrl, supabaseAnonKey);