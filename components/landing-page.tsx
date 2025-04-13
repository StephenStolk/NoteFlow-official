"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Music,
  ListTodo,
  Brain,
  FileText,
  Moon,
  Sun,
  Bot,
  Focus,
  Coffee,
  LogIn,
  UserPlus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useMobile } from "@/hooks/use-mobile"
import { useTheme } from "@/components/theme-provider"
import { AuthModal } from "./auth/auth-modal"
import { useAuth } from "./auth/auth-context"
import ProductHuntBadge from "./producthunt"

interface LandingPageProps {
  onGetStarted: () => void
  onNavigateToLanding?: () => void
  showBackToApp?: boolean
}

export default function LandingPage({ onGetStarted, onNavigateToLanding, showBackToApp }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState(0)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const isMobile = useMobile()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { isAuthenticated, user, isGuest } = useAuth()

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    {
      icon: <Brain className="h-6 w-6 text-orange-500" />,
      title: "Mood-Based Experience",
      description: "The entire app adapts to your current mood, from colors to animations and music suggestions.",
      color: "from-orange-500/20 to-red-500/20",
    },
    {
      icon: <Music className="h-6 w-6 text-blue-500" />,
      title: "Integrated Music Player",
      description: "Listen to mood-appropriate music directly in the app while you work on your tasks.",
      color: "from-blue-500/20 to-purple-500/20",
    },
    {
      icon: <ListTodo className="h-6 w-6 text-green-500" />,
      title: "Advanced Task Management",
      description:
        "Create tasks with unlimited sub-tasks, track progress, and organize your work with a beautiful interface.",
      color: "from-green-500/20 to-teal-500/20",
    },
    {
      icon: <Focus className="h-6 w-6 text-amber-500" />,
      title: "Immersive Focus Mode",
      description: "Enter a distraction-free environment for deep work with built-in timer, notes, and AI assistance.",
      color: "from-amber-500/20 to-yellow-500/20",
    },
    {
      icon: <Bot className="h-6 w-6 text-pink-500" />,
      title: "AI-Powered Assistant",
      description: "Get help breaking down tasks, overcoming blocks, and staying motivated with context-aware AI.",
      color: "from-pink-500/20 to-purple-500/20",
    },
    {
      icon: <FileText className="h-6 w-6 text-indigo-500" />,
      title: "PDF Document Viewer",
      description: "Read and study PDF documents without leaving the app, with music controls still accessible.",
      color: "from-indigo-500/20 to-blue-500/20",
    },
  ]

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  // Background animation elements
  const backgroundElements = Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    size: Math.random() * 10 + 5,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 20 + 10,
    delay: Math.random() * 5,
  }))

  const handleGetStarted = () => {
    if (isAuthenticated || isGuest) {
      onGetStarted()
    } else {
      setIsAuthModalOpen(true)
    }
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundElements.map((el) => (
          <motion.div
            key={el.id}
            className="absolute rounded-full bg-primary/5"
            style={{
              width: el.size,
              height: el.size,
              left: `${el.x}%`,
              top: `${el.y}%`,
            }}
            animate={{
              x: [
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
              ],
              y: [
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
                Math.random() * 100 - 50,
              ],
              scale: [1, 1.2, 0.8, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: el.duration,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay: el.delay,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-4 md:p-6">
        <div className="flex items-center">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold mr-2"
          >
            🎶
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl font-bold"
          >
            NoteFlow
          </motion.h1>
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Button variant="outline" size="sm" onClick={onGetStarted} className="flex items-center gap-1">
                Go to App
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1"
                >
                  <LogIn className="h-3.5 w-3.5 mr-1" />
                  Login
                </Button>
              </motion.div>
              {!isMobile && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      setIsAuthModalOpen(true)
                      setTimeout(() => {
                        const button = document.querySelector('button[aria-label="Register"]') as HTMLButtonElement | null;
                        button?.click();
                      }, 100)
                    }}
                    className="flex items-center gap-1"
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Register
                  </Button>
                </motion.div>
              )}
            </div>
          )}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://buymeacoffee.com/noteflow", "_blank")}
              className="flex items-center gap-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:hover:bg-amber-800/60 dark:text-amber-100 dark:border-amber-700/50"
            >
              <Coffee className="h-3.5 w-3.5" />
              Buy Me a Coffee
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row items-center p-4 md:p-8 max-w-7xl mx-auto w-full relative z-10">
        {/* Left column - Hero text */}
        <motion.div
          className="md:w-1/2 text-center md:text-left mb-8 md:mb-0"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-block mb-2 flex gap-2">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              Mood-Based Productivity
            </span>
            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
              <span className="h-1.5 w-1.5 bg-white rounded-full animate-pulse"></span>
              AI-Powered
            </span>
          </motion.div>

          <motion.h2 variants={itemVariants} className="text-3xl md:text-5xl font-bold mb-4 tracking-tight">
            Productivity that{" "}
            <span className="text-primary relative">
              understands you
              <motion.div
                className="absolute -bottom-1 left-0 w-full h-1 bg-primary/30 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, delay: 1 }}
              />
            </span>
          </motion.h2>

          <motion.p variants={itemVariants} className="text-muted-foreground text-lg mb-6 max-w-xl">
            NoteFlow adapts to your emotional state with advanced task management, immersive focus mode, and AI
            assistance to help you achieve more with less stress.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-wrap gap-3 justify-center md:justify-start">
            <Button size="lg" onClick={handleGetStarted} className="gap-2 group">
              Get Started
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const featuresSection = document.getElementById("features")
                featuresSection?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Explore Features
            </Button>
          <ProductHuntBadge />
          </motion.div>

          <motion.div variants={itemVariants} className="mt-8 flex items-center justify-center md:justify-start">
            <div className="flex -space-x-2">
              {[
                "/placeholder.svg?height=40&width=40",
                "/placeholder.svg?height=40&width=40",
                "/placeholder.svg?height=40&width=40",
              ].map((src, i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full border-2 border-background overflow-hidden"
                  style={{ zIndex: 3 - i }}
                >
                  <img src={src || "/placeholder.svg"} alt={`User ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="ml-2 text-sm text-muted-foreground">
              <span className="font-medium">500+</span> happy users
            </div>
          </motion.div>
        </motion.div>

        {/* Right column - App preview */}
        <motion.div
          className="md:w-1/2 flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <div className="relative">
            <motion.div
              className="absolute -inset-4 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 blur-xl"
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
            />
            <motion.div
              className="relative bg-background border rounded-xl shadow-xl overflow-hidden"
              style={{ width: isMobile ? 300 : 500, height: isMobile ? 200 : 300 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
              <div className="absolute top-0 left-0 right-0 h-8 bg-muted flex items-center px-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <div className="text-xs text-center flex-1">NoteFlow - Mood-Based Productivity</div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, 0, -5, 0],
                    }}
                    transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY }}
                    className="text-5xl mb-4"
                  >
                    🎶
                  </motion.div>
                  <h3 className="text-xl font-bold mb-2">NoteFlow</h3>
                  <p className="text-sm text-muted-foreground">Your mood-adaptive workspace</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>

      {/* Features section */}
      <section id="features" className="py-16 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover how NoteFlow adapts to your mood and enhances your productivity experience.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Feature showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="bg-background border rounded-xl overflow-hidden shadow-lg"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={`h-full min-h-[300px] p-8 flex items-center justify-center bg-gradient-to-br ${features[activeFeature].color}`}
              >
                <div className="text-center max-w-md">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="bg-background/80 backdrop-blur-sm w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    {features[activeFeature].icon}
                  </motion.div>
                  <motion.h3
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-xl font-bold mb-2"
                  >
                    {features[activeFeature].title}
                  </motion.h3>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-muted-foreground"
                  >
                    {features[activeFeature].description}
                  </motion.p>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  activeFeature === index ? "bg-primary/10 border-primary/30" : "hover:bg-muted/50"
                }`}
                onClick={() => setActiveFeature(index)}
              >
                <div className="flex items-center">
                  <div className="mr-4">{feature.icon}</div>
                  <div>
                    <h3 className="font-medium">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-1">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-primary/20 to-primary/5 border rounded-xl p-8 md:p-12 text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for a workspace that understands you?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience NoteFlow today and discover how productivity feels when your tools adapt to your emotional state.
          </p>
          <Button size="lg" onClick={handleGetStarted} className="gap-2 group">
            Get Started Now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4 md:px-8 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <div className="text-2xl mr-2">🎶</div>
            <div>
              <h3 className="font-bold">NoteFlow</h3>
              <p className="text-xs text-muted-foreground">Mood-Based Productivity</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              Made with <span className="text-red-500">❤️</span> by ServerSync
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              © {new Date().getFullYear()} ServerSync. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onContinueAsGuest={onGetStarted} />
    </div>
  )
}
