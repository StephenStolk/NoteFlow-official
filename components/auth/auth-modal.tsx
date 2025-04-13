"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoginForm } from "./login-form"
import { RegisterForm } from "./register-form"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-context"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login")
  const { setIsGuest } = useAuth()

  const handleSuccess = () => {
    onClose()
  }

  const handleContinueAsGuest = () => {
    setIsGuest(true)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            {activeTab === "login" ? "Welcome Back" : "Create an Account"}
          </DialogTitle>
        </DialogHeader>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "login" | "register")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onToggleForm={() => setActiveTab("register")} onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="register">
            <RegisterForm onToggleForm={() => setActiveTab("login")} onSuccess={() => setActiveTab("login")} />
          </TabsContent>
        </Tabs>
        <div className="mt-4 pt-4 border-t">
          <Button variant="outline" className="w-full" onClick={handleContinueAsGuest}>
            Continue as Guest
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
