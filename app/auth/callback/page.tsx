// pages/auth/callback.tsx or app/auth/callback/page.tsx (depending on your Next.js version)
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowser } from "@/lib/supabase/client"

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const supabase = getSupabaseBrowser()

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard") // or wherever you want the user to land after login
      } else {
        router.push("/login")
      }
    })
  }, [router])

  return <p>Loading...</p>
}
