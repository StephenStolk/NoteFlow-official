"use client"

import { useState, useEffect } from "react"
import TodoList from "@/components/todo-list"
import MusicPlayer from "@/components/music-player"
import PomodoroTimer from "@/components/pomodoro-timer"
import { MoodProvider } from "@/components/mood-context"
import type { Task } from "@/lib/types"
import { getRandomAffirmation } from "@/lib/affirmations"
import { useToast } from "@/hooks/use-toast"
import BackgroundAnimation from "@/components/background-animation"
import ThemeToggle from "@/components/theme-toggle"
import MoodSidebar from "@/components/mood-sidebar"
import MoodQuote from "@/components/mood-quote"
import TimeGreeting from "@/components/time-greeting"
import { motion, AnimatePresence } from "framer-motion"
import { useTheme } from "@/components/theme-provider"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import PDFViewer from "@/components/pdf-viewer"
import { useMood } from "@/components/mood-context"
import LandingPage from "@/components/landing-page"
import AIChat from "@/components/ai-chat"
import { useAuth } from "@/components/auth/auth-context"
import { UserProfile } from "@/components/auth/user-profile"
import {
  fetchUserTasks,
  createTask as createTaskInDb,
  updateTaskInDb,
  deleteTaskFromDb,
  createOrUpdateUserSettings,
} from "@/lib/supabase/database"

// Define sample videos outside the component
const sampleVideos = {
  lofi: [
    { id: "5qap5aO4i9A", title: "lofi hip hop radio - beats to relax/study to", channel: "Lofi Girl" },
    { id: "jfKfPfyJRdk", title: "lofi hip hop radio - beats to study/relax to", channel: "Lofi Girl" },
    { id: "DWcJFNfaw9c", title: "lofi hip hop radio - beats to sleep/chill to", channel: "Lofi Girl" },
  ],
  classical: [
    { id: "mIYzp5rcTvU", title: "The Best of Classical Music", channel: "HALIDONMUSIC" },
    { id: "jgpJVI3tDbY", title: "Classical Music for Studying & Brain Power", channel: "HALIDONMUSIC" },
  ],
  jazz: [
    { id: "neV3EPgvZ3g", title: "Relaxing Jazz Piano Radio", channel: "Cafe Music BGM" },
    { id: "Dx5qFachd3A", title: "Jazz Music • Smooth Jazz Saxophone", channel: "Relax Music" },
  ],
  focus: [
    { id: "BTYAsjAVa3I", title: "Deep Focus Music - 4 Hours Study Music", channel: "Yellow Brick Cinema" },
    { id: "WPni755-Krg", title: "Concentration Music", channel: "Quiet Quest" },
  ],
}

