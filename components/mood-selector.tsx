"use client"

import { useMood } from "@/components/mood-context"
import { moods } from "@/lib/moods"
import { Flame, Cloud, Zap, Coffee, Target, Palette } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function MoodSelector() {
  const { currentMood, setMood } = useMood()

  const moodIcons = {
    motivated: Flame,
    feelingLow: Cloud,
    energized: Zap,
    lazy: Coffee,
    focused: Target,
    creative: Palette,
  }

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-xl font-medium mb-4 transition-all duration-300">How are you feeling today?</h2>
      <div className="flex flex-wrap justify-center gap-3">
        {Object.entries(moods).map(([mood, data]) => {
          const MoodIcon = moodIcons[mood as keyof typeof moodIcons]
          return (
            <div key={mood} className="tooltip-wrapper">
              <Button
                variant={currentMood === mood ? "default" : "outline"}
                size="lg"
                className={`transition-all duration-300 ${currentMood === mood ? "scale-110" : "hover:scale-105"}`}
                onClick={() => setMood(mood as any)}
                title={data.description}
              >
                <MoodIcon className="mr-2 h-5 w-5" />
                <span className="capitalize">{data.label}</span>
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
