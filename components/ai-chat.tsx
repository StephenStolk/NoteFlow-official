"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Bot, X, User, Loader2, ChevronDown, ChevronUp, Sparkles, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useMood } from "@/components/mood-context"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import ReactMarkdown from "react-markdown"
import { callAIModel, callSimplifiedAI } from "@/app/actions/ai-actions"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export default function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "system",
      content:
        "You are a helpful AI assistant integrated into NoteFlow, a mood-based productivity app. Keep your responses concise, helpful, and match the user's current mood. You can help with productivity tips, answer questions about study topics, or provide general assistance.",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [usingFallback, setUsingFallback] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { currentMood, moodData } = useMood()
  const { toast } = useToast()
  const isMobile = useMobile()

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Update system message when mood changes
  useEffect(() => {
    if (messages.length > 0 && messages[0].role === "system") {
      const newSystemMessage = {
        role: "system" as const,
        content: `You are a helpful AI assistant integrated into NoteFlow, a mood-based productivity app. The user's current mood is: ${moodData.label} - ${moodData.description}. Adapt your tone and responses to match this mood. Keep your responses concise, helpful, and supportive. You can help with productivity tips, answer questions about study topics, or provide general assistance.`,
      }

      setMessages((prev) => [newSystemMessage, ...prev.slice(1)])
    }
  }, [currentMood, moodData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!input.trim()) return

    // Add user message
    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setUsingFallback(false)

    try {
      // Get current mood-specific system message
      const systemMessage = {
        role: "system" as const,
        content: `You are a helpful AI assistant integrated into NoteFlow, a mood-based productivity app. The user's current mood is: ${moodData.label} - ${moodData.description}. Adapt your tone and responses to match this mood. Keep your responses concise, helpful, and supportive.`,
      }

      // Prepare messages for API call (excluding previous system messages)
      const apiMessages = [systemMessage, ...messages.filter((msg) => msg.role !== "system"), userMessage]

      let responseContent = ""

      try {
        // Try primary model first (DeepSeek)
        console.log("Trying primary API...")
        responseContent = await callAIModel(apiMessages, "deepseek/deepseek-chat-v3-0324:free", true)
      } catch (primaryError) {
        console.warn("Primary model failed, trying fallback:", primaryError)
        setUsingFallback(true)

        try {
          // Try Gemma model as fallback
          console.log("Trying fallback API...")
          responseContent = await callAIModel(apiMessages, "google/gemma-3-27b-it:free", false)
        } catch (fallbackError) {
          console.warn("Fallback API failed, trying last resort:", fallbackError)

          // Last resort: simplified fallback
          responseContent = await callSimplifiedAI(apiMessages)
        }
      }

      // Add assistant response
      const assistantMessage: Message = {
        role: "assistant",
        content: responseContent,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error calling AI API:", error)
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

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

  // Toggle chat visibility
  const toggleChat = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      setIsExpanded(false)
    }
  }

  // Toggle expanded view
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <>
      {/* Chat button */}
      <motion.div
        className="fixed bottom-4 right-4 z-40"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          onClick={toggleChat}
          className={`rounded-full w-12 h-12 p-0 shadow-lg ${isOpen ? "bg-gray-500 hover:bg-gray-600" : `bg-gradient-to-r ${moodStyles.gradient} text-white`}`}
          aria-label={isOpen ? "Close AI Chat" : "Open AI Chat"}
        >
          {isOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <motion.div
              animate={{ rotate: [0, 10, 0, -10, 0] }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatType: "loop" }}
            >
              <Bot className="h-5 w-5" />
            </motion.div>
          )}
        </Button>
      </motion.div>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`fixed ${isExpanded ? "inset-4 md:inset-10" : "bottom-20 right-4 w-[90%] md:w-96"} z-30`}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Card className={`shadow-xl border ${moodStyles.border} overflow-hidden flex flex-col h-full`}>
              <CardHeader
                className={`py-3 px-4 bg-gradient-to-r ${moodStyles.gradient} text-white flex flex-row justify-between items-center`}
              >
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2" />
                  <h3 className="font-medium text-sm">AI Assistant</h3>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleExpanded}
                    className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleChat}
                    className="h-7 w-7 text-white hover:bg-white/20 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent
                className={`p-3 overflow-y-auto ${isExpanded ? "flex-grow" : "h-[300px] md:h-[350px]"} bg-background/80 backdrop-blur-sm`}
              >
                <div className="space-y-4">
                  {messages
                    .filter((msg) => msg.role !== "system")
                    .map((message, index) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`flex max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                        >
                          <div
                            className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                              message.role === "user"
                                ? `bg-gradient-to-r ${moodStyles.gradient} text-white`
                                : "bg-muted"
                            } mr-2`}
                          >
                            {message.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          <div
                            className={`rounded-lg px-3 py-2 text-sm ${
                              message.role === "user"
                                ? `bg-gradient-to-r ${moodStyles.gradient} text-white mr-2`
                                : `${moodStyles.accent} ml-2`
                            }`}
                          >
                            {message.role === "assistant" ? (
                              <div className="prose prose-sm max-w-none dark:prose-invert">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                              </div>
                            ) : (
                              message.content
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex max-w-[80%] flex-row">
                        <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-muted mr-2">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className={`rounded-lg px-3 py-2 text-sm ${moodStyles.accent} ml-2 flex items-center`}>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          >
                            <Loader2 className="h-4 w-4 mr-2" />
                          </motion.div>
                          <span>{usingFallback ? "Using fallback model..." : "Thinking..."}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {usingFallback && !isLoading && (
                    <div className="flex justify-center">
                      <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 text-xs rounded-md px-3 py-1.5 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1.5" />
                        Using fallback model (Google Gemma)
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </CardContent>

              <CardFooter className="p-3 border-t">
                <form onSubmit={handleSubmit} className="flex w-full gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1"
                    disabled={isLoading}
                  />
                  <Button type="submit" disabled={isLoading || !input.trim()} className={moodStyles.button}>
                    <Send className="h-4 w-4" />
                    <span className="sr-only">Send</span>
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
