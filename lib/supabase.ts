import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

let supabaseInstance: SupabaseClient | null = null;

export const supabase = (() => {
  if (typeof window === "undefined") {
    // Return a dummy client for SSR/build time
    return createClient("https://placeholder.supabase.co", "placeholder");
  }
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Missing Supabase environment variables");
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
})();

export interface Resource {
  id: string;
  title: string;
  url: string;
  tag: "Design" | "Product" | "Tech" | "Career" | "General";
  submitted_by: string;
  created_at: string;
  upvotes: number;
}

export type ResourceInsert = Omit<Resource, "id" | "created_at" | "upvotes">;
