"use server"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

// Primary API call function with timeout
export async function callAIModel(
  messages: Message[],
  modelName = "deepseek/deepseek-chat-v3-0324:free",
  isPrimary = true,
): Promise<string> {
  try {
    // Use the environment variable on the server side
    const apiKey = isPrimary
      ? process.env.OPENROUTER_API_KEY
      : process.env.FALLBACK_API_KEY || "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"

    if (!apiKey) {
      throw new Error(`API key not found for ${isPrimary ? "primary" : "fallback"} model`)
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.VERCEL_URL || "https://noteflow.app",
        "X-Title": "NoteFlow - Mood-Based Productivity",
      },
      body: JSON.stringify({
        model: modelName,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content
    } else {
      throw new Error("No response content")
    }
  } catch (error) {
    console.error(`Error calling ${isPrimary ? "primary" : "fallback"} AI model:`, error)
    throw error
  }
}

// Simplified fallback for last resort
export async function callSimplifiedAI(messages: Message[]): Promise<string> {
  try {
    // Simplified message to reduce complexity
    const simplifiedMessages = messages
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))
      .slice(-3) // Only use the last few messages

    const apiKey =
      process.env.FALLBACK_API_KEY || "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"

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.VERCEL_URL || "https://noteflow.app",
        "X-Title": "NoteFlow",
      },
      body: JSON.stringify({
        model: "google/gemma-3-27b-it:free",
        messages: simplifiedMessages,
        temperature: 0.5,
        max_tokens: 500, // Reduced tokens for faster response
      }),
    })

    if (!response.ok) {
      throw new Error(`Last resort API error: ${response.statusText}`)
    }

    const data = await response.json()

    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content
    } else {
      return "I'm sorry, I couldn't process your request at this time. Please try again later."
    }
  } catch (error) {
    console.error("Last resort fallback failed:", error)
    return "I'm having trouble connecting to my knowledge base. Please try again in a moment."
  }
}
