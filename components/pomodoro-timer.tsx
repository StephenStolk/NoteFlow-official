"use client"

import { useState, useEffect, useRef } from "react"
import { useMood } from "@/components/mood-context"
import { Play, Pause, RotateCcw, Bell, Settings, BellOff, Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { motion } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"

// Define alarm options
const alarmOptions = [
  { id: "chiptune", name: "Chiptune Alarm" },
  { id: "lofi", name: "Lofi Alarm" },
  { id: "retro", name: "Retro Game Alarm" },
]

export default function PomodoroTimer() {
  const { currentMood, moodData } = useMood()
  const [isActive, setIsActive] = useState(false)
  const [isPaused, setIsPaused] = useState(true)
  const [mode, setMode] = useState<"focus" | "break">("focus")
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [focusDuration, setFocusDuration] = useState(25)
  const [breakDuration, setBreakDuration] = useState(5)
  const [autoStartBreaks, setAutoStartBreaks] = useState(true)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [alarmVolume, setAlarmVolume] = useState(70)
  const [selectedAlarm, setSelectedAlarm] = useState("chiptune")
  const [customFocusDuration, setCustomFocusDuration] = useState("")
  const [customBreakDuration, setCustomBreakDuration] = useState("")
  const [showAlarmSettings, setShowAlarmSettings] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const { toast } = useToast()
  const isMobile = useMobile()

  // Calculate progress percentage
  const totalSeconds = mode === "focus" ? focusDuration * 60 : breakDuration * 60
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100

  // Format time as mm:ss
  const formatTime = () => {
    const minutes = Math.floor(secondsLeft / 60)
    const seconds = secondsLeft % 60
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  // Play alarm sound using Web Audio API
  const playAlarmSound = () => {
    if (!soundEnabled) {
      console.log("Sound disabled")
      showCompletionToast()
      return
    }

    console.log("Attempting to play alarm sound")

    // Use browser's native alert as a reliable notification
    showCompletionToast()

    // Try to play a beep sound using Web Audio API as a fallback
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      gainNode.gain.value = alarmVolume / 100
      oscillator.frequency.value = 800
      oscillator.type = "sine"

      oscillator.start()

      // Stop after 1 second
      setTimeout(() => {
        oscillator.stop()
        audioContext.close()
      }, 1000)
    } catch (error) {
      console.error("Error playing beep sound:", error)
      // Already showed toast, so no need for additional fallback
    }
  }

  // Helper function to show completion toast
  const showCompletionToast = () => {
    toast({
      title: "Timer Complete",
      description: mode === "focus" ? "Focus session complete!" : "Break time's over!",
      duration: 5000,
    })
  }

  // Test alarm sound
  const testAlarmSound = () => {
    if (!soundEnabled) {
      toast({
        title: "Sound is disabled",
        description: "Enable sound to test the alarm.",
        variant: "default",
      })
      return
    }

    toast({
      title: "Testing Alarm",
      description: "Playing alarm sound...",
    })

    // Try to play the sound
    playAlarmSound()
  }

  // Start timer
  const startTimer = () => {
    setIsActive(true)
    setIsPaused(false)

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current as NodeJS.Timeout)
          handleTimerComplete()
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  // Pause timer
  const pauseTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsPaused(true)
  }

  // Reset timer
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    setIsActive(false)
    setIsPaused(true)
    setSecondsLeft(mode === "focus" ? focusDuration * 60 : breakDuration * 60)
  }

  // Handle timer completion
  const handleTimerComplete = () => {
    // Play alarm sound
    playAlarmSound()

    if (mode === "focus") {
      toast({
        title: "Focus session complete!",
        description: "Time for a well-deserved break.",
        duration: 5000,
      })

      setMode("break")
      setSecondsLeft(breakDuration * 60)

      if (autoStartBreaks) {
        setTimeout(() => startTimer(), 1000)
      } else {
        setIsActive(false)
        setIsPaused(true)
      }
    } else {
      toast({
        title: "Break time's over!",
        description: "Ready to focus again?",
        duration: 5000,
      })

      setMode("focus")
      setSecondsLeft(focusDuration * 60)
      setIsActive(false)
      setIsPaused(true)
    }
  }

  // Change focus duration
  const handleFocusDurationChange = (value: string) => {
    const duration = Number.parseInt(value)
    setFocusDuration(duration)
    if (mode === "focus" && !isActive) {
      setSecondsLeft(duration * 60)
    }
  }

  // Change break duration
  const handleBreakDurationChange = (value: string) => {
    const duration = Number.parseInt(value)
    setBreakDuration(duration)
    if (mode === "break" && !isActive) {
      setSecondsLeft(duration * 60)
    }
  }

  // Apply custom focus duration
  const applyCustomFocusDuration = () => {
    const duration = Number.parseInt(customFocusDuration)
    if (!isNaN(duration) && duration > 0 && duration <= 120) {
      setFocusDuration(duration)
      if (mode === "focus" && !isActive) {
        setSecondsLeft(duration * 60)
      }
      setCustomFocusDuration("")
    } else {
      toast({
        title: "Invalid Duration",
        description: "Please enter a number between 1 and 120 minutes.",
        variant: "destructive",
      })
    }
  }

  // Apply custom break duration
  const applyCustomBreakDuration = () => {
    const duration = Number.parseInt(customBreakDuration)
    if (!isNaN(duration) && duration > 0 && duration <= 60) {
      setBreakDuration(duration)
      if (mode === "break" && !isActive) {
        setSecondsLeft(duration * 60)
      }
      setCustomBreakDuration("")
    } else {
      toast({
        title: "Invalid Duration",
        description: "Please enter a number between 1 and 60 minutes.",
        variant: "destructive",
      })
    }
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setAlarmVolume(newVolume)
  }

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Get mood-specific styles
  const getTimerStyles = () => {
    switch (currentMood) {
      case "motivated":
        return "from-orange-500 to-red-500"
      case "feelingLow":
        return "from-blue-400 to-purple-500"
      case "energized":
        return "from-blue-500 to-green-400"
      case "lazy":
        return "from-amber-300 to-rose-300"
      case "focused":
        return "from-gray-700 to-gray-900"
      case "creative":
        return "from-pink-400 to-purple-500"
      default:
        return "from-primary to-primary"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="transition-all duration-500">
        <CardContent className={`${isMobile ? "p-3" : "p-6"}`}>
          <h2 className={`${isMobile ? "text-lg" : "text-2xl"} font-semibold mb-4 transition-all duration-300`}>
            Pomodoro Timer
          </h2>

          <div className="flex flex-col items-center">
            <div className="w-full mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className={`text-xs font-medium ${mode === "focus" ? "text-primary" : "text-muted-foreground"}`}>
                  Focus
                </span>
                <span className={`text-xs font-medium ${mode === "break" ? "text-primary" : "text-muted-foreground"}`}>
                  Break
                </span>
              </div>
              <Progress value={progress} className={`h-2 bg-muted transition-all duration-300`} />
            </div>

            <motion.div
              className={`${isMobile ? "text-4xl" : "text-5xl"} font-bold mb-4 transition-all duration-300`}
              key={secondsLeft}
              initial={{ scale: 0.9, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {formatTime()}
            </motion.div>

            <div className="flex gap-2 mb-4">
              <Button
                onClick={isPaused ? startTimer : pauseTimer}
                className={`transition-all duration-300 hover:scale-105 ${
                  mode === "focus" ? `bg-gradient-to-r ${getTimerStyles()} hover:opacity-90` : ""
                }`}
              >
                {isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" /> Start
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" /> Pause
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={resetTimer} className="transition-all duration-300 hover:scale-105">
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-3">
              <div>
                <Label htmlFor="focus-duration" className="text-xs mb-1 block">
                  Focus Length
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={focusDuration.toString()}
                    onValueChange={handleFocusDurationChange}
                    disabled={isActive && mode === "focus"}
                  >
                    <SelectTrigger id="focus-duration" className={`${isMobile ? "text-xs" : "text-sm"}`}>
                      <SelectValue placeholder="25 minutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="25">25 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-10 w-10">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-xs">Custom Focus</h4>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="1-120"
                            value={customFocusDuration}
                            onChange={(e) => setCustomFocusDuration(e.target.value)}
                            min="1"
                            max="120"
                            className="text-xs"
                          />
                          <Button size="sm" onClick={applyCustomFocusDuration}>
                            Apply
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div>
                <Label htmlFor="break-duration" className="text-xs mb-1 block">
                  Break Length
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={breakDuration.toString()}
                    onValueChange={handleBreakDurationChange}
                    disabled={isActive && mode === "break"}
                  >
                    <SelectTrigger id="break-duration" className={`${isMobile ? "text-xs" : "text-sm"}`}>
                      <SelectValue placeholder="5 minutes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-10 w-10">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-3">
                      <div className="space-y-2">
                        <h4 className="font-medium text-xs">Custom Break</h4>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="1-60"
                            value={customBreakDuration}
                            onChange={(e) => setCustomBreakDuration(e.target.value)}
                            min="1"
                            max="60"
                            className="text-xs"
                          />
                          <Button size="sm" onClick={applyCustomBreakDuration}>
                            Apply
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between w-full gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <Switch id="auto-breaks" checked={autoStartBreaks} onCheckedChange={setAutoStartBreaks} />
                <Label htmlFor="auto-breaks" className={`${isMobile ? "text-xs" : "text-sm"}`}>
                  Auto-start breaks
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="sound" checked={soundEnabled} onCheckedChange={setSoundEnabled} />
                <Label htmlFor="sound" className={`${isMobile ? "text-xs" : "text-sm"} flex items-center`}>
                  {soundEnabled ? <Bell className="h-3 w-3 mr-1" /> : <BellOff className="h-3 w-3 mr-1" />}
                  Sound
                </Label>
              </div>
            </div>

            {/* Alarm Settings Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAlarmSettings(!showAlarmSettings)}
              className="mb-2 w-full text-xs"
            >
              {showAlarmSettings ? "Hide Alarm Settings" : "Alarm Settings"}
            </Button>

            {/* Alarm Settings Panel */}
            {showAlarmSettings && (
              <div className="w-full border rounded-md p-3 mb-3 bg-muted/10">
                <h3 className="text-sm font-medium mb-2">Alarm Sound</h3>

                <RadioGroup value={selectedAlarm} onValueChange={setSelectedAlarm} className="mb-3">
                  {alarmOptions.map((alarm) => (
                    <div key={alarm.id} className="flex items-center space-x-2">
                      <RadioGroupItem value={alarm.id} id={`alarm-${alarm.id}`} />
                      <Label htmlFor={`alarm-${alarm.id}`} className="text-xs">
                        {alarm.name}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex items-center gap-2 mb-3">
                  <Label htmlFor="alarm-volume" className="text-xs min-w-[80px]">
                    Volume: {alarmVolume}%
                  </Label>
                  <Slider
                    id="alarm-volume"
                    value={[alarmVolume]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={handleVolumeChange}
                    className="flex-1"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAlarmVolume(alarmVolume === 0 ? 70 : 0)}
                    className="h-7 w-7"
                  >
                    {alarmVolume === 0 ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={testAlarmSound}
                  className="w-full text-xs"
                  disabled={!soundEnabled}
                >
                  <Bell className="h-3 w-3 mr-1" />
                  Test Alarm Sound
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
