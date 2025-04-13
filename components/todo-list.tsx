"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useMood } from "@/components/mood-context"
import type { Task, SubTask } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"
import { motion, AnimatePresence } from "framer-motion"
import {
  Check,
  Trash2,
  Edit,
  Star,
  Plus,
  Calendar,
  AlignLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  List,
  Focus,
  CheckCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { format, isToday, isTomorrow, addDays } from "date-fns"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import FocusMode from "@/components/focus-mode"
import { Progress } from "@/components/ui/progress"

interface TodoListProps {
  tasks: Task[]
  onAddTask: (task: Task) => void
  onUpdateTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onCompleteTask: (id: string) => void
}

export default function TodoList({ tasks, onAddTask, onUpdateTask, onDeleteTask, onCompleteTask }: TodoListProps) {
  const { currentMood, moodData, isTransitioning } = useMood()
  const [newTaskText, setNewTaskText] = useState("")
  const [newTaskCategory, setNewTaskCategory] = useState("personal")
  const [newTaskPriority, setNewTaskPriority] = useState(false)
  const [newTaskDueDate, setNewTaskDueDate] = useState("")
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [taskNotes, setTaskNotes] = useState<Record<string, string>>({})
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [focusedTask, setFocusedTask] = useState<Task | null>(null)
  const [newSubTask, setNewSubTask] = useState("")
  const [editingSubTask, setEditingSubTask] = useState<{ taskId: string; subTaskId: string } | null>(null)
  const [editSubTaskText, setEditSubTaskText] = useState("")
  const { toast } = useToast()
  const isMobile = useMobile()

  // Reset expanded task when mood changes to avoid UI glitches
  useEffect(() => {
    if (isTransitioning) {
      setExpandedTask(null)
    }
  }, [isTransitioning, currentMood])

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (newTaskText.trim()) {
      const newTask = {
        id: uuidv4(),
        text: newTaskText,
        completed: false,
        category: newTaskCategory,
        priority: newTaskPriority,
        createdAt: new Date().toISOString(),
        dueDate: newTaskDueDate || undefined,
        notes: "",
        subTasks: [],
      }

      onAddTask(newTask)
      setNewTaskText("")
      setNewTaskPriority(false)
      setNewTaskDueDate("")

      // Show success toast
      toast({
        title: "Task added",
        description: "Your new task has been created.",
        duration: 2000,
      })
    }
  }

  const startEditing = (task: Task) => {
    setEditingTask(task.id)
    setEditText(task.text)
  }

  const saveEdit = (task: Task) => {
    if (editText.trim() && editText !== task.text) {
      onUpdateTask({ ...task, text: editText })
      toast({
        title: "Task updated",
        description: "Your task has been updated successfully.",
        duration: 2000,
      })
    }
    setEditingTask(null)
  }

  const togglePriority = (task: Task) => {
    onUpdateTask({ ...task, priority: !task.priority })

    toast({
      title: task.priority ? "Priority removed" : "Priority added",
      description: task.priority ? "Task is no longer marked as priority." : "Task has been marked as priority.",
      duration: 2000,
    })
  }

  const toggleExpandTask = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId)
  }

  const updateTaskNotes = (taskId: string, notes: string) => {
    setTaskNotes((prev) => ({ ...prev, [taskId]: notes }))
  }

  const saveTaskNotes = (task: Task) => {
    const taskId = task.id
    if (taskId in taskNotes) {
      onUpdateTask({ ...task, notes: taskNotes[taskId] })
      toast({
        title: "Notes saved",
        description: "Your task notes have been updated.",
        duration: 2000,
      })
    }
  }

  const updateTaskDueDate = (task: Task, dueDate: string) => {
    onUpdateTask({ ...task, dueDate })
    toast({
      title: "Due date updated",
      description: dueDate ? `Task due date set to ${formatDueDate(dueDate)}` : "Due date removed",
      duration: 2000,
    })
  }

  const handleDeleteTask = (id: string) => {
    setIsDeleting(id)

    // Add a small delay for the animation to play
    setTimeout(() => {
      onDeleteTask(id)
      setIsDeleting(null)

      toast({
        title: "Task deleted",
        description: "Your task has been removed.",
        duration: 2000,
      })
    }, 300)
  }

  // Format due date in a more human-readable way
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString)

    if (isToday(date)) {
      return "Today"
    } else if (isTomorrow(date)) {
      return "Tomorrow"
    } else if (date < addDays(new Date(), 7)) {
      return format(date, "EEEE") // Day name
    } else {
      return format(date, "MMM d, yyyy")
    }
  }

  // Enter focus mode for a task
  const enterFocusMode = (task: Task) => {
    setFocusedTask(task)
  }

  // Exit focus mode
  const exitFocusMode = () => {
    setFocusedTask(null)
  }

  // Add sub-task to a task
  const addSubTask = (task: Task) => {
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
  }

  // Toggle sub-task completion
  const toggleSubTaskCompletion = (taskId: string, subTaskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.subTasks) return

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

    // Play a subtle sound
    const audio = new Audio("/complete.mp3")
    audio.volume = 0.3
    audio.play().catch(console.error)
  }

  // Start editing a sub-task
  const startEditingSubTask = (taskId: string, subTaskId: string, text: string) => {
    setEditingSubTask({ taskId, subTaskId })
    setEditSubTaskText(text)
  }

  // Save edited sub-task
  const saveEditedSubTask = () => {
    if (!editingSubTask) return

    const { taskId, subTaskId } = editingSubTask
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.subTasks) return

    const updatedSubTasks = task.subTasks.map((st) => (st.id === subTaskId ? { ...st, text: editSubTaskText } : st))

    const updatedTask = {
      ...task,
      subTasks: updatedSubTasks,
    }

    onUpdateTask(updatedTask)
    setEditingSubTask(null)
    setEditSubTaskText("")

    toast({
      title: "Sub-task updated",
      description: "Your sub-task has been updated.",
      duration: 2000,
    })
  }

  // Delete a sub-task
  const deleteSubTask = (taskId: string, subTaskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || !task.subTasks) return

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

  // Animation variants based on current mood
  const getTaskAnimations = () => {
    switch (currentMood) {
      case "motivated":
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1, transition: { duration: 0.3 } },
          exit: { x: -300, opacity: 0, transition: { duration: 0.3 } },
        }
      case "feelingLow":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { duration: 0.8 } },
          exit: { opacity: 0, transition: { duration: 0.8 } },
        }
      case "energized":
        return {
          initial: { scale: 0.8, opacity: 0 },
          animate: { scale: 1, opacity: 1, transition: { duration: 0.2 } },
          exit: { scale: 1.1, opacity: 0, transition: { duration: 0.2 } },
        }
      case "lazy":
        return {
          initial: { y: 10, opacity: 0 },
          animate: { y: 0, opacity: 1, transition: { duration: 1 } },
          exit: { y: 10, opacity: 0, transition: { duration: 1 } },
        }
      case "focused":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1, transition: { duration: 0.4 } },
          exit: { opacity: 0, transition: { duration: 0.4 } },
        }
      case "creative":
        return {
          initial: { rotate: -2, opacity: 0 },
          animate: { rotate: 0, opacity: 1, transition: { duration: 0.5 } },
          exit: { rotate: 2, opacity: 0, transition: { duration: 0.5 } },
        }
      default:
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        }
    }
  }

  const taskAnimations = getTaskAnimations()

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

  // Check if a task is overdue
  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const taskDueDate = new Date(dueDate)
    return taskDueDate < today
  }

  // Get due date badge color
  const getDueDateColor = (dueDate?: string) => {
    if (!dueDate) return ""

    const date = new Date(dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (date < today) {
      return "text-destructive font-medium"
    } else if (isToday(date)) {
      return "text-orange-500 font-medium"
    } else if (isTomorrow(date)) {
      return "text-yellow-500 font-medium"
    } else {
      return "text-muted-foreground"
    }
  }

  // Calculate progress for a task with sub-tasks
  const calculateProgress = (task: Task) => {
    if (!task.subTasks || task.subTasks.length === 0) return 0
    const completedSubTasks = task.subTasks.filter((st) => st.completed).length
    return (completedSubTasks / task.subTasks.length) * 100
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="transition-all duration-500">
        <CardContent className={`${isMobile ? "p-3" : "p-6"}`}>
          <h2 className="text-2xl font-semibold mb-4 transition-all duration-300">Tasks</h2>

          <form onSubmit={handleAddTask} className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder={moodData.taskPlaceholder}
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 transition-all duration-300"
              />
              <Select value={newTaskCategory} onValueChange={setNewTaskCategory}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="study">Study</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant={newTaskPriority ? "default" : "outline"}
                  size="sm"
                  onClick={() => setNewTaskPriority(!newTaskPriority)}
                  className="transition-all duration-300 hover:scale-105"
                >
                  <Star className={`h-4 w-4 mr-2 ${newTaskPriority ? "fill-current" : ""}`} />
                  Priority
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant={newTaskDueDate ? "default" : "outline"}
                      size="sm"
                      className="transition-all duration-300 hover:scale-105"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {newTaskDueDate ? formatDueDate(newTaskDueDate) : "Due Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-4">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Set Due Date</h4>
                      <div className="flex flex-col gap-2">
                        <Input
                          type="date"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                        />
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 flex-1"
                            onClick={() => {
                              const today = new Date()
                              setNewTaskDueDate(today.toISOString().split("T")[0])
                            }}
                          >
                            Today
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs h-7 flex-1"
                            onClick={() => {
                              const tomorrow = addDays(new Date(), 1)
                              setNewTaskDueDate(tomorrow.toISOString().split("T")[0])
                            }}
                          >
                            Tomorrow
                          </Button>
                        </div>
                        {newTaskDueDate && (
                          <Button size="sm" variant="ghost" onClick={() => setNewTaskDueDate("")} className="self-end">
                            Clear
                          </Button>
                        )}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <Button
                type="submit"
                className="transition-all duration-300 hover:scale-105"
                disabled={!newTaskText.trim()}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            <AnimatePresence>
              {tasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8 text-muted-foreground"
                >
                  <p>{moodData.emptyStateMessage}</p>
                </motion.div>
              ) : (
                tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={taskAnimations.initial}
                    animate={isDeleting === task.id ? { opacity: 0, x: -100 } : taskAnimations.animate}
                    exit={taskAnimations.exit}
                    layout
                    whileHover={{ scale: 1.01 }}
                    className="flex flex-col"
                  >
                    <div
                      className={cn(
                        "flex items-center p-3 rounded-lg border transition-all duration-300",
                        task.completed
                          ? "bg-muted/50 text-muted-foreground"
                          : task.priority
                            ? "border-primary/50 bg-primary/5"
                            : "",
                        task.dueDate && isOverdue(task.dueDate) && !task.completed ? "border-destructive/50" : "",
                      )}
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`rounded-full h-6 w-6 mr-2 transition-all duration-300 ${
                          task.completed ? "bg-primary text-primary-foreground" : "border"
                        }`}
                        onClick={() => onCompleteTask(task.id)}
                      >
                        {task.completed && <Check className="h-3 w-3" />}
                      </Button>

                      <div className="flex-1 min-w-0">
                        {editingTask === task.id ? (
                          <Input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onBlur={() => saveEdit(task)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(task)}
                            autoFocus
                            className="transition-all duration-300"
                          />
                        ) : (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`${task.completed ? "line-through" : ""} break-words`}>{task.text}</span>
                              <Badge variant="outline" className={`text-xs ${getCategoryColor(task.category)}`}>
                                {task.category}
                              </Badge>
                              {task.priority && !task.completed && (
                                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                              )}
                            </div>

                            {task.dueDate && (
                              <div className="text-xs mt-1 flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                <span className={cn(getDueDateColor(task.dueDate))}>
                                  {formatDueDate(task.dueDate)}
                                  {isOverdue(task.dueDate) && !task.completed && " (Overdue)"}
                                </span>
                              </div>
                            )}

                            {/* Show sub-task count and progress if there are sub-tasks */}
                            {task.subTasks && task.subTasks.length > 0 && (
                              <div className="mt-2">
                                <div className="flex justify-between items-center text-xs text-muted-foreground mb-1">
                                  <span className="flex items-center">
                                    <List className="h-3 w-3 mr-1" />
                                    {task.subTasks.filter((st) => st.completed).length}/{task.subTasks.length} sub-tasks
                                  </span>
                                </div>
                                <Progress value={calculateProgress(task)} className="h-1" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-1 ml-1 sm:ml-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => enterFocusMode(task)}
                          className="h-8 w-8 transition-all duration-300 hover:scale-110"
                          title="Enter Focus Mode"
                        >
                          <Focus className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleExpandTask(task.id)}
                          className="h-8 w-8 transition-all duration-300 hover:scale-110"
                          title="Task details"
                        >
                          {expandedTask === task.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>

                        {!task.completed && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => startEditing(task)}
                            className="h-8 w-8 transition-all duration-300 hover:scale-110"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTask(task.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive transition-all duration-300 hover:scale-110"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Expanded task details */}
                    <AnimatePresence>
                      {expandedTask === task.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border border-t-0 rounded-b-lg p-3 -mt-1 bg-background/80"
                        >
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" /> Due Date
                                </label>

                                {task.dueDate && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => updateTaskDueDate(task, "")}
                                    className="h-6 text-xs"
                                  >
                                    Clear
                                  </Button>
                                )}
                              </div>

                              <div className="flex flex-col gap-2">
                                <Input
                                  type="date"
                                  value={task.dueDate || ""}
                                  onChange={(e) => updateTaskDueDate(task, e.target.value)}
                                  className="text-sm"
                                  min={new Date().toISOString().split("T")[0]}
                                />

                                <div className="flex flex-wrap gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 flex-1"
                                    onClick={() => {
                                      const today = new Date()
                                      updateTaskDueDate(task, today.toISOString().split("T")[0])
                                    }}
                                  >
                                    Today
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs h-7 flex-1"
                                    onClick={() => {
                                      const tomorrow = addDays(new Date(), 1)
                                      updateTaskDueDate(task, tomorrow.toISOString().split("T")[0])
                                    }}
                                  >
                                    Tomorrow
                                  </Button>
                                </div>
                              </div>
                            </div>

                            {/* Sub-tasks section */}
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium flex items-center">
                                  <List className="h-4 w-4 mr-1" /> Sub-tasks
                                </label>
                              </div>

                              <div className="flex gap-2 mb-2">
                                <Input
                                  placeholder="Add a sub-task..."
                                  value={newSubTask}
                                  onChange={(e) => setNewSubTask(e.target.value)}
                                  className="flex-1"
                                  onKeyDown={(e) => e.key === "Enter" && addSubTask(task)}
                                />
                                <Button onClick={() => addSubTask(task)} disabled={!newSubTask.trim()}>
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              <div className="space-y-2 max-h-40 overflow-y-auto">
                                {task.subTasks && task.subTasks.length > 0 ? (
                                  task.subTasks.map((subTask) => (
                                    <div
                                      key={subTask.id}
                                      className={`p-2 border rounded-md flex items-center justify-between ${
                                        subTask.completed ? "bg-muted/50 text-muted-foreground" : ""
                                      }`}
                                    >
                                      {editingSubTask &&
                                      editingSubTask.taskId === task.id &&
                                      editingSubTask.subTaskId === subTask.id ? (
                                        <div className="flex gap-2 w-full">
                                          <Input
                                            value={editSubTaskText}
                                            onChange={(e) => setEditSubTaskText(e.target.value)}
                                            className="flex-1"
                                            autoFocus
                                            onKeyDown={(e) => e.key === "Enter" && saveEditedSubTask()}
                                          />
                                          <Button size="sm" onClick={saveEditedSubTask}>
                                            Save
                                          </Button>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="flex items-center">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className={`rounded-full h-5 w-5 mr-2 ${
                                                subTask.completed ? "bg-primary text-primary-foreground" : "border"
                                              }`}
                                              onClick={() => toggleSubTaskCompletion(task.id, subTask.id)}
                                            >
                                              {subTask.completed && <CheckCircle className="h-3 w-3" />}
                                            </Button>
                                            <span className={subTask.completed ? "line-through" : ""}>
                                              {subTask.text}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6"
                                              onClick={() => startEditingSubTask(task.id, subTask.id, subTask.text)}
                                            >
                                              <Edit className="h-3 w-3" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="icon"
                                              className="h-6 w-6 text-destructive"
                                              onClick={() => deleteSubTask(task.id, subTask.id)}
                                            >
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <div className="text-center py-3 text-sm text-muted-foreground bg-muted/30 rounded-md">
                                    No sub-tasks yet. Add some to break down your task!
                                  </div>
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-medium flex items-center">
                                  <AlignLeft className="h-4 w-4 mr-1" /> Notes
                                </label>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => saveTaskNotes(task)}
                                  className="h-6 text-xs"
                                  disabled={!(task.id in taskNotes)}
                                >
                                  Save
                                </Button>
                              </div>

                              <Textarea
                                placeholder="Add notes about this task..."
                                value={task.id in taskNotes ? taskNotes[task.id] : task.notes || ""}
                                onChange={(e) => updateTaskNotes(task.id, e.target.value)}
                                className="min-h-[80px] text-sm"
                              />
                            </div>

                            <div className="flex justify-end">
                              <Button onClick={() => enterFocusMode(task)} className="flex items-center gap-1">
                                <Focus className="h-4 w-4 mr-1" />
                                Enter Focus Mode
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Focus Mode */}
      <AnimatePresence>
        {focusedTask && (
          <FocusMode
            task={focusedTask}
            onClose={exitFocusMode}
            onUpdateTask={onUpdateTask}
            onCompleteTask={onCompleteTask}
            onCompleteSubTask={toggleSubTaskCompletion}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}
