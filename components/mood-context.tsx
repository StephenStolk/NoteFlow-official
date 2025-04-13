"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { moods } from "@/lib/moods"
import { useTheme } from "@/components/theme-provider"

type MoodType = "motivated" | "feelingLow" | "energized" | "lazy" | "focused" | "creative"

interface MoodContextType {
  currentMood: MoodType
  setMood: (mood: MoodType) => void
  moodData: (typeof moods)[MoodType]
  isTransitioning: boolean
}

const MoodContext = createContext<MoodContextType | undefined>(undefined)

interface MoodProviderProps {
  children: React.ReactNode
  onMoodChange?: (mood: string) => void
}

export function MoodProvider({ children, onMoodChange }: MoodProviderProps) {
  const [currentMood, setCurrentMood] = useState<MoodType>("motivated")
  const [previousMood, setPreviousMood] = useState<MoodType | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const { theme } = useTheme()

  const setMood = (mood: MoodType) => {
    if (mood === currentMood) return

    setIsTransitioning(true)
    setPreviousMood(currentMood)
    setCurrentMood(mood)

    // Call the onMoodChange callback if provided
    if (onMoodChange) {
      onMoodChange(mood)
    }

    if (typeof document !== "undefined") {
      // Remove all mood classes
      document.documentElement.classList.remove(
        "mood-motivated",
        "mood-feelingLow",
        "mood-energized",
        "mood-lazy",
        "mood-focused",
        "mood-creative",
      )
      // Add the new mood class
      document.documentElement.classList.add(`mood-${mood}`)

      // Also add the mood class to the body for dark mode compatibility
      document.body.classList.remove(
        "mood-motivated",
        "mood-feelingLow",
        "mood-energized",
        "mood-lazy",
        "mood-focused",
        "mood-creative",
      )
      document.body.classList.add(`mood-${mood}`)

      // Apply animation speed class
      document.documentElement.classList.remove(
        "animate-very-slow",
        "animate-slow",
        "animate-medium",
        "animate-fast",
        "animate-very-fast",
      )
      document.documentElement.classList.add(`animate-${moods[mood].animations.speed}`)

      // Trigger a mood change animation
      const moodChangeEl = document.getElementById("mood-change-animation")
      if (moodChangeEl) {
        moodChangeEl.classList.remove("hidden")
        moodChangeEl.classList.add("animate-mood-change")
        setTimeout(() => {
          moodChangeEl.classList.add("hidden")
          moodChangeEl.classList.remove("animate-mood-change")
        }, 1000)
      }

      // Apply transition effect based on mood change
      const transitionEl = document.createElement("div")
      transitionEl.className = `fixed inset-0 z-50 pointer-events-none transition-${mood}`
      document.body.appendChild(transitionEl)

      // Remove transition element after animation completes
      setTimeout(() => {
        document.body.removeChild(transitionEl)
        setIsTransitioning(false)
      }, 1500)
    }
  }

  // Apply dark mode class when theme changes
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [theme])

  useEffect(() => {
    // Set initial mood class
    setMood(currentMood)

    // Create mood change animation element if it doesn't exist
    if (typeof document !== "undefined" && !document.getElementById("mood-change-animation")) {
      const moodChangeEl = document.createElement("div")
      moodChangeEl.id = "mood-change-animation"
      moodChangeEl.className = "fixed inset-0 z-50 bg-white opacity-0 pointer-events-none hidden"
      document.body.appendChild(moodChangeEl)
    }

    // Set isTransitioning to false after initial load
    setTimeout(() => {
      setIsTransitioning(false)
    }, 1000)

    // Apply initial theme class
    if (typeof document !== "undefined") {
      const savedTheme = localStorage.getItem("theme")
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark")
      }
    }
  }, [])

  return (
    <MoodContext.Provider
      value={{
        currentMood,
        setMood,
        moodData: moods[currentMood],
        isTransitioning,
      }}
    >
      {children}
    </MoodContext.Provider>
  )
}

export function useMood() {
  const context = useContext(MoodContext)
  if (context === undefined) {
    throw new Error("useMood must be used within a MoodProvider")
  }
  return context
}
