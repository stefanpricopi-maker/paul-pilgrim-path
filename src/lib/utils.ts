import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Lovable/Vite-safe Supabase client
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      storage: localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);
