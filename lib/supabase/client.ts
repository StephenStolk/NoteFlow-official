import { createClient } from "@supabase/supabase-js"

let supabaseBrowser: ReturnType<typeof createClient> | null = null

export const getSupabaseBrowser = () => {
  if (!supabaseBrowser) {
    // Use environment variables with fallbacks
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://obgxcnuledimbawapvjb.supabase.co"
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZ3hjbnVsZWRpbWJhd2FwdmpiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxNjY4NTEsImV4cCI6MjA1OTc0Mjg1MX0.gVUue7FFOKHjh5CNNvOHI6Pb07P_KYpNt6aecXOdc3A"

    supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  }
  return supabaseBrowser
}
