"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props} enableSystem={true} attribute="class">
      {children}
    </NextThemesProvider>
  )
}

type Theme = "dark" | "light" | "system"

type ThemeContextType = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const useTheme = () => {
  const context = useContext(ThemeContext)

  const [themeState, setThemeState] = useState<Theme>("light")

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)

    if (typeof document !== "undefined") {
      const root = document.documentElement
      if (newTheme === "dark") {
        root.classList.add("dark")
      } else {
        root.classList.remove("dark")
      }

      // Save to localStorage
      localStorage.setItem("theme", newTheme)
    }
  }

  // Initialize from localStorage or system preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("theme") as Theme | null

      if (savedTheme) {
        setTheme(savedTheme)
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        setTheme("dark")
      }
    }
  }, [])

  if (context === undefined) {
    // Fallback implementation for when used outside provider

    return { theme: themeState, setTheme }
  }

  return context
}
