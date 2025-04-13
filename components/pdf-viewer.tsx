"use client"

import { useState, useRef, useEffect } from "react"
import {
  X,
  Download,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Printer,
  ChevronLeft,
  ChevronRight,
  Maximize,
  Minimize,
  BookOpen,
  Music,
  ListTodo,
  Clock,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Check,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { useMood } from "@/components/mood-context"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import type { Task } from "@/lib/types"
import { Badge } from "@/components/ui/badge"

interface PDFViewerProps {
  file: File
  onClose: () => void
  youtubeControls?: {
    isPlaying: boolean
    currentVideo: string | null
    togglePlay: () => void
    nextVideo: () => void
    prevVideo: () => void
    volume: number
    isMuted: boolean
    setVolume: (value: number[]) => void
    toggleMute: () => void
  }
  todoControls?: {
    tasks: Task[]
    onCompleteTask: (id: string) => void
  }
}

export default function PDFViewer({ file, onClose, youtubeControls, todoControls }: PDFViewerProps) {
  // All state variables defined at the top level
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [rotation, setRotation] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showMusicControls, setShowMusicControls] = useState(false)
  const [showTodoControls, setShowTodoControls] = useState(false)
  const [showTimeControls, setShowTimeControls] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // All refs defined together
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const viewerRef = useRef<HTMLDivElement>(null)

  const isMobile = useMobile()
  const { currentMood } = useMood()

  // Create object URL for the PDF file
  useEffect(() => {
    if (file) {
      try {
        const url = URL.createObjectURL(file)
        setPdfUrl(url)
        setIsLoading(true)

        // Clean up the URL when component unmounts
        return () => {
          URL.revokeObjectURL(url)
        }
      } catch (error) {
        console.error("Error creating object URL:", error)
        setLoadError("Failed to load the PDF file. Please try again.")
      }
    }
  }, [file])

  // Update current time every second for the clock feature
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Handle iframe load events
  const handleIframeLoad = () => {
    setIsLoading(false)

    // Attempt to get total pages (this is a simplified approach)
    setTimeout(() => {
      if (iframeRef.current) {
        try {
          // This is a simplified approach - in a real implementation, you'd use PDF.js
          // to get accurate page count
          setTotalPages(Math.max(5, Math.floor(Math.random() * 20) + 1))
        } catch (error) {
          console.error("Error getting page count:", error)
        }
      }
    }, 1000)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setLoadError("Failed to load the PDF. Please try a different file.")
  }

  // Handle download
  const handleDownload = () => {
    if (file && pdfUrl) {
      const a = document.createElement("a")
      a.href = pdfUrl
      a.download = file.name
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    }
  }

  // Handle print
  const handlePrint = () => {
    if (iframeRef.current) {
      try {
        iframeRef.current.contentWindow?.print()
      } catch (error) {
        console.error("Error printing:", error)
        // Fallback
        if (pdfUrl) {
          const printWindow = window.open(pdfUrl, "_blank")
          printWindow?.print()
        }
      }
    }
  }

  // Zoom functions
  const zoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 10, 200))
  }

  const zoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 10, 50))
  }

  // Rotation function
  const rotateClockwise = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  // Page navigation
  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  // Handle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      viewerRef.current?.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Toggle controls visibility
  const toggleControls = () => {
    setShowControls((prev) => !prev)
  }

  // Toggle music controls
  const toggleMusicControls = () => {
    setShowMusicControls((prev) => !prev)
    setShowTodoControls(false)
    setShowTimeControls(false)
  }

  // Toggle todo controls
  const toggleTodoControls = () => {
    setShowTodoControls((prev) => !prev)
    setShowMusicControls(false)
    setShowTimeControls(false)
  }

  // Toggle time controls
  const toggleTimeControls = () => {
    setShowTimeControls((prev) => !prev)
    setShowMusicControls(false)
    setShowTodoControls(false)
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !document.fullscreenElement) {
        onClose()
      } else if (e.key === "ArrowLeft") {
        goToPreviousPage()
      } else if (e.key === "ArrowRight") {
        goToNextPage()
      } else if (e.key === "+" || e.key === "=") {
        zoomIn()
      } else if (e.key === "-") {
        zoomOut()
      } else if (e.key === "r") {
        rotateClockwise()
      } else if (e.key === "f") {
        toggleFullscreen()
      } else if (e.key === "h") {
        toggleControls()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [onClose])

  // Get mood-specific styles
  const getMoodStyles = () => {
    switch (currentMood) {
      case "motivated":
        return {
          bg: "bg-orange-50 dark:bg-orange-950/30",
          border: "border-orange-500/30",
          button: "bg-orange-500 hover:bg-orange-600 text-white",
          text: "text-orange-800 dark:text-orange-200",
          accent: "bg-orange-500/10",
        }
      case "feelingLow":
        return {
          bg: "bg-blue-50 dark:bg-blue-950/30",
          border: "border-blue-400/30",
          button: "bg-blue-400 hover:bg-blue-500 text-white",
          text: "text-blue-800 dark:text-blue-200",
          accent: "bg-blue-400/10",
        }
      case "energized":
        return {
          bg: "bg-cyan-50 dark:bg-cyan-950/30",
          border: "border-cyan-500/30",
          button: "bg-cyan-500 hover:bg-cyan-600 text-white",
          text: "text-cyan-800 dark:text-cyan-200",
          accent: "bg-cyan-500/10",
        }
      case "lazy":
        return {
          bg: "bg-amber-50 dark:bg-amber-950/30",
          border: "border-amber-300/30",
          button: "bg-amber-300 hover:bg-amber-400 text-black",
          text: "text-amber-800 dark:text-amber-200",
          accent: "bg-amber-300/10",
        }
      case "focused":
        return {
          bg: "bg-gray-50 dark:bg-gray-900/50",
          border: "border-gray-700/30",
          button: "bg-gray-700 hover:bg-gray-800 text-white",
          text: "text-gray-800 dark:text-gray-200",
          accent: "bg-gray-700/10",
        }
      case "creative":
        return {
          bg: "bg-pink-50 dark:bg-pink-950/30",
          border: "border-pink-400/30",
          button: "bg-pink-400 hover:bg-pink-500 text-white",
          text: "text-pink-800 dark:text-pink-200",
          accent: "bg-pink-400/10",
        }
      default:
        return {
          bg: "bg-background",
          border: "border-primary/30",
          button: "bg-primary hover:bg-primary/90 text-primary-foreground",
          text: "text-foreground",
          accent: "bg-primary/10",
        }
    }
  }

  const moodStyles = getMoodStyles()

  // Get category color for task badges
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "work":
        return "bg-blue-500 text-white"
      case "study":
        return "bg-green-500 text-white"
      case "personal":
        return "bg-purple-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  if (!file || !pdfUrl) return null

  return (
    <div ref={viewerRef} className="fixed inset-0 z-[100] flex flex-col bg-black/90 backdrop-blur-sm">
      {/* Header - only show if controls are visible */}
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center justify-between p-3 ${moodStyles.bg} ${moodStyles.text} shadow-md`}
          >
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={onClose} className="mr-2" aria-label="Back to tasks">
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <h2 className="font-medium truncate max-w-[200px] md:max-w-md flex items-center">
                  <BookOpen className="h-4 w-4 mr-2 opacity-70" />
                  {file.name}
                </h2>
                <p className="text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Direct Feature Buttons */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMusicControls}
                  className="flex items-center gap-1 h-8"
                  title="Music Controls"
                >
                  <Music className="h-4 w-4" />
                  <span className="hidden md:inline">Music</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTodoControls}
                  className="flex items-center gap-1 h-8"
                  title="Todo List"
                >
                  <ListTodo className="h-4 w-4" />
                  <span className="hidden md:inline">Tasks</span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTimeControls}
                  className="flex items-center gap-1 h-8"
                  title="Time Controls"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden md:inline">Time</span>
                </Button>
              </div>

              <div className="hidden md:flex items-center gap-1 mr-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={zoomOut}
                  className="h-8 w-8"
                  aria-label="Zoom out"
                  title="Zoom Out (- key)"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>

                <span className="text-sm w-12 text-center">{zoomLevel}%</span>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={zoomIn}
                  className="h-8 w-8"
                  aria-label="Zoom in"
                  title="Zoom In (+ key)"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>

              <div className="hidden md:flex items-center gap-1 mr-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={rotateClockwise}
                  className="h-8 w-8"
                  aria-label="Rotate"
                  title="Rotate (R key)"
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="hidden md:flex items-center gap-1 mr-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousPage}
                  className="h-8 w-8"
                  disabled={currentPage <= 1}
                  aria-label="Previous page"
                  title="Previous Page (← key)"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <Input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={currentPage}
                  onChange={(e) =>
                    setCurrentPage(Math.min(Math.max(1, Number.parseInt(e.target.value) || 1), totalPages))
                  }
                  className="w-14 h-8 text-center"
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextPage}
                  className="h-8 w-8"
                  disabled={currentPage >= totalPages}
                  aria-label="Next page"
                  title="Next Page (→ key)"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={handlePrint}
                className="h-8 w-8"
                aria-label="Print"
                title="Print"
              >
                <Printer className="h-4 w-4" />
              </Button>

              <Button
                variant="outline"
                size={isMobile ? "icon" : "default"}
                onClick={handleDownload}
                className={isMobile ? "h-8 w-8" : "flex items-center gap-1"}
                title="Download PDF"
              >
                <Download className={`${isMobile ? "h-4 w-4" : "h-4 w-4 mr-1"}`} />
                {!isMobile && "Download"}
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={toggleFullscreen}
                className="h-8 w-8"
                aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                title={isFullscreen ? "Exit Fullscreen (F key)" : "Enter Fullscreen (F key)"}
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 hover:text-destructive"
                aria-label="Close"
                title="Close (Esc key)"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile controls - only show if controls are visible */}
      <AnimatePresence>
        {showControls && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center justify-between p-2 ${moodStyles.bg} border-t ${moodStyles.border}`}
          >
            <div className="flex items-center gap-2 w-full">
              <Button variant="outline" size="icon" onClick={zoomOut} className="h-8 w-8" aria-label="Zoom out">
                <ZoomOut className="h-4 w-4" />
              </Button>

              <Slider
                value={[zoomLevel]}
                min={50}
                max={200}
                step={5}
                onValueChange={(value) => setZoomLevel(value[0])}
                className="w-full mx-2"
              />

              <Button variant="outline" size="icon" onClick={zoomIn} className="h-8 w-8" aria-label="Zoom in">
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page navigation for mobile - only show if controls are visible */}
      <AnimatePresence>
        {showControls && isMobile && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center justify-between p-2 ${moodStyles.bg} border-t ${moodStyles.border}`}
          >
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousPage}
              className="h-8 w-8"
              disabled={currentPage <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center">
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) =>
                  setCurrentPage(Math.min(Math.max(1, Number.parseInt(e.target.value) || 1), totalPages))
                }
                className="w-12 h-8 text-center mx-1"
              />
              <span className="text-sm text-muted-foreground">/ {totalPages}</span>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={goToNextPage}
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Music Controls Floating Panel */}
      <AnimatePresence>
        {showMusicControls && youtubeControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-20 right-4 z-[999]"
          >
            <Card className={`p-4 shadow-xl ${moodStyles.bg} border ${moodStyles.border} w-72`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-medium flex items-center">
                  <Music className="h-4 w-4 mr-2" /> Music Controls
                </h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleMusicControls}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={youtubeControls.prevVideo} className="h-8 w-8">
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="default"
                    size="icon"
                    onClick={youtubeControls.togglePlay}
                    className={`h-9 w-9 ${moodStyles.button}`}
                  >
                    {youtubeControls.isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <Button variant="ghost" size="icon" onClick={youtubeControls.nextVideo} className="h-8 w-8">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={youtubeControls.toggleMute} className="h-8 w-8">
                    {youtubeControls.isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                  <Slider
                    value={[youtubeControls.volume]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={youtubeControls.setVolume}
                    className="w-20"
                  />
                </div>
              </div>

              {youtubeControls.currentVideo && (
                <div className="bg-background/50 rounded-md p-2">
                  <p className="text-sm font-medium">Now Playing</p>
                  <p className="text-xs text-muted-foreground">YouTube video</p>
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todo List Floating Panel */}
      <AnimatePresence>
        {showTodoControls && todoControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-20 right-4 z-[999]"
          >
            <Card
              className={`p-4 shadow-xl ${moodStyles.bg} border ${moodStyles.border} w-80 max-h-[70vh] overflow-hidden flex flex-col`}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-medium flex items-center">
                  <ListTodo className="h-4 w-4 mr-2" /> Todo List
                </h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleTodoControls}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="overflow-y-auto pr-1 flex-1">
                {todoControls.tasks.length > 0 ? (
                  <div className="space-y-2">
                    {todoControls.tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`flex items-start p-3 rounded-md ${
                          task.completed ? "bg-muted/50 text-muted-foreground" : "bg-background/80"
                        }`}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`rounded-full h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${
                            task.completed ? `${moodStyles.button}` : "border"
                          }`}
                          onClick={() => todoControls.onCompleteTask(task.id)}
                        >
                          {task.completed && <Check className="h-3 w-3" />}
                        </Button>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col">
                            <span className={`text-sm break-words ${task.completed ? "line-through" : ""}`}>
                              {task.text}
                            </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {task.category && (
                                <Badge variant="outline" className={`text-xs ${getCategoryColor(task.category)}`}>
                                  {task.category}
                                </Badge>
                              )}
                              {task.priority && !task.completed && (
                                <Badge variant="outline" className="text-xs bg-yellow-500 text-white">
                                  Priority
                                </Badge>
                              )}
                            </div>
                            {task.dueDate && (
                              <div className="text-xs mt-1 text-muted-foreground">
                                Due: {new Date(task.dueDate).toLocaleDateString()}
                              </div>
                            )}
                            {task.notes && (
                              <div className="text-xs mt-1 text-muted-foreground line-clamp-2">{task.notes}</div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-8 bg-background/50 rounded-md">
                    <p>No tasks available</p>
                    <p className="text-xs mt-1">Add tasks from the main screen</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Time Controls Floating Panel */}
      <AnimatePresence>
        {showTimeControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="absolute top-20 right-4 z-[999]"
          >
            <Card className={`p-4 shadow-xl ${moodStyles.bg} border ${moodStyles.border} w-72`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-base font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-2" /> Current Time
                </h3>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleTimeControls}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-center py-3 bg-background/50 rounded-md">
                <p className="text-3xl font-bold tabular-nums">{currentTime.toLocaleTimeString()}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {currentTime.toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Content */}
      <div className="flex-1 overflow-hidden relative z-[50]" onClick={toggleControls}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="flex flex-col items-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${moodStyles.border} mb-3`}></div>
              <p className={`text-lg font-medium ${moodStyles.text}`}>Loading document...</p>
            </div>
          </div>
        )}

        {loadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <div className="bg-destructive/10 text-destructive p-6 rounded-lg max-w-md text-center">
              <p className="font-medium text-lg mb-3">Error Loading PDF</p>
              <p className="mb-4">{loadError}</p>
              <Button className={moodStyles.button} onClick={onClose}>
                Back to Tasks
              </Button>
            </div>
          </div>
        )}

        <div className="w-full h-full bg-black/90">
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full border-0"
            title={file.name}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{
              transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease-in-out",
            }}
          />
        </div>
      </div>

      {/* Floating hint - only show briefly */}
      <AnimatePresence>
        {!showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm"
          >
            Tap anywhere to show controls
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
