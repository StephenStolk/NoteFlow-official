// This file contains API configuration
// In production, use environment variables instead of hardcoding

export const API_CONFIG = {
  // Remove sensitive API keys from client-side code
  SITE_URL: typeof window !== "undefined" ? window.location.origin : "https://noteflow.app",
  SITE_NAME: "NoteFlow - Mood-Based Productivity",
}
