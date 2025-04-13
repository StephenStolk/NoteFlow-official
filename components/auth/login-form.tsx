"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface LoginFormProps {
  onToggleForm?: () => void
  onSuccess?: () => void
  onError?: (error: any) => void
}

export function LoginForm({ onToggleForm, onSuccess, onError }: LoginFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const { signIn, signInWithOtp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setMagicLinkSent(false)

    try {
      const { error, needsEmailConfirmation } = await signIn(email, password)

      if (error) {
        // If the error is "Email not confirmed", we'll handle it specially
        if (error.message === "Email not confirmed") {
          await handleMagicLinkLogin()
        } else {
          setError(error.message || "Failed to sign in")
          onError?.(error)
        }
      } else if (needsEmailConfirmation) {
        setMagicLinkSent(true)
      } else {
        onSuccess?.()
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      onError?.(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLinkLogin = async () => {
    setIsLoading(true)
    try {
      await signInWithOtp(email)
      setMagicLinkSent(true)
    } catch (err) {
      console.error("Failed to send magic link:", err)
      setError("Failed to send magic link. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {magicLinkSent ? (
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertTitle>Check your email</AlertTitle>
          <AlertDescription>
            We've sent a magic link to {email}. Click the link in the email to sign in.
          </AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Button
                variant="link"
                className="p-0 h-auto text-xs"
                type="button"
                onClick={() => (email ? handleMagicLinkLogin() : setError("Please enter your email first"))}
              >
                Forgot password?
              </Button>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleMagicLinkLogin}
            disabled={isLoading || !email}
          >
            Sign in with magic link
          </Button>
        </form>
      )}

      {onToggleForm && !magicLinkSent && (
        <div className="text-sm text-center text-muted-foreground">
          Don't have an account?{" "}
          <Button variant="link" className="p-0 h-auto" onClick={onToggleForm}>
            Sign up
          </Button>
        </div>
      )}
    </div>
  )
}
