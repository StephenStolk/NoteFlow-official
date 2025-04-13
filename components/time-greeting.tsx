"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { Clock } from "lucide-react"
import { motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"

export default function TimeGreeting() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const isMobile = useMobile()

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()

    if (hour >= 5 && hour < 12) {
      return "Good Morning"
    } else if (hour >= 12 && hour < 17) {
      return "Good Afternoon"
    } else if (hour >= 17 && hour < 21) {
      return "Good Evening"
    } else {
      return "Good Night"
    }
  }

  return (
    <motion.div
      className="flex flex-col items-start"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {!isMobile && (
        <motion.div
          className="text-sm font-medium"
          key={getGreeting()}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {getGreeting()}
        </motion.div>
      )}
      <div className="flex items-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        <span className="tabular-nums">{format(currentTime, isMobile ? "h:mm a" : "h:mm a, MMM d")}</span>
      </div>
    </motion.div>
  )
}
