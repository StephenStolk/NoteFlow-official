"use client"

import type React from "react"

import { useMood } from "@/components/mood-context"
import { useEffect, useState, useRef } from "react"
import { Cloud, Sun, Stars, Zap, Sparkles, Droplets } from "lucide-react"
import { useTheme } from "@/components/theme-provider"

export default function BackgroundAnimation() {
  const { currentMood } = useMood()
  const { theme = "light" } = useTheme()
  const [elements, setElements] = useState<React.ReactNode[]>([])
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Canvas-based animations
  useEffect(() => {
    let animationId: number | null = null
    let ctx: CanvasRenderingContext2D | null = null

    if (canvasRef.current) {
      ctx = canvasRef.current.getContext("2d")

      if (ctx) {
        // Set canvas dimensions
        const resizeCanvas = () => {
          if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth
            canvasRef.current.height = window.innerHeight
          }
        }

        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        // Animation variables
        let particles: any[] = []
        let blobs: any[] = []
        let rays: any[] = []
        let pulses: any[] = []
        let dots: any[] = []
        let raindrops: any[] = []
        let musicNotes: any[] = []

        // Initialize animations based on mood
        const initAnimations = () => {
          // Clear previous animations
          particles = []
          blobs = []
          rays = []
          pulses = []
          dots = []
          raindrops = []
          musicNotes = []

          // Add music notes for all moods
          const noteCount = 15
          for (let i = 0; i < noteCount; i++) {
            musicNotes.push({
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              size: Math.random() * 15 + 10,
              speed: Math.random() * 1 + 0.5,
              opacity: Math.random() * 0.2 + 0.1,
              rotation: Math.random() * 360,
              rotationSpeed: (Math.random() - 0.5) * 2,
            })
          }

          switch (currentMood) {
            case "motivated":
              // Sun rays
              const rayCount = 12
              const centerX = window.innerWidth / 2
              const centerY = window.innerHeight + 100

              for (let i = 0; i < rayCount; i++) {
                const angle = (i / rayCount) * Math.PI * 2
                rays.push({
                  angle,
                  length: Math.random() * 200 + 300,
                  width: Math.random() * 20 + 10,
                })
              }
              break

            case "feelingLow":
              // Raindrops
              const raindropCount = Math.floor(window.innerWidth / 4)

              for (let i = 0; i < raindropCount; i++) {
                raindrops.push({
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  length: Math.random() * 20 + 10,
                  speed: Math.random() * 10 + 5,
                  thickness: Math.random() * 2 + 1,
                })
              }
              break

            case "energized":
              // Electric pulses
              const pulseCount = 20

              for (let i = 0; i < pulseCount; i++) {
                pulses.push({
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  radius: Math.random() * 50 + 20,
                  color:
                    theme === "dark"
                      ? `rgba(0, 255, 255, ${Math.random() * 0.3 + 0.1})`
                      : `rgba(0, 200, 255, ${Math.random() * 0.3 + 0.1})`,
                  growth: Math.random() * 0.5 + 0.5,
                  maxRadius: Math.random() * 100 + 50,
                })
              }
              break

            case "lazy":
              // Dust particles
              const particleCount = 70

              for (let i = 0; i < particleCount; i++) {
                particles.push({
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  radius: Math.random() * 3 + 1,
                  color:
                    theme === "dark"
                      ? `rgba(255, 220, 180, ${Math.random() * 0.2 + 0.05})`
                      : `rgba(255, 220, 180, ${Math.random() * 0.3 + 0.1})`,
                  speedX: Math.random() * 0.2 - 0.1,
                  speedY: Math.random() * 0.2 - 0.1,
                })
              }
              break

            case "focused":
              // Minimal dots
              const spacing = 40
              const rows = Math.ceil(window.innerHeight / spacing)
              const cols = Math.ceil(window.innerWidth / spacing)

              for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                  dots.push({
                    x: j * spacing,
                    y: i * spacing,
                    radius: Math.random() * 1.5 + 0.5,
                    alpha: Math.random() * 0.1 + 0.05,
                  })
                }
              }
              break

            case "creative":
              // Fluid blobs
              const blobCount = 7
              const colors =
                theme === "dark"
                  ? [
                      "rgba(255, 100, 255, 0.08)",
                      "rgba(100, 200, 255, 0.08)",
                      "rgba(255, 200, 100, 0.08)",
                      "rgba(200, 100, 255, 0.08)",
                      "rgba(100, 255, 200, 0.08)",
                    ]
                  : [
                      "rgba(255, 100, 255, 0.1)",
                      "rgba(100, 200, 255, 0.1)",
                      "rgba(255, 200, 100, 0.1)",
                      "rgba(200, 100, 255, 0.1)",
                      "rgba(100, 255, 200, 0.1)",
                    ]

              for (let i = 0; i < blobCount; i++) {
                const blob = {
                  x: Math.random() * window.innerWidth,
                  y: Math.random() * window.innerHeight,
                  radius: Math.random() * 100 + 100,
                  color: colors[i % colors.length],
                  speedX: Math.random() * 0.5 - 0.25,
                  speedY: Math.random() * 0.5 - 0.25,
                  points: [] as any[],
                }

                // Create blob points
                const pointCount = 8
                for (let j = 0; j < pointCount; j++) {
                  const angle = (j / pointCount) * Math.PI * 2
                  const radius = blob.radius + Math.random() * 50 - 25
                  blob.points.push({
                    angle,
                    radius,
                    originalRadius: radius,
                    speed: Math.random() * 0.01 + 0.005,
                  })
                }

                blobs.push(blob)
              }
              break
          }
        }

        initAnimations()

        // Draw music notes
        const drawMusicNotes = () => {
          if (!ctx) return

          for (let i = 0; i < musicNotes.length; i++) {
            const note = musicNotes[i]

            ctx.save()
            ctx.translate(note.x, note.y)
            ctx.rotate((note.rotation * Math.PI) / 180)

            // Draw music note
            const noteColor =
              theme === "dark" ? "rgba(255, 255, 255, " + note.opacity + ")" : "rgba(0, 0, 0, " + note.opacity + ")"
            ctx.fillStyle = noteColor

            // Draw note head
            ctx.beginPath()
            ctx.ellipse(0, 0, note.size / 3, note.size / 5, 0, 0, Math.PI * 2)
            ctx.fill()

            // Draw note stem
            ctx.fillRect(note.size / 3 - 1, -note.size / 2, 2, note.size / 2)

            ctx.restore()

            // Move note
            note.y -= note.speed
            note.rotation += note.rotationSpeed

            // Reset if off screen
            if (note.y < -note.size) {
              note.y = window.innerHeight + note.size
              note.x = Math.random() * window.innerWidth
            }
          }
        }

        // Draw functions for each mood
        const drawMotivated = () => {
          if (!ctx) return

          // Draw sun
          const centerX = window.innerWidth / 2
          const centerY = window.innerHeight + 100

          const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 300)

          if (theme === "dark") {
            gradient.addColorStop(0, "rgba(255, 150, 0, 0.6)")
            gradient.addColorStop(0.5, "rgba(255, 100, 0, 0.3)")
            gradient.addColorStop(1, "rgba(255, 50, 0, 0)")
          } else {
            gradient.addColorStop(0, "rgba(255, 200, 0, 0.8)")
            gradient.addColorStop(0.5, "rgba(255, 120, 0, 0.4)")
            gradient.addColorStop(1, "rgba(255, 80, 0, 0)")
          }

          ctx.beginPath()
          ctx.arc(centerX, centerY, 150, 0, Math.PI * 2)
          ctx.fillStyle = gradient
          ctx.fill()

          // Draw rays
          for (let i = 0; i < rays.length; i++) {
            const ray = rays[i]

            ctx.beginPath()
            ctx.moveTo(centerX, centerY)
            const endX = centerX + Math.cos(ray.angle) * ray.length
            const endY = centerY + Math.sin(ray.angle) * ray.length
            ctx.lineTo(endX, endY)

            ctx.lineWidth = ray.width
            ctx.strokeStyle = theme === "dark" ? "rgba(255, 120, 0, 0.15)" : "rgba(255, 150, 0, 0.2)"
            ctx.stroke()

            ray.length += Math.sin(Date.now() / 1000) * 2
            ray.angle += 0.001
          }
        }

        const drawFeelingLow = () => {
          if (!ctx) return

          // Draw raindrops
          ctx.strokeStyle = theme === "dark" ? "rgba(120, 160, 200, 0.3)" : "rgba(174, 194, 224, 0.3)"

          for (let i = 0; i < raindrops.length; i++) {
            const drop = raindrops[i]

            ctx.beginPath()
            ctx.moveTo(drop.x, drop.y)
            ctx.lineTo(drop.x, drop.y + drop.length)
            ctx.lineWidth = drop.thickness
            ctx.stroke()

            drop.y += drop.speed

            if (drop.y > window.innerHeight) {
              drop.y = -drop.length
              drop.x = Math.random() * window.innerWidth
            }
          }
        }

        const drawEnergized = () => {
          if (!ctx) return

          // Draw electric pulses
          for (let i = 0; i < pulses.length; i++) {
            const pulse = pulses[i]

            ctx.beginPath()
            ctx.arc(pulse.x, pulse.y, pulse.radius, 0, Math.PI * 2)
            ctx.fillStyle = pulse.color
            ctx.fill()

            pulse.radius += pulse.growth

            if (pulse.radius > pulse.maxRadius) {
              pulse.radius = 0
              pulse.x = Math.random() * window.innerWidth
              pulse.y = Math.random() * window.innerHeight
            }
          }
        }

        const drawLazy = () => {
          if (!ctx) return

          // Draw cozy room elements
          // Window frame
          ctx.fillStyle = theme === "dark" ? "rgba(180, 150, 100, 0.08)" : "rgba(210, 180, 140, 0.1)"
          ctx.fillRect(window.innerWidth - 300, 50, 250, 350)

          // Window light
          const windowGradient = ctx.createLinearGradient(window.innerWidth - 300, 50, window.innerWidth - 50, 400)
          windowGradient.addColorStop(0, theme === "dark" ? "rgba(255, 200, 100, 0.03)" : "rgba(255, 220, 150, 0.05)")
          windowGradient.addColorStop(1, "rgba(255, 220, 150, 0)")

          ctx.fillStyle = windowGradient
          ctx.fillRect(window.innerWidth - 300, 50, 250, 350)

          // Cat silhouette
          ctx.fillStyle = theme === "dark" ? "rgba(80, 70, 60, 0.1)" : "rgba(100, 90, 80, 0.1)"
          ctx.beginPath()
          ctx.ellipse(window.innerWidth - 200, window.innerHeight - 100, 60, 30, 0, 0, Math.PI * 2)
          ctx.fill()

          // Cat ears
          ctx.beginPath()
          ctx.moveTo(window.innerWidth - 230, window.innerHeight - 120)
          ctx.lineTo(window.innerWidth - 220, window.innerHeight - 140)
          ctx.lineTo(window.innerWidth - 210, window.innerHeight - 120)
          ctx.fill()

          ctx.beginPath()
          ctx.moveTo(window.innerWidth - 190, window.innerHeight - 120)
          ctx.lineTo(window.innerWidth - 180, window.innerHeight - 140)
          ctx.lineTo(window.innerWidth - 170, window.innerHeight - 120)
          ctx.fill()

          // Draw dust particles
          for (let i = 0; i < particles.length; i++) {
            const p = particles[i]

            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
            ctx.fillStyle = p.color
            ctx.fill()

            p.x += p.speedX
            p.y += p.speedY

            // Slow drift based on sine wave
            p.x += Math.sin(Date.now() / 3000) * 0.3
            p.y += Math.cos(Date.now() / 4000) * 0.2

            // Wrap around edges
            if (p.x < 0) p.x = window.innerWidth
            if (p.x > window.innerWidth) p.x = 0
            if (p.y < 0) p.y = window.innerHeight
            if (p.y > window.innerHeight) p.y = 0
          }
        }

        const drawFocused = () => {
          if (!ctx) return

          // Add subtle vignette
          const gradient = ctx.createRadialGradient(
            window.innerWidth / 2,
            window.innerHeight / 2,
            0,
            window.innerWidth / 2,
            window.innerHeight / 2,
            window.innerWidth / 1.5,
          )
          gradient.addColorStop(0, "rgba(0, 0, 0, 0)")
          gradient.addColorStop(1, theme === "dark" ? "rgba(0, 0, 0, 0.3)" : "rgba(0, 0, 0, 0.1)")

          ctx.fillStyle = gradient
          ctx.fillRect(0, 0, window.innerWidth, window.innerHeight)

          // Draw dots
          for (let i = 0; i < dots.length; i++) {
            const dot = dots[i]

            ctx.beginPath()
            ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2)
            ctx.fillStyle = theme === "dark" ? `rgba(150, 150, 150, ${dot.alpha})` : `rgba(100, 100, 100, ${dot.alpha})`
            ctx.fill()

            // Subtle pulsing
            dot.alpha = 0.05 + Math.sin(Date.now() / 3000 + i) * 0.03
          }
        }

        const drawCreative = () => {
          if (!ctx) return

          // Draw blobs
          for (let i = 0; i < blobs.length; i++) {
            const blob = blobs[i]

            ctx.beginPath()

            // Draw blob shape
            for (let j = 0; j < blob.points.length; j++) {
              const point = blob.points[j]

              // Update point radius with sine wave
              point.radius = point.originalRadius + Math.sin(Date.now() / 1000 + j) * 20

              const x = blob.x + Math.cos(point.angle) * point.radius
              const y = blob.y + Math.sin(point.angle) * point.radius

              if (j === 0) {
                ctx.moveTo(x, y)
              } else {
                ctx.lineTo(x, y)
              }

              // Update angle
              point.angle += point.speed
            }

            ctx.closePath()
            ctx.fillStyle = blob.color
            ctx.fill()

            // Move blob
            blob.x += blob.speedX
            blob.y += blob.speedY

            // Bounce off edges
            if (blob.x < 0 || blob.x > window.innerWidth) blob.speedX *= -1
            if (blob.y < 0 || blob.y > window.innerHeight) blob.speedY *= -1
          }
        }

        // Main animation loop
        const animate = () => {
          if (!ctx) return

          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

          switch (currentMood) {
            case "motivated":
              drawMotivated()
              break
            case "feelingLow":
              drawFeelingLow()
              break
            case "energized":
              drawEnergized()
              break
            case "lazy":
              drawLazy()
              break
            case "focused":
              drawFocused()
              break
            case "creative":
              drawCreative()
              break
          }

          // Draw music notes for all moods
          drawMusicNotes()

          animationId = requestAnimationFrame(animate)
        }

        animate()

        return () => {
          if (animationId) {
            cancelAnimationFrame(animationId)
          }
          window.removeEventListener("resize", resizeCanvas)
        }
      }
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [currentMood, theme])

  // Generate SVG elements for additional decoration
  useEffect(() => {
    // Clear previous elements when mood changes
    setElements([])

    // Create new elements based on mood
    const newElements: React.ReactNode[] = []

    switch (currentMood) {
      case "motivated":
        // Add some floating sparks
        for (let i = 0; i < 8; i++) {
          const left = Math.random() * 100
          const top = Math.random() * 100
          const sparkSize = Math.random() * 15 + 8
          const duration = Math.random() * 8 + 4
          const delay = Math.random() * 3

          newElements.push(
            <div
              key={`motivated-spark-${i}`}
              className="absolute opacity-20 text-orange-500"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
              }}
            >
              <Sparkles size={sparkSize} className="text-yellow-500" />
            </div>,
          )
        }
        break

      case "feelingLow":
        // Add some clouds
        for (let i = 0; i < 5; i++) {
          const left = Math.random() * 100
          const cloudTop = Math.random() * 40
          const cloudSize = Math.random() * 25 + 15
          const duration = Math.random() * 15 + 25
          const delay = Math.random() * 8

          newElements.push(
            <div
              key={`low-cloud-${i}`}
              className="absolute opacity-10 text-blue-300"
              style={{
                left: `${left}%`,
                top: `${cloudTop}%`,
                animation: `floatSideways ${duration}s linear ${delay}s infinite`,
              }}
            >
              <Cloud size={cloudSize} className="fill-blue-100" />
            </div>,
          )
        }

        // Add some droplets
        for (let i = 0; i < 5; i++) {
          const left = Math.random() * 100
          const top = Math.random() * 60 + 20
          const size = Math.random() * 15 + 8
          const duration = Math.random() * 10 + 15
          const delay = Math.random() * 5

          newElements.push(
            <div
              key={`low-drop-${i}`}
              className="absolute opacity-10 text-blue-300"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animation: `float ${duration}s ease-in-out ${delay}s infinite alternate`,
              }}
            >
              <Droplets size={size} className="fill-blue-100" />
            </div>,
          )
        }
        break

      case "energized":
        // Add some zaps
        for (let i = 0; i < 8; i++) {
          const left = Math.random() * 100
          const top = Math.random() * 100
          const size = Math.random() * 12 + 6
          const duration = Math.random() * 2 + 0.5
          const delay = Math.random() * 1

          newElements.push(
            <div
              key={`energized-zap-${i}`}
              className="absolute opacity-20 text-cyan-500"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animation: `pulse ${duration}s ease-in-out ${delay}s infinite`,
              }}
            >
              <Zap size={size} className="fill-cyan-200" />
            </div>,
          )
        }
        break

      case "lazy":
        // Add a sun
        newElements.push(
          <div
            key="lazy-sun"
            className="absolute opacity-10 text-amber-300"
            style={{
              right: "10%",
              top: "10%",
              animation: `floatVerySlowly 40s ease-in-out infinite alternate`,
            }}
          >
            <Sun size={80} className="fill-amber-100" />
          </div>,
        )
        break

      case "creative":
        // Add some stars and sparkles
        for (let i = 0; i < 10; i++) {
          const left = Math.random() * 100
          const top = Math.random() * 100
          const starSize = Math.random() * 15 + 8
          const duration = Math.random() * 6 + 3
          const delay = Math.random() * 3

          newElements.push(
            <div
              key={`creative-star-${i}`}
              className="absolute opacity-20 text-pink-400"
              style={{
                left: `${left}%`,
                top: `${top}%`,
                animation: `pulse ${duration}s ease-in-out ${delay}s infinite alternate`,
              }}
            >
              {i % 2 === 0 ? (
                <Stars size={starSize} className="fill-purple-200" />
              ) : (
                <Sparkles size={starSize} className="text-violet-400" />
              )}
            </div>,
          )
        }
        break
    }

    setElements(newElements)
  }, [currentMood])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      {elements}
    </div>
  )
}
