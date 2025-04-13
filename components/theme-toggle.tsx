"use client"

import { useEffect, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const isMobile = useMobile()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    // Force the theme to update by explicitly setting it
    const newTheme = theme === "dark" ? "light" : "dark"
    setTheme(newTheme)

    // Apply the theme class directly to ensure it takes effect
    if (typeof document !== "undefined") {
      const root = document.documentElement
      if (newTheme === "dark") {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className={`rounded-full ${isMobile ? "w-8 h-8" : "w-10 h-10"} transition-all duration-300`}
        aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      >
        {theme === "dark" ? (
          <Sun className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-yellow-400`} />
        ) : (
          <Moon className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-slate-900`} />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </motion.div>
  )
}
