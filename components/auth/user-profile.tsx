"use client"

import { useState } from "react"
import { useAuth } from "./auth-context"
import { Button } from "@/components/ui/button"
import { AuthModal } from "./auth-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogIn, LogOut, User, UserPlus } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

export function UserProfile() {
  const { isAuthenticated, user, signOut, isGuest } = useAuth()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">("login")
  const isMobile = useMobile()

  const handleOpenLogin = () => {
    setAuthModalTab("login")
    setShowAuthModal(true)
  }

  const handleOpenRegister = () => {
    setAuthModalTab("register")
    setShowAuthModal(true)
  }

  const handleSignOut = async () => {
    await signOut()
  }

  if (isAuthenticated) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
              <User className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>{user?.email}</DropdownMenuItem>
            <DropdownMenuItem onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  }

  if (isGuest) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={handleOpenLogin}>
          {isMobile ? <LogIn className="h-4 w-4" /> : "Sign In"}
        </Button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab={authModalTab} />
      </>
    )
  }

  return (
    <>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleOpenLogin}>
          {isMobile ? <LogIn className="h-4 w-4" /> : "Sign In"}
        </Button>
        <Button variant="default" size="sm" onClick={handleOpenRegister}>
          {isMobile ? <UserPlus className="h-4 w-4" /> : "Register"}
        </Button>
      </div>
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultTab={authModalTab} />
    </>
  )
}
