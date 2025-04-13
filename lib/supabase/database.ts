import { getSupabaseBrowser } from "./client"
import { getSupabaseServer } from "./server"
import { v4 as uuidv4 } from "uuid"

// User profile functions
export const createUserProfile = async (userId: string, data: any) => {
  const supabase = getSupabaseServer()

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .insert({
      id: userId,
      display_name: data.displayName || null,
      avatar_url: data.avatarUrl || null,
    })
    .select()
    .single()

  if (error) throw error
  return profile
}

export const getUserProfile = async (userId: string) => {
  const supabase = getSupabaseBrowser()

  const { data, error } = await supabase.from("user_profiles").select("*").eq("id", userId).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

// User settings functions
export const createOrUpdateUserSettings = async (userId: string, settings: any) => {
  const supabase = getSupabaseBrowser()

  // Check if settings exist
  const { data: existingSettings } = await supabase.from("user_settings").select("*").eq("id", userId).single()

  if (existingSettings) {
    // Update existing settings
    const { data, error } = await supabase.from("user_settings").update(settings).eq("id", userId).select().single()

    if (error) throw error
    return data
  } else {
    // Create new settings
    const { data, error } = await supabase
      .from("user_settings")
      .insert({
        id: userId,
        ...settings,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export const getUserSettings = async (userId: string) => {
  const supabase = getSupabaseBrowser()

  const { data, error } = await supabase.from("user_settings").select("*").eq("id", userId).single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

// Task functions
export const fetchUserTasks = async (userId: string) => {
  const supabase = getSupabaseBrowser()

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      sub_tasks(*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export const createTask = async (task: any, userId: string) => {
  const supabase = getSupabaseBrowser()

  const newTask = {
    id: uuidv4(),
    user_id: userId,
    text: task.text,
    completed: task.completed || false,
    category: task.category || "personal",
    priority: task.priority || false,
    due_date: task.dueDate || null,
    notes: task.notes || null,
  }

  const { data, error } = await supabase.from("tasks").insert(newTask).select().single()

  if (error) throw error
  return data
}

export const updateTaskInDb = async (task: any, userId: string) => {
  const supabase = getSupabaseBrowser()

  const { data, error } = await supabase
    .from("tasks")
    .update({
      text: task.text,
      completed: task.completed,
      category: task.category,
      priority: task.priority,
      due_date: task.dueDate,
      notes: task.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", task.id)
    .eq("user_id", userId)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteTaskFromDb = async (taskId: string, userId: string) => {
  const supabase = getSupabaseBrowser()

  const { error } = await supabase.from("tasks").delete().eq("id", taskId).eq("user_id", userId)

  if (error) throw error
  return true
}

// Sub-task functions
export const createSubTask = async (subTask: any, taskId: string) => {
  const supabase = getSupabaseBrowser()

  const newSubTask = {
    id: uuidv4(),
    task_id: taskId,
    text: subTask.text,
    completed: subTask.completed || false,
    status: subTask.status || "todo",
    due_date: subTask.dueDate || null,
    notes: subTask.notes || null,
  }

  const { data, error } = await supabase.from("sub_tasks").insert(newSubTask).select().single()

  if (error) throw error
  return data
}

export const updateSubTask = async (subTask: any) => {
  const supabase = getSupabaseBrowser()

  const { data, error } = await supabase
    .from("sub_tasks")
    .update({
      text: subTask.text,
      completed: subTask.completed,
      status: subTask.status,
      due_date: subTask.dueDate,
      notes: subTask.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", subTask.id)
    .select()
    .single()

  if (error) throw error
  return data
}

export const deleteSubTask = async (subTaskId: string) => {
  const supabase = getSupabaseBrowser()

  const { error } = await supabase.from("sub_tasks").delete().eq("id", subTaskId)

  if (error) throw error
  return true
}

// Liked videos functions
export const saveLikedVideo = async (videoData: any, userId: string) => {
  const supabase = getSupabaseBrowser()

  const { data, error } = await supabase
    .from("liked_videos")
    .insert({
      user_id: userId,
      video_id: videoData.videoId,
      title: videoData.title,
      channel: videoData.channel,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getLikedVideos = async (userId: string) => {
  const supabase = getSupabaseBrowser()

  const { data, error } = await supabase
    .from("liked_videos")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return data || []
}

export const removeLikedVideo = async (videoId: string, userId: string) => {
  const supabase = getSupabaseBrowser()

  const { error } = await supabase.from("liked_videos").delete().eq("video_id", videoId).eq("user_id", userId)

  if (error) throw error
  return true
}
