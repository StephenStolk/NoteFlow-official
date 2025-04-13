import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for server-side
const supabaseUrl = "https://obgxcnuledimbawapvjb.supabase.co"
const supabaseServiceKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZ3hjbnVsZWRpbWJhd2FwdmpiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDE2Njg1MSwiZXhwIjoyMDU5NzQyODUxfQ.mTeUORb_uKdiNeDtR3ueWA1p3afxQqO8ZsamXjGuiMI"

// Create a singleton instance for server-side
let supabaseServerInstance: ReturnType<typeof createClient> | null = null

export const getSupabaseServer = () => {
  if (!supabaseServerInstance) {
    supabaseServerInstance = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
    })
  }
  return supabaseServerInstance
}
