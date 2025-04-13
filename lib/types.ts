export interface SubTask {
  id: string
  text: string
  completed: boolean
  status: "todo" | "inProgress" | "done"
  createdAt: string
  dueDate?: string
  notes?: string
}

export interface Task {
  id: string
  text: string
  completed: boolean
  category: string
  priority: boolean
  createdAt: string
  dueDate?: string
  notes?: string
  subTasks?: SubTask[]
}

export interface MoodData {
  label: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  musicType: string
  taskPlaceholder: string
  emptyStateMessage: string
  animations: {
    speed: string
    style: string
  }
  typography: {
    style: string
  }
}

export interface FocusModeSettings {
  showTimer: boolean
  enableMusic: boolean
  enableAI: boolean
}