export default function Home() {
  const [showLanding, setShowLanding] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPdf, setCurrentPdf] = useState<File | null>(null)
  const [uploadedPdfs, setUploadedPdfs] = useState<File[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<string | null>(null)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const { theme } = useTheme()
  const { toast } = useToast()
  const isMobile = useMobile()
  const { isAuthenticated, user, isGuest } = useAuth()

  // Load tasks from localStorage or Supabase
  useEffect(() => {
    const loadTasks = async () => {
      if (isLoading) return

      try {
        if (isAuthenticated && user) {
          // Load tasks from Supabase
          const userTasks = await fetchUserTasks(user.id)

          // Transform the data to match the app's Task type
          const formattedTasks = userTasks.map((task: any) => ({
            id: task.id,
            text: task.text,
            completed: task.completed,
            category: task.category || "personal",
            priority: task.priority || false,
            createdAt: task.created_at,
            dueDate: task.due_date,
            notes: task.notes,
            subTasks:
              task.sub_tasks?.map((subTask: any) => ({
                id: subTask.id,
                text: subTask.text,
                completed: subTask.completed,
                status: subTask.status || "todo",
                createdAt: subTask.created_at,
                dueDate: subTask.due_date,
                notes: subTask.notes,
              })) || [],
          }))

          setTasks(formattedTasks)
        } else {
          // Load tasks from localStorage for guest users
          const savedTasks = localStorage.getItem("tasks")
          if (savedTasks) {
            setTasks(JSON.parse(savedTasks))
          }
        }
      } catch (error) {
        console.error("Error loading tasks:", error)
        toast({
          title: "Error loading tasks",
          description: "There was a problem loading your tasks. Please try again.",
          variant: "destructive",
        })

        // Fallback to localStorage
        const savedTasks = localStorage.getItem("tasks")
        if (savedTasks) {
          setTasks(JSON.parse(savedTasks))
        }
      }
    }

    loadTasks()
  }, [isAuthenticated, isGuest, user, isLoading, toast])

  // Check if user has visited before
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasVisited = localStorage.getItem("hasVisitedNoteFlow")
      if (hasVisited || isAuthenticated || isGuest) {
        setShowLanding(false)
      }
    }
  }, [isAuthenticated, isGuest])

  // Simulate loading time for smooth initial animations
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Save tasks to localStorage for guest users
  useEffect(() => {
    if (isGuest && typeof window !== "undefined") {
      localStorage.setItem("tasks", JSON.stringify(tasks))
    }
  }, [tasks, isGuest])

  // Ensure dark mode class is applied correctly
  useEffect(() => {
    if (typeof document !== "undefined") {
      if (theme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [theme])

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobile && sidebarOpen) {
        const target = e.target as HTMLElement
        if (!target.closest(".mood-sidebar")) {
          setSidebarOpen(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isMobile, sidebarOpen])

  // Save user settings when mood changes
  const handleMoodChange = async (mood: string) => {
    if (isAuthenticated && user) {
      try {
        await createOrUpdateUserSettings(user.id, {
          current_mood: mood,
        })
      } catch (error) {
        console.error("Error saving mood:", error)
      }
    }
  }

  const addTask = async (task: Task) => {
    if (isAuthenticated && user) {
      try {
        // Create task in Supabase
        const newTask = await createTaskInDb(
          {
            text: task.text,
            completed: task.completed,
            category: task.category,
            priority: task.priority,
            dueDate: task.dueDate,
            notes: task.notes,
          },
          user.id,
        )

        // Add the new task with its ID from Supabase
        setTasks([...tasks, { ...task, id: newTask.id as string }])
      } catch (error) {
        console.error("Error creating task:", error)
        toast({
          title: "Error adding task",
          description: "There was a problem adding your task. Please try again.",
          variant: "destructive",
        })

        // Fallback: add task locally
        setTasks([...tasks, task])
      }
    } else {
      // For guest users, just add to local state
      setTasks([...tasks, task])
    }
  }

  const updateTask = async (updatedTask: Task) => {
    if (isAuthenticated && user) {
      try {
        // Update task in Supabase
        await updateTaskInDb(updatedTask, user.id)

        // Update local state
        setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
      } catch (error) {
        console.error("Error updating task:", error)
        toast({
          title: "Error updating task",
          description: "There was a problem updating your task. Please try again.",
          variant: "destructive",
        })

        // Fallback: update task locally
        setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
      }
    } else {
      // For guest users, just update local state
      setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    }
  }

  const deleteTask = async (id: string) => {
    if (isAuthenticated && user) {
      try {
        // Delete task from Supabase
        await deleteTaskFromDb(id, user.id)

        // Update local state
        setTasks(tasks.filter((task) => task.id !== id))
      } catch (error) {
        console.error("Error deleting task:", error)
        toast({
          title: "Error deleting task",
          description: "There was a problem deleting your task. Please try again.",
          variant: "destructive",
        })

        // Fallback: delete task locally
        setTasks(tasks.filter((task) => task.id !== id))
      }
    } else {
      // For guest users, just update local state
      setTasks(tasks.filter((task) => task.id !== id))
    }
  }

  const completeTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return

    const updatedTask = { ...task, completed: !task.completed }

    if (isAuthenticated && user) {
      try {
        // Update task in Supabase
        await updateTaskInDb(updatedTask, user.id)

        // Update local state
        const updatedTasks = tasks.map((t) => (t.id === id ? updatedTask : t))
        setTasks(updatedTasks)

        // Show affirmation when task is completed
        if (!task.completed) {
          // Play victory sound
          const audio = new Audio("/complete.mp3")
          audio.volume = 0.5
          audio.play().catch((e) => {
            console.error("Error playing sound:", e)
            // Show fallback toast if sound fails
            toast({
              title: "Task completed!",
              description: getRandomAffirmation(),
              duration: 3000,
            })
          })

          toast({
            title: "Task completed!",
            description: getRandomAffirmation(),
            duration: 3000,
          })
        }
      } catch (error) {
        console.error("Error completing task:", error)
        toast({
          title: "Error updating task",
          description: "There was a problem updating your task. Please try again.",
          variant: "destructive",
        })

        // Fallback: update task locally
        const updatedTasks = tasks.map((t) => (t.id === id ? updatedTask : t))
        setTasks(updatedTasks)
      }
    } else {
      // For guest users, just update local state
      const updatedTasks = tasks.map((t) => (t.id === id ? updatedTask : t))
      setTasks(updatedTasks)

      // Show affirmation when task is completed
      if (!task.completed) {
        // Play victory sound
        const audio = new Audio("/complete.mp3")
        audio.volume = 0.5
        audio.play().catch((e) => {
          console.error("Error playing sound:", e)
          // Show fallback toast if sound fails
          toast({
            title: "Task completed!",
            description: getRandomAffirmation(),
            duration: 3000,
          })
        })

        toast({
          title: "Task completed!",
          description: getRandomAffirmation(),
          duration: 3000,
        })
      }
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Handle PDF document
  const handleOpenPdf = (file: File) => {
    // Check if the PDF is already in the uploaded PDFs array
    const existingPdf = uploadedPdfs.find(
      (pdf) => pdf.name === file.name && pdf.size === file.size && pdf.lastModified === file.lastModified,
    )

    if (!existingPdf) {
      // If it's a new PDF, add it to the uploaded PDFs array
      setUploadedPdfs((prev) => [...prev, file])
    }

    // Set the current PDF to display
    setCurrentPdf(existingPdf || file)
  }

  const handleClosePdf = () => {
    setCurrentPdf(null)
  }

  // Music player controls for PDF viewer
  const togglePlay = () => {
    setIsPlaying(!isPlaying)

    // Find the YouTube iframe and control it
    const youtubeIframe = document.querySelector('iframe[src*="youtube.com"]') as HTMLIFrameElement
    if (youtubeIframe) {
      try {
        // Send postMessage to control YouTube player
        const command = isPlaying ? "pauseVideo" : "playVideo"
        youtubeIframe.contentWindow?.postMessage(
          JSON.stringify({
            event: "command",
            func: command,
            args: [],
          }),
          "*",
        )
      } catch (error) {
        console.error("Error controlling YouTube player:", error)
      }
    }
  }

  const nextVideo = () => {
    // Get a random video from the sample videos
    const categories = Object.keys(sampleVideos)
    const randomCategory = categories[Math.floor(Math.random() * categories.length)]
    const videos = sampleVideos[randomCategory as keyof typeof sampleVideos]
    const randomIndex = Math.floor(Math.random() * videos.length)
    const nextVideoId = videos[randomIndex].id

    setCurrentVideo(nextVideoId)

    // Find the music player component and update it
    const musicPlayerComponent = document.querySelector(".music-player-component")
    if (musicPlayerComponent) {
      // This is a simplified approach - in a real implementation, you'd use refs or state management
      const event = new CustomEvent("changeVideo", { detail: { videoId: nextVideoId } })
      document.dispatchEvent(event)
    }
  }

  const prevVideo = () => {
    // Similar to nextVideo but with different logic if needed
    nextVideo() // For simplicity, just play another random video
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  // YouTube controls to pass to PDF viewer
  const youtubeControls = {
    isPlaying,
    currentVideo,
    togglePlay,
    nextVideo,
    prevVideo,
    volume,
    isMuted,
    setVolume: handleVolumeChange,
    toggleMute,
  }

  // Todo controls to pass to PDF viewer
  const todoControls = {
    tasks,
    onCompleteTask: completeTask,
  }

  const handleGetStarted = () => {
    setShowLanding(false)
    // Save that user has visited
    if (typeof window !== "undefined") {
      localStorage.setItem("hasVisitedNoteFlow", "true")
    }
  }

  const handleNavigateToLanding = () => {
    setShowLanding(true)
  }

  return (
    <MoodProvider onMoodChange={handleMoodChange}>
      <AnimatePresence mode="wait">
        {showLanding ? (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <LandingPage
              onGetStarted={handleGetStarted}
              showBackToApp={typeof window !== "undefined" && localStorage.getItem("hasVisitedNoteFlow") === "true"}
            />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatePresence>
              {isLoading ? (
                <motion.div
                  key="loader"
                  className="fixed inset-0 bg-background flex items-center justify-center z-50"
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.2, opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center"
                  >
                    <motion.div
                      className="text-5xl mb-4"
                      animate={{
                        rotate: [0, 10, 0, -10, 0],
                        scale: [1, 1.1, 1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "loop",
                      }}
                    >
                      🎶
                    </motion.div>
                    <h1 className="text-3xl font-bold">NoteFlow</h1>
                    <p className="text-muted-foreground mt-2">Loading your productivity space...</p>
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>

            <div className="h-screen w-full overflow-hidden flex relative">
              <BackgroundAnimation />

              {/* Mobile sidebar overlay */}
              <AnimatePresence>
                {isMobile && sidebarOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/50 z-30"
                    onClick={() => setSidebarOpen(false)}
                  />
                )}
              </AnimatePresence>

              {/* Sidebar */}
              <motion.div
                className={`mood-sidebar ${isMobile ? "fixed z-40 h-full" : "relative"}`}
                initial={isMobile ? { x: -80 } : { x: 0 }}
                animate={isMobile ? { x: sidebarOpen ? 0 : -80 } : { x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <MoodSidebar onOpenPdf={handleOpenPdf} uploadedPdfs={uploadedPdfs} />
              </motion.div>

              {/* Main content */}
              <main className="flex-1 h-screen overflow-hidden flex flex-col">
                <motion.header
                  className={`${isMobile ? "py-1 px-2" : "p-4"} flex justify-between items-center border-b z-10 relative`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="flex items-center">
                    {isMobile && (
                      <Button variant="ghost" size="icon" className="mr-1 h-8 w-8" onClick={toggleSidebar}>
                        <Menu className="h-4 w-4" />
                      </Button>
                    )}
                    <div className="flex items-center">
                      <h1 className={`${isMobile ? "text-lg mr-2" : "text-2xl mr-3"} font-bold`}>🎶 NoteFlow</h1>
                      <TimeGreeting />
                    </div>
                  </div>
                  <div className={`${isMobile ? "w-auto" : "w-auto"} flex justify-end items-center gap-2`}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNavigateToLanding}
                      className={`${isMobile ? "text-xs px-2" : ""} flex items-center gap-1`}
                    >
                      About NoteFlow
                    </Button>
                    <ThemeToggle />
                    <UserProfile />
                  </div>
                </motion.header>

                {/* Current Mood Display */}
                <div className={`${isMobile ? "py-1 px-2" : "p-4"} border-b`}>
                  <MoodDisplay />
                </div>

                <motion.div
                  className={`flex-1 overflow-auto ${isMobile ? "p-2" : "p-4"} scroll-smooth`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
                      <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                        <TodoList
                          tasks={tasks}
                          onAddTask={addTask}
                          onUpdateTask={updateTask}
                          onDeleteTask={deleteTask}
                          onCompleteTask={completeTask}
                        />
                        <PomodoroTimer />
                      </div>
                      <div>
                        <MusicPlayer
                          onPlayStateChange={setIsPlaying}
                          onVideoChange={setCurrentVideo}
                          className="music-player-component"
                        />
                      </div>
                    </div>
                  </div>
                  <motion.footer
                    className="border-t py-3 text-center text-xs text-muted-foreground mt-4 lg:mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    Made with <span className="text-red-500">❤️</span> by ServerSync
                  </motion.footer>
                </motion.div>
              </main>

              {/* PDF Viewer - Rendered at the app level */}
              {currentPdf && (
                <PDFViewer
                  file={currentPdf}
                  onClose={handleClosePdf}
                  youtubeControls={youtubeControls}
                  todoControls={todoControls}
                />
              )}

              {/* AI Chat Component */}
              <AIChat />

              {/* Mood Quote */}
              <MoodQuote />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MoodProvider>
  )
}

// New component to display current mood at the top
function MoodDisplay() {
  const { currentMood, moodData } = useMood()
  const isMobile = useMobile()

  return (
    <div className="flex flex-col">
      <h2 className={`${isMobile ? "text-lg" : "text-xl"} font-semibold`}>Mood: {moodData.label}</h2>
      <p className={`${isMobile ? "text-xs" : "text-sm"} text-muted-foreground`}>{moodData.description}</p>
    </div>
  )
}
