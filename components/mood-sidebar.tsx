"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { useMood } from "@/components/mood-context"
import { moods } from "@/lib/moods"
import { Flame, Cloud, Zap, Coffee, Target, Palette, FileText, Upload, File } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { useMobile } from "@/hooks/use-mobile"

interface MoodSidebarProps {
  onOpenPdf: (file: File) => void
  uploadedPdfs?: File[]
}

export default function MoodSidebar({ onOpenPdf, uploadedPdfs = [] }: MoodSidebarProps) {
  const { currentMood, setMood } = useMood()
  const { toast } = useToast()
  const isMobile = useMobile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showPdfDropdown, setShowPdfDropdown] = useState(false)

  const moodIcons = {
    motivated: Flame,
    feelingLow: Cloud,
    energized: Zap,
    lazy: Coffee,
    focused: Target,
    creative: Palette,
  }

  const handleMoodChange = (mood: string) => {
    if (mood !== currentMood) {
      setMood(mood as any)

      // Show toast with mood change
      toast({
        title: `Mood: ${moods[mood as keyof typeof moods].label}`,
        description: moods[mood as keyof typeof moods].description,
        duration: 3000,
      })
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]

      // Check if file is a PDF
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File Type",
          description: "Please upload a PDF file.",
          variant: "destructive",
          duration: 3000,
        })
        return
      }

      // Pass the file to the parent component
      onOpenPdf(file)

      toast({
        title: "Document Uploaded",
        description: `Opening ${file.name}`,
        duration: 3000,
      })
    }

    // Reset the input value to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 },
  }

  // Get mood-specific color for the upload button
  const getUploadButtonColor = () => {
    switch (currentMood) {
      case "motivated":
        return "text-orange-500 hover:text-orange-600"
      case "feelingLow":
        return "text-blue-400 hover:text-blue-500"
      case "energized":
        return "text-cyan-500 hover:text-cyan-600"
      case "lazy":
        return "text-amber-300 hover:text-amber-400"
      case "focused":
        return "text-gray-700 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-200"
      case "creative":
        return "text-pink-400 hover:text-pink-500"
      default:
        return "text-primary hover:text-primary/80"
    }
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showPdfDropdown) {
        const target = e.target as HTMLElement
        if (!target.closest(".dropdown-container")) {
          setShowPdfDropdown(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showPdfDropdown])

  return (
    <div>
      <motion.div
        className="w-20 border-r h-screen flex flex-col items-center py-4 z-10 bg-background"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div className="flex flex-col items-center gap-3" variants={container} initial="hidden" animate="show">
          {Object.entries(moods).map(([mood, data], index) => {
            const MoodIcon = moodIcons[mood as keyof typeof moodIcons]
            const isActive = currentMood === mood

            return (
              <motion.div key={mood} variants={item} className="relative flex flex-col items-center">
                <div className="tooltip-wrapper">
                  <motion.button
                    className={cn(
                      `${isMobile ? "w-12 h-12" : "w-14 h-14"} rounded-full flex items-center justify-center mb-1 relative`,
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80",
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleMoodChange(mood)}
                    title={data.label}
                  >
                    <MoodIcon className={`${isMobile ? "h-5 w-5" : "h-6 w-6"}`} />
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        layoutId="activeMood"
                      />
                    )}
                  </motion.button>
                </div>

                {isActive && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`${isMobile ? "text-[10px]" : "text-xs"} text-center font-medium text-primary`}
                  >
                    {data.label}
                  </motion.div>
                )}
              </motion.div>
            )
          })}

          {/* Separator */}
          <div className="w-10 h-px bg-border my-2"></div>

          {/* Document Upload Button */}
          <motion.div variants={item} className="relative flex flex-col items-center dropdown-container">
            <div className="tooltip-wrapper">
              {uploadedPdfs && uploadedPdfs.length > 0 ? (
                <div className="relative">
                  <motion.button
                    className={cn(
                      `${isMobile ? "w-12 h-12" : "w-14 h-14"} rounded-full flex items-center justify-center mb-1 relative`,
                      "bg-muted hover:bg-muted/80 transition-colors duration-300",
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPdfDropdown(!showPdfDropdown)}
                    title="Upload or View PDF Documents"
                  >
                    <FileText className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} ${getUploadButtonColor()}`} />
                    <motion.div
                      className="absolute bottom-1 right-1 bg-primary rounded-full flex items-center justify-center"
                      style={{ width: isMobile ? "16px" : "18px", height: isMobile ? "16px" : "18px" }}
                    >
                      <Upload className={`${isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} text-primary-foreground`} />
                    </motion.div>
                  </motion.button>

                  {showPdfDropdown && (
                    <div className="absolute left-full ml-2 w-48 rounded-md bg-background border shadow-lg z-50">
                      <div className="py-1 px-2 text-xs font-medium border-b">PDF Documents</div>
                      <div className="p-1 max-h-60 overflow-y-auto">
                        <button
                          className="flex w-full items-center px-2 py-1.5 text-xs hover:bg-muted rounded-sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleUploadClick()
                            setShowPdfDropdown(false)
                          }}
                        >
                          <Upload className="h-3 w-3 mr-2" />
                          Upload New PDF
                        </button>

                        {uploadedPdfs.map((pdf, index) => (
                          <button
                            key={index}
                            className="flex w-full items-center px-2 py-1.5 text-xs hover:bg-muted rounded-sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              onOpenPdf(pdf)
                              setShowPdfDropdown(false)
                            }}
                          >
                            <File className="h-3 w-3 mr-2" />
                            <span className="truncate">
                              {pdf.name.length > 20 ? `${pdf.name.substring(0, 17)}...` : pdf.name}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <motion.button
                  className={cn(
                    `${isMobile ? "w-12 h-12" : "w-14 h-14"} rounded-full flex items-center justify-center mb-1 relative`,
                    "bg-muted hover:bg-muted/80 transition-colors duration-300",
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleUploadClick}
                  title="Upload or View PDF Documents"
                >
                  <FileText className={`${isMobile ? "h-5 w-5" : "h-6 w-6"} ${getUploadButtonColor()}`} />
                  <motion.div
                    className="absolute bottom-1 right-1 bg-primary rounded-full flex items-center justify-center"
                    style={{ width: isMobile ? "16px" : "18px", height: isMobile ? "16px" : "18px" }}
                  >
                    <Upload className={`${isMobile ? "h-3 w-3" : "h-3.5 w-3.5"} text-primary-foreground`} />
                  </motion.div>
                </motion.button>
              )}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`${isMobile ? "text-[10px]" : "text-xs"} text-center font-medium`}
            >
              Documents
            </motion.div>
          </motion.div>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="application/pdf"
            className="hidden"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
