"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Mail } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface RegisterFormProps {
  onToggleForm?: () => void
  onSuccess?: () => void
  onError?: (error: any) => void
}

export function RegisterForm({ onToggleForm, onSuccess, onError }: RegisterFormProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error, needsEmailConfirmation } = await signUp(email, password)

      if (error) {
        setError(error.message || "Failed to create account")
        onError?.(error)
      } else {
        if (needsEmailConfirmation) {
          setEmailSent(true)
        } else {
          onSuccess?.()
        }
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
      onError?.(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      {emailSent ? (
        <Alert>
          <Mail className="h-4 w-4" />
          <AlertTitle>Check your email</AlertTitle>
          <AlertDescription>
            We've sent a confirmation link to {email}. Click the link in the email to activate your account.
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>
      )}

      {onToggleForm && !emailSent && (
        <div className="text-sm text-center text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" className="p-0 h-auto" onClick={onToggleForm}>
            Sign in
          </Button>
        </div>
      )}
    </div>
  )
}
