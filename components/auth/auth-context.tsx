"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import type { User, Session } from "@supabase/supabase-js"
import { getSupabaseBrowser } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
  isGuest: boolean
  signIn: (email: string, password: string) => Promise<{ error: any; needsEmailConfirmation?: boolean }>
  signUp: (email: string, password: string) => Promise<{ error: any; data: any; needsEmailConfirmation?: boolean }>
  signInWithOtp: (email: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
  setIsGuest: (value: boolean) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    // Check if user is already in guest mode from localStorage
    const storedGuestMode = localStorage.getItem("isGuestMode")
    if (storedGuestMode === "true") {
      setIsGuest(true)
    }

    const supabase = getSupabaseBrowser()

    const getSession = async () => {
      setIsLoading(true)

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          setSession(session)
          setUser(session.user)
          setIsGuest(false)
        }
      } catch (error) {
        console.error("Error getting session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state changed:", event, session)

      if (session) {
        setSession(session)
        setUser(session.user)
        setIsGuest(false)

        if (event === "SIGNED_IN") {
          toast({
            title: "Signed in successfully",
            description: "Welcome to NoteFlow!",
          })
        }
      } else {
        setSession(null)
        setUser(null)
        // Don't set isGuest to true here, as the user might be in guest mode

        if (event === "SIGNED_OUT") {
          toast({
            title: "Signed out",
            description: "You have been signed out of your account.",
          })
        }
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [toast])

  const signIn = async (email: string, password: string) => {
    const supabase = getSupabaseBrowser()
    console.log("Signing in with:", email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (!error) {
      console.log("Sign in successful:", data)
    } else {
      console.error("Sign in error:", error)

      // Check if the error is due to email not being confirmed
      if (error.message === "Email not confirmed") {
        // Send a magic link instead
        await signInWithOtp(email)
        return { error: null, needsEmailConfirmation: true }
      }
    }

    return { error }
  }

  const signUp = async (email: string, password: string) => {
    const supabase = getSupabaseBrowser()
    console.log("Signing up with:", email)
    const redirectTo = process.env.NEXT_PUBLIC_SITE_URL + "/auth/callback"
    


    // Sign up with auto-confirm disabled
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          email_confirmed: false,
        },
      },
    })

    if (!error) {
      console.log("Sign up successful:", data)

      // If no session is returned, email confirmation is required
      if (!data.session) {
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account.",
        })
        return { data, error: null, needsEmailConfirmation: true }
      } else {
        toast({
          title: "Account created",
          description: "You are now signed in!",
        })
      }
    } else {
      console.error("Sign up error:", error)

      // If the error is that the user already exists, try to sign in with OTP
      if (error.message.includes("already registered")) {
        await signInWithOtp(email)
        return { data: null, error: null, needsEmailConfirmation: true }
      }
    }

    return { data, error }
  }

  const signInWithOtp = async (email: string) => {
    const supabase = getSupabaseBrowser()
    const redirectTo = process.env.NEXT_PUBLIC_SITE_URL + "/auth/callback"
    console.log("Sending magic link to:", email)

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
      },
    })

    if (!error) {
      toast({
        title: "Magic link sent",
        description: "Check your email for a login link.",
      })
    } else {
      console.error("Error sending magic link:", error)
      toast({
        title: "Error",
        description: "Failed to send magic link. Please try again.",
        variant: "destructive",
      })
    }

    return { error }
  }

  const signOut = async () => {
    const supabase = getSupabaseBrowser()
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
  }

  const handleSetIsGuest = (value: boolean) => {
    setIsGuest(value)
    if (value) {
      localStorage.setItem("isGuestMode", "true")
    } else {
      localStorage.removeItem("isGuestMode")
    }
  }

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    isGuest,
    signIn,
    signUp,
    signInWithOtp,
    signOut,
    setIsGuest: handleSetIsGuest,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
