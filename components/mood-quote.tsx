"use client"

import { useMood } from "@/components/mood-context"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { QuoteIcon } from "lucide-react"
import { useMobile } from "@/hooks/use-mobile"

const moodQuotes = {
  motivated: [
    "The only way to do great work is to love what you do.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Believe you can and you're halfway there.",
    "Your limitation—it's only your imagination.",
    "Push yourself, because no one else is going to do it for you.",
  ],
  feelingLow: [
    "This too shall pass.",
    "You don't have to be positive all the time. It's perfectly okay to feel sad, angry, or frustrated.",
    "Even the darkest night will end and the sun will rise.",
    "Be gentle with yourself. You're doing the best you can.",
    "Sometimes the bravest thing you can do is rest.",
  ],
  energized: [
    "Your energy introduces you before you even speak.",
    "Life is like riding a bicycle. To keep your balance, you must keep moving.",
    "The higher your energy level, the more efficient your body. The better you feel.",
    "Energy and persistence conquer all things.",
    "Positive energy knows no boundaries.",
  ],
  lazy: [
    "Sometimes doing nothing is everything.",
    "Rest is not idleness, and to lie sometimes on the grass under trees on a summer's day is by no means a waste of time.",
    "The time you enjoy wasting is not wasted time.",
    "Take a break. You deserve it.",
    "Embrace the pace of your own journey.",
  ],
  focused: [
    "Concentrate all your thoughts upon the work in hand.",
    "Where focus goes, energy flows.",
    "The successful warrior is the average person, with laser-like focus.",
    "It's not that I'm so smart, it's just that I stay with problems longer.",
    "Focus on the journey, not the destination.",
  ],
  creative: [
    "Creativity is intelligence having fun.",
    "You can't use up creativity. The more you use, the more you have.",
    "Creativity involves breaking out of established patterns in order to look at things in a different way.",
    "Every child is an artist. The problem is how to remain an artist once we grow up.",
    "Creativity takes courage.",
  ],
}

export default function MoodQuote() {
  const { currentMood } = useMood()
  const [quote, setQuote] = useState("")
  const [showQuote, setShowQuote] = useState(false)
  const isMobile = useMobile()

  useEffect(() => {
    // Select a random quote from the current mood
    const quotes = moodQuotes[currentMood as keyof typeof moodQuotes]
    // For mobile, prefer shorter quotes
    let selectedQuotes = quotes
    if (isMobile) {
      selectedQuotes = quotes.filter((q) => q.length < 60)
      if (selectedQuotes.length === 0) selectedQuotes = quotes
    }

    const randomIndex = Math.floor(Math.random() * selectedQuotes.length)
    setQuote(selectedQuotes[randomIndex])

    // Show the quote when mood changes
    setShowQuote(true)

    // Hide the quote after 5 seconds
    const timer = setTimeout(() => {
      setShowQuote(false)
    }, 5000)

    return () => clearTimeout(timer)
  }, [currentMood, isMobile])

  // Get mood-specific styles
  const getQuoteStyles = () => {
    switch (currentMood) {
      case "motivated":
        return "bg-gradient-to-r from-orange-500/20 to-red-500/20 border-orange-500/30"
      case "feelingLow":
        return "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30"
      case "energized":
        return "bg-gradient-to-r from-cyan-500/20 to-green-500/20 border-cyan-500/30"
      case "lazy":
        return "bg-gradient-to-r from-amber-300/20 to-rose-300/20 border-amber-300/30"
      case "focused":
        return "bg-gradient-to-r from-gray-700/20 to-gray-900/20 border-gray-700/30"
      case "creative":
        return "bg-gradient-to-r from-pink-500/20 to-purple-500/20 border-pink-500/30"
      default:
        return "bg-muted/50 border-muted"
    }
  }

  return (
    <AnimatePresence>
      {showQuote && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="fixed z-50 left-0 right-0 mx-auto pointer-events-none"
          style={{
            top: isMobile ? "100px" : "80px",
            width: isMobile ? "85%" : "500px",
            maxWidth: "95%",
          }}
        >
          <Card className={`border shadow-lg ${getQuoteStyles()}`}>
            <CardContent className="p-2 flex items-start gap-2">
              <QuoteIcon className={`${isMobile ? "h-4 w-4" : "h-5 w-5"} text-primary mt-1 flex-shrink-0`} />
              <p className={`${isMobile ? "text-xs" : "text-base"} italic font-medium`}>{quote}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
