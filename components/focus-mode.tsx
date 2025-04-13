"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import {
  X,
  Clock,
  Music,
  Bot,
  CheckCircle,
  Edit,
  Plus,
  Save,
  Trash2,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  Send,
  Maximize,
  Minimize,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useMood } from "@/components/mood-context"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { v4 as uuidv4 } from "uuid"
import type { Task, SubTask, FocusModeSettings } from "@/lib/types"
import { callAIModel } from "@/app/actions/ai-actions"
import ReactMarkdown from "react-markdown"

interface FocusModeProps {
  task: Task
  onClose: () => void
  onUpdateTask: (task: Task) => void
  onCompleteTask: (id: string) => void
  onCompleteSubTask?: (taskId: string, subTaskId: string) => void
}

export default function FocusMode({ task, onClose, onUpdateTask, onCompleteTask, onCompleteSubTask }: FocusModeProps) {
  const [settings, setSettings] = useState<FocusModeSettings>({
    showTimer: true,
    enableMusic: true,
    enableAI: true,
  })
  const [notes, setNotes] = useState(task.notes || "")
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerDuration, setTimerDuration] = useState(25 * 60) // 25 minutes default
  const [newSubTask, setNewSubTask] = useState("")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiResponse, setAiResponse] = useState("")
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [editingSubTaskId, setEditingSubTaskId] = useState<string | null>(null)
  const [editingSubTaskText, setEditingSubTaskText] = useState("")
  const [activeTab, setActiveTab] = useState("task")
  const [isFullScreen, setIsFullScreen] = useState(false)

  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const focusModeRef = useRef<HTMLDivElement>(null)
  const { currentMood, moodData } = useMood()
  const { toast } = useToast()

  // Calculate progress
  const totalSubTasks = task.subTasks?.length || 0
  const completedSubTasks = task.subTasks?.filter((st) => st.completed).length || 0
  const progress = totalSubTasks > 0 ? (completedSubTasks / totalSubTasks) * 100 : 0

  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Start/pause timer
  const toggleTimer = () => {
    if (isTimerRunning) {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setIsTimerRunning(false)
    } else {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev >= timerDuration) {
            // Timer completed
            if (timerRef.current) {
              clearInterval(timerRef.current)
              timerRef.current = null
            }
            setIsTimerRunning(false)

            // Play notification sound
            const audio = new Audio("/complete.mp3")
            audio.volume = 0.5
            audio.play().catch(console.error)

            toast({
              title: "Timer completed!",
              description: "Take a break or continue working on your task.",
              duration: 5000,
            })

            return 0
          }
          return prev + 1
        })
      }, 1000)
      setIsTimerRunning(true)
    }
  }

  // Reset timer
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    setTimerSeconds(0)
    setIsTimerRunning(false)
  }

  // Save notes
  const saveNotes = () => {
    onUpdateTask({
      ...task,
      notes,
    })
    toast({
      title: "Notes saved",
      description: "Your notes have been saved successfully.",
      duration: 2000,
    })
  }

  // Add sub-task
  const addSubTask = () => {
    if (!newSubTask.trim()) return

    const newSubTaskObj: SubTask = {
      id: uuidv4(),
      text: newSubTask,
      completed: false,
      status: "todo",
      createdAt: new Date().toISOString(),
    }

    const updatedTask = {
      ...task,
      subTasks: [...(task.subTasks || []), newSubTaskObj],
    }

    onUpdateTask(updatedTask)
    setNewSubTask("")

    toast({
      title: "Sub-task added",
      description: "New sub-task has been added.",
      duration: 2000,
    })

    // Play a subtle sound
    const audio = new Audio("/complete.mp3")
    audio.volume = 0.3
    audio.play().catch(console.error)
  }

  // Toggle sub-task completion
  const toggleSubTaskCompletion = (subTaskId: string) => {
    if (!task.subTasks) return

    const updatedSubTasks = task.subTasks.map((st) =>
      st.id === subTaskId
        ? {
            ...st,
            completed: !st.completed,
            status: !st.completed ? "done" : "todo",
          }
        : st,
    )

    const updatedTask = {
      ...task,
      subTasks: updatedSubTasks,
    }

    onUpdateTask(updatedTask)

    // If all sub-tasks are completed, ask if the main task should be marked as completed
    const allCompleted = updatedSubTasks.every((st) => st.completed)
    if (allCompleted && !task.completed) {
      toast({
        title: "All sub-tasks completed!",
        description: "Would you like to mark the main task as completed?",
        action: (
          <Button onClick={() => onCompleteTask(task.id)} variant="default" size="sm">
            Complete Task
          </Button>
        ),
        duration: 5000,
      })
    }

    // Play a subtle sound
    const audio = new Audio("/complete.mp3")
    audio.volume = 0.3
    audio.play().catch(console.error)
  }

  // Update sub-task status
  const updateSubTaskStatus = (subTaskId: string, status: "todo" | "inProgress" | "done") => {
    if (!task.subTasks) return

    const updatedSubTasks = task.subTasks.map((st) =>
      st.id === subTaskId
        ? {
            ...st,
            status,
            completed: status === "done",
          }
        : st,
    )

    const updatedTask = {
      ...task,
      subTasks: updatedSubTasks,
    }

    onUpdateTask(updatedTask)
  }

  // Edit sub-task
  const startEditingSubTask = (subTask: SubTask) => {
    setEditingSubTaskId(subTask.id)
    setEditingSubTaskText(subTask.text)
  }

  // Save edited sub-task
  const saveEditedSubTask = () => {
    if (!editingSubTaskId || !task.subTasks) return

    const updatedSubTasks = task.subTasks.map((st) =>
      st.id === editingSubTaskId ? { ...st, text: editingSubTaskText } : st,
    )

    const updatedTask = {
      ...task,
      subTasks: updatedSubTasks,
    }

    onUpdateTask(updatedTask)
    setEditingSubTaskId(null)
    setEditingSubTaskText("")

    toast({
      title: "Sub-task updated",
      description: "Your sub-task has been updated.",
      duration: 2000,
    })
  }

  // Delete sub-task
  const deleteSubTask = (subTaskId: string) => {
    if (!task.subTasks) return

    const updatedSubTasks = task.subTasks.filter((st) => st.id !== subTaskId)

    const updatedTask = {
      ...task,
      subTasks: updatedSubTasks,
    }

    onUpdateTask(updatedTask)

    toast({
      title: "Sub-task deleted",
      description: "Your sub-task has been removed.",
      duration: 2000,
    })
  }

  // AI Assistant
  const handleAiPrompt = async (promptType: string) => {
    let prompt = aiPrompt

    // Predefined prompts
    if (promptType === "stuck") {
      prompt = `I'm stuck on this task: "${task.text}". Can you give me some suggestions to move forward?`
    } else if (promptType === "breakdown") {
      prompt = `Can you help me break down this task into smaller sub-tasks? Task: "${task.text}"`
    } else if (promptType === "motivation") {
      prompt = `I need some motivation to complete this task: "${task.text}". My current mood is ${moodData.label}.`
    } else if (promptType === "research") {
      prompt = `Can you provide a brief summary or steps on how to approach this task? Task: "${task.text}"`
    }

    setAiPrompt(prompt)

    if (!prompt.trim()) return

    setIsAiLoading(true)
    setAiResponse("")

    try {
      // Create system message with task context
      const systemMessage = {
        role: "system" as const,
        content: `You are a helpful AI assistant in a focus mode for a task management app. The user is currently working on the task: "${task.text}". Their current mood is: ${moodData.label} - ${moodData.description}. Provide concise, helpful responses that help them complete their task. If they ask for sub-tasks, provide 3-5 clear, actionable steps. Format your response using Markdown for better readability.`,
      }

      // User message
      const userMessage = {
        role: "user" as const,
        content: prompt,
      }

      // Call AI model
      const response = await callAIModel([systemMessage, userMessage], "deepseek/deepseek-chat-v3-0324:free", true)
      setAiResponse(response)

      // If it's a breakdown request, offer to add the suggested sub-tasks
      if (promptType === "breakdown" && response) {
        // Extract potential sub-tasks (lines that start with numbers, bullets, or dashes)
        const subTaskLines = response
          .split("\n")
          .filter((line) => /^(\d+[.)]\s|-\s|\*\s)/.test(line.trim()))
          .map((line) => line.replace(/^(\d+[.)]\s|-\s|\*\s)/, "").trim())

        if (subTaskLines.length > 0) {
          toast({
            title: "Add suggested sub-tasks?",
            description: `${subTaskLines.length} potential sub-tasks identified.`,
            action: (
              <Button onClick={() => addSuggestedSubTasks(subTaskLines)} variant="default" size="sm">
                Add All
              </Button>
            ),
            duration: 10000,
          })
        }
      }
    } catch (error) {
      console.error("Error calling AI:", error)
      setAiResponse("Sorry, I couldn't process your request. Please try again.")

      toast({
        title: "AI Error",
        description: "There was an error processing your request.",
        variant: "destructive",
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  // Add suggested sub-tasks from AI
  const addSuggestedSubTasks = (subTaskTexts: string[]) => {
    const newSubTasks = subTaskTexts.map((text) => ({
      id: uuidv4(),
      text,
      completed: false,
      status: "todo" as const,
      createdAt: new Date().toISOString(),
    }))

    const updatedTask = {
      ...task,
      subTasks: [...(task.subTasks || []), ...newSubTasks],
    }

    onUpdateTask(updatedTask)

    toast({
      title: "Sub-tasks added",
      description: `${newSubTasks.length} sub-tasks have been added.`,
      duration: 2000,
    })

    // Switch to task tab to show the new sub-tasks
    setActiveTab("task")
  }

  // Toggle fullscreen mode
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      if (focusModeRef.current && document.fullscreenEnabled) {
        focusModeRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`)
        })
      }
      setIsFullScreen(true)
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => {
          console.error(`Error attempting to exit fullscreen: ${err.message}`)
        })
      }
      setIsFullScreen(false)
    }
  }

  // Listen for fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Get mood-specific styles
  const getMoodStyles = () => {
    switch (currentMood) {
      case "motivated":
        return {
          gradient: "from-orange-500 to-red-500",
          button: "bg-orange-500 hover:bg-orange-600",
          accent: "bg-orange-500/10",
          border: "border-orange-500/30",
        }
      case "feelingLow":
        return {
          gradient: "from-blue-400 to-purple-500",
          button: "bg-blue-400 hover:bg-blue-500",
          accent: "bg-blue-400/10",
          border: "border-blue-400/30",
        }
      case "energized":
        return {
          gradient: "from-cyan-500 to-green-400",
          button: "bg-cyan-500 hover:bg-cyan-600",
          accent: "bg-cyan-500/10",
          border: "border-cyan-500/30",
        }
      case "lazy":
        return {
          gradient: "from-amber-300 to-rose-300",
          button: "bg-amber-300 hover:bg-amber-400 text-black",
          accent: "bg-amber-300/10",
          border: "border-amber-300/30",
        }
      case "focused":
        return {
          gradient: "from-gray-700 to-gray-900",
          button: "bg-gray-700 hover:bg-gray-800",
          accent: "bg-gray-700/10",
          border: "border-gray-700/30",
        }
      case "creative":
        return {
          gradient: "from-pink-400 to-purple-500",
          button: "bg-pink-400 hover:bg-pink-500",
          accent: "bg-pink-400/10",
          border: "border-pink-400/30",
        }
      default:
        return {
          gradient: "from-primary to-primary-foreground",
          button: "bg-primary hover:bg-primary/90",
          accent: "bg-primary/10",
          border: "border-primary/30",
        }
    }
  }

  const moodStyles = getMoodStyles()

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center overflow-hidden"
      ref={focusModeRef}
    >
      <motion.div
        className="w-full h-full max-h-full flex items-center justify-center p-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <Card
          className={`shadow-xl border ${moodStyles.border} w-full h-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden`}
        >
          <CardHeader
            className={`py-4 px-6 bg-gradient-to-r ${moodStyles.gradient} text-white flex flex-row justify-between items-center flex-shrink-0`}
          >
            <div>
              <h2 className="text-xl font-bold">Focus Mode</h2>
              <p className="text-sm opacity-90">Immerse yourself in your task</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullScreen}
                className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
              >
                {isFullScreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-6 overflow-y-auto flex-grow">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">{task.text}</h3>

              {task.category && <Badge className="mr-2 capitalize">{task.category}</Badge>}

              {task.priority && <Badge variant="destructive">Priority</Badge>}

              {task.dueDate && (
                <p className="text-sm text-muted-foreground mt-2">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
              )}
            </div>

            {/* Progress bar for sub-tasks */}
            {task.subTasks && task.subTasks.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {completedSubTasks}/{totalSubTasks} completed
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Settings */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-timer"
                  checked={settings.showTimer}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, showTimer: checked }))}
                />
                <Label htmlFor="show-timer" className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  Timer
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-music"
                  checked={settings.enableMusic}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, enableMusic: checked }))}
                />
                <Label htmlFor="enable-music" className="flex items-center">
                  <Music className="h-4 w-4 mr-1" />
                  Music
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="enable-ai"
                  checked={settings.enableAI}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, enableAI: checked }))}
                />
                <Label htmlFor="enable-ai" className="flex items-center">
                  <Bot className="h-4 w-4 mr-1" />
                  AI Assistant
                </Label>
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="task">Task & Sub-tasks</TabsTrigger>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="assistant" disabled={!settings.enableAI}>
                  AI Assistant
                </TabsTrigger>
              </TabsList>

              <TabsContent value="task" className="space-y-4 h-full">
                {/* Timer */}
                {settings.showTimer && (
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center">
                        <div className="text-4xl font-bold mb-4 tabular-nums">
                          {formatTime(timerDuration - timerSeconds)}
                        </div>

                        <div className="flex gap-2">
                          <Button onClick={toggleTimer} className={moodStyles.button}>
                            {isTimerRunning ? (
                              <>
                                <Pause className="h-4 w-4 mr-2" />
                                Pause
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 mr-2" />
                                Start
                              </>
                            )}
                          </Button>

                          <Button variant="outline" onClick={resetTimer}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        </div>

                        <div className="flex items-center mt-4 gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTimerDuration(15 * 60)}
                            className={timerDuration === 15 * 60 ? moodStyles.accent : ""}
                          >
                            15m
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTimerDuration(25 * 60)}
                            className={timerDuration === 25 * 60 ? moodStyles.accent : ""}
                          >
                            25m
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTimerDuration(45 * 60)}
                            className={timerDuration === 45 * 60 ? moodStyles.accent : ""}
                          >
                            45m
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setTimerDuration(60 * 60)}
                            className={timerDuration === 60 * 60 ? moodStyles.accent : ""}
                          >
                            60m
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Sub-tasks */}
                <div>
                  <h3 className="text-lg font-medium mb-2">Sub-tasks</h3>

                  <div className="flex gap-2 mb-4">
                    <Input
                      placeholder="Add a new sub-task..."
                      value={newSubTask}
                      onChange={(e) => setNewSubTask(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addSubTask()}
                    />
                    <Button onClick={addSubTask} disabled={!newSubTask.trim()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  <div className="space-y-2 max-h-[calc(100vh-500px)] overflow-y-auto pr-2">
                    {task.subTasks && task.subTasks.length > 0 ? (
                      task.subTasks.map((subTask) => (
                        <div
                          key={subTask.id}
                          className={`p-3 border rounded-lg ${subTask.completed ? "bg-muted/50" : moodStyles.accent}`}
                        >
                          {editingSubTaskId === subTask.id ? (
                            <div className="flex gap-2">
                              <Input
                                value={editingSubTaskText}
                                onChange={(e) => setEditingSubTaskText(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && saveEditedSubTask()}
                                autoFocus
                              />
                              <Button size="sm" onClick={saveEditedSubTask} className={moodStyles.button}>
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className={`rounded-full h-6 w-6 mr-2 ${
                                    subTask.completed ? moodStyles.button : "border"
                                  }`}
                                  onClick={() => toggleSubTaskCompletion(subTask.id)}
                                >
                                  {subTask.completed && <CheckCircle className="h-3 w-3" />}
                                </Button>
                                <span className={subTask.completed ? "line-through text-muted-foreground" : ""}>
                                  {subTask.text}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <div className="flex border rounded-md overflow-hidden">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-7 px-2 rounded-none ${
                                      subTask.status === "todo" ? moodStyles.accent : ""
                                    }`}
                                    onClick={() => updateSubTaskStatus(subTask.id, "todo")}
                                  >
                                    To Do
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-7 px-2 rounded-none ${
                                      subTask.status === "inProgress" ? moodStyles.accent : ""
                                    }`}
                                    onClick={() => updateSubTaskStatus(subTask.id, "inProgress")}
                                  >
                                    In Progress
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`h-7 px-2 rounded-none ${
                                      subTask.status === "done" ? moodStyles.accent : ""
                                    }`}
                                    onClick={() => updateSubTaskStatus(subTask.id, "done")}
                                  >
                                    Done
                                  </Button>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => startEditingSubTask(subTask)}
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </Button>

                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => deleteSubTask(subTask.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-lg">
                        <p>No sub-tasks yet. Add some to break down your task!</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="notes">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Task Notes</h3>
                  <p className="text-sm text-muted-foreground">
                    Take notes, jot down ideas, or keep track of your progress.
                  </p>

                  <Textarea
                    placeholder="Write your notes here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="min-h-[300px]"
                  />

                  <div className="flex justify-end">
                    <Button onClick={saveNotes} className={moodStyles.button}>
                      <Save className="h-4 w-4 mr-2" />
                      Save Notes
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="assistant">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">AI Assistant</h3>

                  <p className="text-sm text-muted-foreground">
                    Get help with your task, ask for suggestions, or get motivation.
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button variant="outline" size="sm" onClick={() => handleAiPrompt("stuck")}>
                      I'm stuck
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAiPrompt("breakdown")}>
                      Break down task
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAiPrompt("motivation")}>
                      Need motivation
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleAiPrompt("research")}>
                      Research mode
                    </Button>
                  </div>

                  <div className="flex gap-2 mb-4">
                    <Textarea
                      placeholder="Ask the AI assistant..."
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="flex-1"
                    />
                    <Button
                      onClick={() => handleAiPrompt("custom")}
                      className={moodStyles.button}
                      disabled={!aiPrompt.trim() || isAiLoading}
                    >
                      {isAiLoading ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <Loader2 className="h-4 w-4" />
                        </motion.div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {aiResponse && (
                    <Card className={`border ${moodStyles.border}`}>
                      <CardContent className="p-4">
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <ReactMarkdown>{aiResponse}</ReactMarkdown>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>

          <CardFooter className="flex justify-between p-6 border-t flex-shrink-0">
            <Button variant="outline" onClick={onClose}>
              Exit Focus Mode
            </Button>

            <Button onClick={() => onCompleteTask(task.id)} className={moodStyles.button} disabled={task.completed}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {task.completed ? "Task Completed" : "Complete Task"}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
