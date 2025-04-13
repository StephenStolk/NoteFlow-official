"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useMood } from "@/components/mood-context"
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Music,
  Youtube,
  Search,
  Upload,
  Headphones,
  Eye,
  EyeOff,
  Loader2,
  X,
  Heart,
  Clock,
  Shuffle,
  Repeat,
  ChevronDown,
  ChevronUp,
  Mic,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { motion, AnimatePresence } from "framer-motion"
import { useMobile } from "@/hooks/use-mobile"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Declare webkitSpeechRecognition
declare global {
  interface Window {
    webkitSpeechRecognition: any
  }
}

// Add these props to the MusicPlayer component
interface MusicPlayerProps {
  onPlayStateChange?: (isPlaying: boolean) => void
  onVideoChange?: (videoId: string | null) => void
  className?: string
}

export default function MusicPlayer({ onPlayStateChange, onVideoChange, className = "" }: MusicPlayerProps) {
  const { currentMood, moodData, isTransitioning } = useMood()
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [activeTab, setActiveTab] = useState("youtube")
  const [youtubeSearch, setYoutubeSearch] = useState("")
  const [youtubeResults, setYoutubeResults] = useState<any[]>([])
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [localTracks, setLocalTracks] = useState<File[]>([])
  const [currentLocalTrack, setCurrentLocalTrack] = useState<number | null>(null)
  const [localTrackUrls, setLocalTrackUrls] = useState<string[]>([])
  const [hideVideo, setHideVideo] = useState(false)
  const [currentQuote, setCurrentQuote] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [youtubeError, setYoutubeError] = useState<string | null>(null)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [showRecentSearches, setShowRecentSearches] = useState(false)
  const [isShuffleOn, setIsShuffleOn] = useState(false)
  const [isRepeatOn, setIsRepeatOn] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [likedVideos, setLikedVideos] = useState<string[]>([])
  const [showVoiceSearch, setShowVoiceSearch] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [directVideoId, setDirectVideoId] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isPlayerVisible, setIsPlayerVisible] = useState(true)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const youtubeRef = useRef<HTMLIFrameElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const { toast } = useToast()
  const isMobile = useMobile()
  const playerRef = useRef<HTMLDivElement>(null)

  // Handle mood transitions without restarting YouTube videos
  useEffect(() => {
    if (isTransitioning && activeTab === "youtube" && selectedVideo) {
      // Don't reload the iframe when mood changes to preserve playback position
      console.log("Mood changed but preserving YouTube playback")
    }
  }, [isTransitioning, currentMood, activeTab, selectedVideo])

  // Handle YouTube iframe visibility without reloading
  useEffect(() => {
    if (selectedVideo && youtubeRef.current) {
      // Make sure we don't reload the iframe when toggling visibility
      // This ensures the audio keeps playing
      if (hideVideo) {
        // We're just hiding the iframe container, not removing it from DOM
        console.log("Video hidden but audio continues playing")
      }
    }
  }, [hideVideo, selectedVideo])

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSearches = localStorage.getItem("recentMusicSearches")
      if (savedSearches) {
        try {
          setRecentSearches(JSON.parse(savedSearches))
        } catch (e) {
          console.error("Error parsing recent searches:", e)
        }
      }
    }
  }, [])

  // Save recent searches to localStorage
  useEffect(() => {
    if (recentSearches.length > 0) {
      localStorage.setItem("recentMusicSearches", JSON.stringify(recentSearches))
    }
  }, [recentSearches])

  // Load liked videos from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLikedVideos = localStorage.getItem("likedVideos")
      if (savedLikedVideos) {
        try {
          setLikedVideos(JSON.parse(savedLikedVideos))
        } catch (e) {
          console.error("Error parsing liked videos:", e)
        }
      }
    }
  }, [])

  // Save liked videos to localStorage
  useEffect(() => {
    if (likedVideos.length > 0) {
      localStorage.setItem("likedVideos", JSON.stringify(likedVideos))
    }
  }, [likedVideos])

  // Motivational quotes
  const motivationalQuotes = [
    "The only way to do great work is to love what you do.",
    "Believe you can and you're halfway there.",
    "It does not matter how slowly you go as long as you do not stop.",
    "Success is not final, failure is not fatal: It is the courage to continue that counts.",
    "Your time is limited, don't waste it living someone else's life.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "Don't watch the clock; do what it does. Keep going.",
    "The secret of getting ahead is getting started.",
    "Quality is not an act, it is a habit.",
    "The only limit to our realization of tomorrow is our doubts of today.",
    "You are never too old to set another goal or to dream a new dream.",
    "The way to get started is to quit talking and begin doing.",
    "If you can dream it, you can do it.",
    "The harder you work for something, the greater you'll feel when you achieve it.",
    "Don't let yesterday take up too much of today.",
  ]

  // Enhanced sample videos for different music types
  const sampleVideos = {
    lofi: [
      { id: "5qap5aO4i9A", title: "lofi hip hop radio - beats to relax/study to", channel: "Lofi Girl" },
      { id: "jfKfPfyJRdk", title: "lofi hip hop radio - beats to study/relax to", channel: "Lofi Girl" },
      { id: "DWcJFNfaw9c", title: "lofi hip hop radio - beats to sleep/chill to", channel: "Lofi Girl" },
      { id: "rUxyKA_-grg", title: "lofi hip hop radio - sad & sleepy beats", channel: "the bootleg boy" },
      { id: "lTRiuFIWV54", title: "late night lofi hip hop radio", channel: "Chillhop Music" },
    ],
    classical: [
      { id: "mIYzp5rcTvU", title: "The Best of Classical Music", channel: "HALIDONMUSIC" },
      { id: "jgpJVI3tDbY", title: "Classical Music for Studying & Brain Power", channel: "HALIDONMUSIC" },
      { id: "c1Qr7TnWG74", title: "Mozart Classical Music for Studying", channel: "Classical Music" },
      { id: "XYiIR-d9y-I", title: "Chopin - Nocturnes", channel: "Classical Music" },
      { id: "1BxLGD4BSbA", title: "Relaxing Classical Piano Music", channel: "Relaxing Classical Music" },
    ],
    jazz: [
      { id: "neV3EPgvZ3g", title: "Relaxing Jazz Piano Radio", channel: "Cafe Music BGM" },
      { id: "Dx5qFachd3A", title: "Jazz Music • Smooth Jazz Saxophone", channel: "Relax Music" },
      { id: "fEvM-OUbaKs", title: "Jazz Cafe Music - Relaxing Bossa Nova Music", channel: "Cafe Music BGM" },
      { id: "DSGyEsJ17cI", title: "Relaxing Jazz Music - Background Chill Out Music", channel: "Cafe Music BGM" },
      { id: "PErqNqXeAQo", title: "Smooth Jazz Coffee Music", channel: "Coffee Music" },
    ],
    ambient: [
      { id: "tNkZsRW7h2c", title: "Space Ambient Music", channel: "Ambient" },
      { id: "sjkrrmBnpGE", title: "Deep Focus Music", channel: "4K Video Nature" },
      { id: "77ZozI0rw7w", title: "Ambient Study Music To Concentrate", channel: "Quiet Quest" },
      { id: "qvXvqHOMqJA", title: "Beautiful Ambient Music • Peaceful Piano Music", channel: "Soothing Relaxation" },
      { id: "n8NHvuFZD5A", title: "Ambient Music for Deep Focus", channel: "Yellow Brick Cinema" },
    ],
    nature: [
      { id: "eKFTSSKCzWA", title: "Relaxing Nature Sounds", channel: "Nature Sounds" },
      { id: "qRTVg8HHzUo", title: "Relaxing Music with Nature Sounds", channel: "Yellow Brick Cinema" },
      { id: "WZKW2Hq2fks", title: "Relaxing Rain Sounds", channel: "Nature White Noise" },
      { id: "IvjMgVS6kng", title: "Forest Sounds | Woodland Ambience", channel: "The Guild of Ambience" },
      { id: "d0tU18Ybcvk", title: "Ocean Wave Sounds for Sleep", channel: "The Sleep Sounds" },
    ],
    focus: [
      { id: "BTYAsjAVa3I", title: "Deep Focus Music - 4 Hours Study Music", channel: "Yellow Brick Cinema" },
      { id: "WPni755-Krg", title: "Concentration Music", channel: "Quiet Quest" },
      { id: "ARxV-CRL9Vs", title: "Alpha Waves Study Music", channel: "Greenred Productions" },
      { id: "sjkrrmBnpGE", title: "Deep Focus Music", channel: "4K Video Nature" },
      { id: "kMAOey45mJI", title: "Study Music Alpha Waves", channel: "YellowBrickCinema" },
    ],
    bollywood: [
      { id: "V7LwfY5U5WI", title: "Best of Bollywood Lofi", channel: "Lofi Bollywood" },
      { id: "eHr-g6MU_H8", title: "Bollywood Lofi Hits", channel: "Lofi Indian" },
      { id: "K5KAc5CoCuk", title: "Hindi Lofi Songs", channel: "Bollywood Butter" },
      { id: "c_iRx2Un07k", title: "Bollywood Chill Mix", channel: "Desi Vibes" },
      { id: "1YBl3Zbt80A", title: "Bollywood Lofi Study Mix", channel: "Indian Lofi" },
      { id: "NeXbmEnpSz0", title: "Hindi Songs 2023", channel: "Bollywood Music" },
      { id: "pFxBxvIGmvU", title: "Old Hindi Songs", channel: "Bollywood Classics" },
      { id: "Dpp1sIL1m5Q", title: "Bollywood Romantic Songs", channel: "T-Series" },
      { id: "X96pBw_rjrk", title: "Hindi Hits Songs 2023", channel: "Venus Music" },
      { id: "5Eqb_-j3FDA", title: "Arijit Singh Best Songs", channel: "Sony Music India" },
    ],
    kpop: [
      { id: "v3hbWS_a8HI", title: "K-pop Playlist 2023", channel: "K-Music" },
      { id: "T9DLuEjzqY0", title: "K-pop Lofi Mix", channel: "Lofi K-pop" },
      { id: "WFsAon_TWPQ", title: "K-pop Chill Vibes", channel: "K-Vibes" },
      { id: "8M3WUaeIbOk", title: "K-pop Study Playlist", channel: "Study K-pop" },
      { id: "f5_wn8mexmM", title: "K-pop Hits 2023", channel: "K-pop Radio" },
    ],
    indie: [
      { id: "wQkz_EXAqFc", title: "Indie/Pop/Folk Compilation", channel: "alexrainbirdMusic" },
      { id: "lSoM2sJ4N1M", title: "Indie Folk Central", channel: "Indie Folk Central" },
      { id: "nt4SnLRLlFk", title: "Indie/Rock/Alternative Compilation", channel: "alexrainbirdMusic" },
      { id: "5yx6BWlEVcY", title: "Indie Playlist 2023", channel: "Indie Music" },
      { id: "YqN8S3RKnTY", title: "Indie Coffee Shop Vibes", channel: "Indie Vibes" },
    ],
    // Additional popular music categories
    pop: [
      { id: "kffacxfA7G4", title: "Justin Bieber - Baby ft. Ludacris", channel: "JustinBieberVEVO" },
      { id: "JGwWNGJdvx8", title: "Ed Sheeran - Shape of You", channel: "Ed Sheeran" },
      { id: "RgKAFK5djSk", title: "Wiz Khalifa - See You Again ft. Charlie Puth", channel: "Wiz Khalifa" },
      { id: "fRh_vgS2dFE", title: "Justin Bieber - Sorry", channel: "JustinBieberVEVO" },
      { id: "YQHsXMglC9A", title: "Adele - Hello", channel: "AdeleVEVO" },
    ],
    edm: [
      { id: "gCYcHz2k5x0", title: "Martin Garrix - Animals", channel: "Spinnin' Records" },
      { id: "60ItHLz5WEA", title: "Alan Walker - Faded", channel: "Alan Walker" },
      { id: "k2qgadSvNyU", title: "Dua Lipa - New Rules", channel: "Dua Lipa" },
      { id: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito ft. Daddy Yankee", channel: "LuisFonsiVEVO" },
      { id: "papuvlVeZg8", title: "The Chainsmokers - Don't Let Me Down", channel: "ChainsmokersVEVO" },
    ],
    rock: [
      { id: "fJ9rUzIMcZQ", title: "Queen - Bohemian Rhapsody", channel: "Queen Official" },
      { id: "eVTXPUF4Oz4", title: "Linkin Park - In The End", channel: "Linkin Park" },
      { id: "hTWKbfoikeg", title: "Nirvana - Smells Like Teen Spirit", channel: "NirvanaVEVO" },
      { id: "1w7OgIMMRc4", title: "Guns N' Roses - Sweet Child O' Mine", channel: "GunsNRosesVEVO" },
      { id: "lDK9QqIzhwk", title: "Bon Jovi - Livin' On A Prayer", channel: "BonJoviVEVO" },
    ],
    // Popular artists
    taylorswift: [
      { id: "e-ORhEE9VVg", title: "Taylor Swift - Blank Space", channel: "TaylorSwiftVEVO" },
      { id: "QcIy9NiNbmo", title: "Taylor Swift - Bad Blood ft. Kendrick Lamar", channel: "TaylorSwiftVEVO" },
      { id: "3tmd-ClpJxA", title: "Taylor Swift - Look What You Made Me Do", channel: "TaylorSwiftVEVO" },
      { id: "IdneKLhsWOQ", title: "Taylor Swift - Shake It Off", channel: "TaylorSwiftVEVO" },
      { id: "VuNIsY6JdUw", title: "Taylor Swift - You Belong With Me", channel: "TaylorSwiftVEVO" },
    ],
    arijitsingh: [
      { id: "5Eqb_-j3FDA", title: "Arijit Singh Best Songs", channel: "Sony Music India" },
      { id: "hoNb6HuNmU0", title: "Arijit Singh - Tum Hi Ho", channel: "T-Series" },
      { id: "C8jScp-ys-Y", title: "Arijit Singh - Channa Mereya", channel: "Sony Music India" },
      { id: "Wd2B8OAotU8", title: "Arijit Singh - Kabira", channel: "YRF" },
      { id: "cNV5hLSa9H8", title: "Arijit Singh - Ae Dil Hai Mushkil", channel: "Sony Music India" },
    ],
    // Popular songs
    despacito: [{ id: "kJQP7kiw5Fk", title: "Luis Fonsi - Despacito ft. Daddy Yankee", channel: "LuisFonsiVEVO" }],
    seeyouagain: [{ id: "RgKAFK5djSk", title: "Wiz Khalifa - See You Again ft. Charlie Puth", channel: "Wiz Khalifa" }],
    gangnamstyle: [{ id: "9bZkp7q19f0", title: "PSY - Gangnam Style", channel: "officialpsy" }],
    uptown: [{ id: "OPf0YbXqDm0", title: "Mark Ronson - Uptown Funk ft. Bruno Mars", channel: "MarkRonsonVEVO" }],
    // French music
    french: [
      { id: "K5KAc5CoCuk", title: "French Lofi Mix", channel: "Lofi French" },
      { id: "DWcJFNfaw9c", title: "French Cafe Music", channel: "Cafe Music" },
      { id: "rUxyKA_-grg", title: "French Pop Hits", channel: "French Music" },
      { id: "lTRiuFIWV54", title: "French Classics", channel: "French Classics" },
      { id: "Ij65wvAGX-c", title: "Indila - Dernière Danse", channel: "IndilaVEVO" },
    ],
    indila: [
      { id: "Ij65wvAGX-c", title: "Indila - Dernière Danse", channel: "IndilaVEVO" },
      { id: "K5KAc5CoCuk", title: "Indila - Love Story", channel: "IndilaVEVO" },
      { id: "DWcJFNfaw9c", title: "Indila - Tourner Dans Le Vide", channel: "IndilaVEVO" },
      { id: "rUxyKA_-grg", title: "Indila - S.O.S", channel: "IndilaVEVO" },
      { id: "lTRiuFIWV54", title: "Indila - Ainsi Bas La Vida", channel: "IndilaVEVO" },
    ],
  }

  // Format time in minutes:seconds
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // Handle play/pause
  const togglePlay = () => {
    if (activeTab === "local" && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error)
          toast({
            title: "Playback Error",
            description: "There was an error playing this track.",
            variant: "destructive",
          })
        })
      }
      const newPlayState = !isPlaying
      setIsPlaying(newPlayState)

      // Notify parent component about play state change
      if (onPlayStateChange) {
        onPlayStateChange(newPlayState)
      }
    } else {
      setIsPlaying(!isPlaying)
      if (onPlayStateChange) {
        onPlayStateChange(!isPlaying)
      }
    }
  }

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100
    }
    if (newVolume === 0) {
      setIsMuted(true)
    } else {
      setIsMuted(false)
    }
  }

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    } else {
      setIsMuted(!isMuted)
    }
  }

  // Handle seeking
  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      const newTime = value[0]
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  // Handle track change
  const changeTrack = (direction: "next" | "prev") => {
    if (activeTab === "local" && localTracks.length > 0) {
      let newTrackIndex = currentLocalTrack !== null ? currentLocalTrack : 0

      if (isShuffleOn) {
        // Random track selection if shuffle is on
        newTrackIndex = Math.floor(Math.random() * localTracks.length)
      } else {
        // Normal sequential navigation
        if (direction === "next") {
          newTrackIndex = (newTrackIndex + 1) % localTracks.length
        } else {
          newTrackIndex = (newTrackIndex - 1 + localTracks.length) % localTracks.length
        }
      }

      setCurrentLocalTrack(newTrackIndex)
      setCurrentTime(0)

      if (isPlaying && audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play().catch(console.error)
      }
    }
  }

  // Check if a string is a YouTube video ID
  const isYouTubeVideoId = (str: string) => {
    // YouTube video IDs are typically 11 characters long and contain alphanumeric characters, underscores, and hyphens
    return /^[a-zA-Z0-9_-]{11}$/.test(str)
  }

  // Extract YouTube video ID from URL if present
  const extractYouTubeVideoId = (url: string) => {
    if (isYouTubeVideoId(url)) {
      return url
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)

    return match && match[2].length === 11 ? match[2] : null
  }

  // Enhanced YouTube search with improved functionality
  const handleYoutubeSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (youtubeSearch.trim()) {
      setIsSearching(true)
      setYoutubeResults([]) // Clear previous results
      setYoutubeError(null) // Clear any previous errors

      try {
        // Check if the search is a YouTube URL or video ID
        const videoId = extractYouTubeVideoId(youtubeSearch.trim())
        if (videoId) {
          // Direct video ID or URL provided
          setDirectVideoId(videoId)
          selectYoutubeVideo(videoId)
          setIsSearching(false)

          // Add to recent searches
          if (!recentSearches.includes(youtubeSearch)) {
            setRecentSearches((prev) => [youtubeSearch, ...prev.slice(0, 4)])
          }

          return
        }

        // Add to recent searches
        if (!recentSearches.includes(youtubeSearch)) {
          setRecentSearches((prev) => [youtubeSearch, ...prev.slice(0, 4)])
        }

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 300))

        // Combine all sample videos for better search results
        const allVideos = Object.values(sampleVideos).flat()
        const searchLower = youtubeSearch.toLowerCase()

        // First try exact match with priority for title matches
        let results = allVideos.filter((video) => video.title.toLowerCase().includes(searchLower))

        // If no title matches, try channel matches
        if (results.length === 0) {
          results = allVideos.filter((video) => video.channel.toLowerCase().includes(searchLower))
        }

        // If still no results, try partial matching with individual words
        if (results.length === 0) {
          const searchTerms = searchLower.split(/\s+/).filter((term) => term.length > 1)

          results = allVideos.filter((video) => {
            const title = video.title.toLowerCase()
            const channel = video.channel.toLowerCase()

            // Check if any search term is included in title or channel
            return searchTerms.some((term) => title.includes(term) || channel.includes(term))
          })
        }

        // Check for specific artist/genre matches
        const genres = Object.keys(sampleVideos)

        // Direct category match (e.g., "bollywood", "kpop", etc.)
        const directMatch = genres.find((genre) => genre.toLowerCase() === searchLower)
        if (directMatch) {
          results = sampleVideos[directMatch as keyof typeof sampleVideos]
          toast({
            title: `${directMatch.charAt(0).toUpperCase() + directMatch.slice(1)} Music`,
            description: `Showing ${directMatch} music based on your search.`,
            duration: 2000,
          })
        }

        // Partial category match
        if (results.length === 0) {
          const matchedGenre = genres.find(
            (genre) => genre.toLowerCase().includes(searchLower) || searchLower.includes(genre.toLowerCase()),
          )

          if (matchedGenre) {
            results = sampleVideos[matchedGenre as keyof typeof sampleVideos]
            toast({
              title: `${matchedGenre.charAt(0).toUpperCase() + matchedGenre.slice(1)} Music`,
              description: `Showing ${matchedGenre} music based on your search.`,
              duration: 2000,
            })
          }
        }

        // Special case handling for common searches

        // Bollywood/Hindi music
        if (
          searchLower.includes("bollywood") ||
          searchLower.includes("hindi") ||
          searchLower.includes("indian") ||
          searchLower.includes("desi")
        ) {
          results = sampleVideos.bollywood
        }

        // K-pop
        if (
          searchLower.includes("kpop") ||
          searchLower.includes("k-pop") ||
          searchLower.includes("korean") ||
          searchLower.includes("bts") ||
          searchLower.includes("blackpink")
        ) {
          results = sampleVideos.kpop
        }

        // French music
        if (
          searchLower.includes("french") ||
          searchLower.includes("france") ||
          searchLower.includes("indila") ||
          searchLower.includes("derniere") ||
          searchLower.includes("danse")
        ) {
          results = sampleVideos.french
        }

        // Specific artist searches
        if (searchLower.includes("taylor") || searchLower.includes("swift")) {
          results = sampleVideos.taylorswift
        }

        if (searchLower.includes("arijit") || searchLower.includes("singh")) {
          results = sampleVideos.arijitsingh
        }

        // Specific song searches
        if (searchLower.includes("despacito")) {
          results = sampleVideos.despacito
        }

        if (searchLower.includes("see you again") || searchLower.includes("charlie puth")) {
          results = sampleVideos.seeyouagain
        }

        if (searchLower.includes("gangnam") || searchLower.includes("psy")) {
          results = sampleVideos.gangnamstyle
        }

        if (searchLower.includes("uptown") || searchLower.includes("funk") || searchLower.includes("bruno mars")) {
          results = sampleVideos.uptown
        }

        if (results.length === 0) {
          // If still no results, show a message
          setYoutubeError(
            "No matches found. Try searching for specific artists, songs, or genres like bollywood, kpop, pop, rock, etc.",
          )
        } else {
          setYoutubeResults(results)
        }
      } catch (error) {
        console.error("Search error:", error)
        setYoutubeError("There was a problem with your search. Please try again.")
      } finally {
        setIsSearching(false)
        setShowRecentSearches(false)
      }
    }
  }

  // Handle YouTube video selection
  const selectYoutubeVideo = (videoId: string) => {
    // Only reload if it's a different video
    if (selectedVideo !== videoId) {
      setSelectedVideo(videoId)
      setHideVideo(false) // Reset hidden state when selecting a new video
      setYoutubeError(null) // Clear any errors

      // Update the iframe src directly if it exists
      if (youtubeRef.current) {
        youtubeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`
      }

      // Notify parent component about video change
      if (onVideoChange) {
        onVideoChange(videoId)
      }
    } else if (hideVideo) {
      // If it's the same video but hidden, just show it again
      setHideVideo(false)
    }
  }

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const newTracks = Array.from(files)
      setLocalTracks((prev) => [...prev, ...newTracks])

      // Create object URLs for the new tracks
      const newUrls = newTracks.map((file) => URL.createObjectURL(file))
      setLocalTrackUrls((prev) => [...prev, ...newUrls])

      // If this is the first track, set it as current
      if (currentLocalTrack === null) {
        setCurrentLocalTrack(0)
      }

      toast({
        title: "Music Added",
        description: `Added ${newTracks.length} track${newTracks.length > 1 ? "s" : ""} to your library.`,
        duration: 3000,
      })
    }
  }

  // Play a specific local track
  const playLocalTrack = (index: number) => {
    setCurrentLocalTrack(index)
    setCurrentTime(0)
    setIsPlaying(true)
  }

  // Toggle video visibility and show a random quote
  const toggleVideoVisibility = () => {
    const newState = !hideVideo
    setHideVideo(newState)

    if (newState) {
      // Select a random quote when hiding the video
      const randomIndex = Math.floor(Math.random() * motivationalQuotes.length)
      setCurrentQuote(motivationalQuotes[randomIndex])
    }
  }

  // Toggle like for a video
  const toggleLikeVideo = (videoId: string) => {
    if (likedVideos.includes(videoId)) {
      setLikedVideos((prev) => prev.filter((id) => id !== videoId))
    } else {
      setLikedVideos((prev) => [...prev, videoId])
      toast({
        title: "Added to Favorites",
        description: "This video has been added to your favorites.",
        duration: 2000,
      })
    }
  }

  // Handle voice search
  const startVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window)) {
      toast({
        title: "Voice Search Unavailable",
        description: "Your browser doesn't support voice recognition.",
        variant: "destructive",
      })
      return
    }

    setShowVoiceSearch(true)
    setIsListening(true)
    setTranscript("")

    // @ts-ignore - SpeechRecognition is not in the TypeScript types
    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result: any) => result.transcript)
        .join("")

      setTranscript(transcript)
    }

    recognition.onend = () => {
      setIsListening(false)

      // If we have a transcript, use it for search
      if (transcript) {
        setTimeout(() => {
          setYoutubeSearch(transcript)
          setShowVoiceSearch(false)

          // Submit the search
          if (searchInputRef.current) {
            const form = searchInputRef.current.form
            if (form) {
              const event = new Event("submit", { bubbles: true, cancelable: true })
              form.dispatchEvent(event)
            }
          }
        }, 1000)
      } else {
        setShowVoiceSearch(false)
      }
    }

    recognition.start()
  }

  // Get mood-specific gradient for quote background
  const getQuoteGradient = () => {
    switch (currentMood) {
      case "motivated":
        return "from-orange-500/30 to-red-500/30"
      case "feelingLow":
        return "from-blue-400/30 to-purple-500/30"
      case "energized":
        return "from-cyan-500/30 to-green-400/30"
      case "lazy":
        return "from-amber-300/30 to-rose-300/30"
      case "focused":
        return "from-gray-700/30 to-gray-900/30"
      case "creative":
        return "from-pink-400/30 to-purple-500/30"
      default:
        return "from-primary/30 to-primary/10"
    }
  }

  // Update time display for local tracks
  useEffect(() => {
    if (activeTab === "local" && audioRef.current) {
      const updateTime = () => {
        setCurrentTime(audioRef.current?.currentTime || 0)
        setDuration(audioRef.current?.duration || 0)
      }

      const interval = setInterval(updateTime, 1000)
      audioRef.current.addEventListener("timeupdate", updateTime)

      return () => {
        clearInterval(interval)
        audioRef.current?.removeEventListener("timeupdate", updateTime)
      }
    }
  }, [activeTab, currentLocalTrack])

  // Update audio source when local track changes
  useEffect(() => {
    if (currentLocalTrack !== null && localTrackUrls[currentLocalTrack] && audioRef.current) {
      audioRef.current.src = localTrackUrls[currentLocalTrack]
      if (isPlaying) {
        audioRef.current.play().catch(console.error)
      }
    }
  }, [currentLocalTrack, localTrackUrls])

  // Handle track ending
  useEffect(() => {
    if (audioRef.current) {
      const handleEnded = () => {
        if (isRepeatOn) {
          // Repeat the current track
          audioRef.current!.currentTime = 0
          audioRef.current!.play().catch(console.error)
        } else {
          // Play next track
          changeTrack("next")
        }
      }

      audioRef.current.addEventListener("ended", handleEnded)
      return () => {
        audioRef.current?.removeEventListener("ended", handleEnded)
      }
    }
  }, [isRepeatOn, isShuffleOn])

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      localTrackUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  // Load mood-specific YouTube playlist when mood changes
  useEffect(() => {
    if (activeTab === "youtube" && !selectedVideo) {
      // Get a random video based on mood
      let category: keyof typeof sampleVideos = "lofi"

      switch (currentMood) {
        case "motivated":
          category = "lofi"
          break
        case "feelingLow":
          category = "classical"
          break
        case "energized":
          category = "jazz"
          break
        case "lazy":
          category = "lofi"
          break
        case "focused":
          category = "focus"
          break
        case "creative":
          category = "classical"
          break
      }

      const videos = sampleVideos[category]
      const randomIndex = Math.floor(Math.random() * videos.length)
      setSelectedVideo(videos[randomIndex].id)
    }
  }, [currentMood, activeTab])

  // Add this effect to listen for external video change events:

  // Listen for external video change events
  useEffect(() => {
    const handleVideoChange = (e: CustomEvent) => {
      if (e.detail && e.detail.videoId) {
        selectYoutubeVideo(e.detail.videoId)
      }
    }

    document.addEventListener("changeVideo", handleVideoChange as EventListener)
    return () => {
      document.removeEventListener("changeVideo", handleVideoChange as EventListener)
    }
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="music-player-component"
    >
      <Card className={`transition-all duration-500 overflow-hidden ${isExpanded ? "h-[500px]" : ""} ${className}`}>
        <CardContent className={`${isMobile ? "p-3" : "p-6"} ${isExpanded ? "h-full overflow-y-auto" : ""}`}>
          <div className="flex justify-between items-center mb-3">
            <h2
              className={`${isMobile ? "text-lg" : "text-2xl"} font-semibold transition-all duration-300 flex items-center`}
            >
              <Headphones className="mr-2 h-4 w-4" /> Music
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setIsExpanded(!isExpanded)} className="h-7 w-7 p-0">
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-3">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="youtube" className="flex items-center text-xs">
                <Youtube className="h-3 w-3 mr-1" />
                YouTube
              </TabsTrigger>
              <TabsTrigger value="local" className="flex items-center text-xs">
                <Music className="h-3 w-3 mr-1" />
                Your Music
              </TabsTrigger>
            </TabsList>

            <TabsContent value="youtube" className="space-y-3 mt-3">
              {selectedVideo ? (
                <div className="relative">
                  {/* Keep the iframe always in the DOM but toggle visibility */}
                  <div className={`aspect-video rounded-lg overflow-hidden bg-muted ${hideVideo ? "hidden" : "block"}`}>
                    <iframe
                      ref={youtubeRef}
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${selectedVideo}?autoplay=1&enablejsapi=1`}
                      title="YouTube video player"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>

                  {/* Show the quote overlay when video is hidden */}
                  {hideVideo && (
                    <motion.div
                      key="quote"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`aspect-video rounded-lg overflow-hidden bg-gradient-to-r ${getQuoteGradient()} flex items-center justify-center p-4 relative`}
                    >
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-20 h-20 rounded-full bg-primary/20 blur-xl animate-pulse"></div>
                        <div
                          className="absolute bottom-0 right-0 w-32 h-32 rounded-full bg-primary/20 blur-xl animate-pulse"
                          style={{ animationDelay: "1s" }}
                        ></div>
                        <div
                          className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-primary/20 blur-xl animate-pulse"
                          style={{ animationDelay: "2s" }}
                        ></div>
                      </div>
                      <motion.div
                        initial={{ scale: 0.9 }}
                        animate={{ scale: 1 }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "reverse",
                        }}
                        className="text-center z-10"
                      >
                        <p className={`${isMobile ? "text-sm" : "text-2xl"} font-bold italic text-primary`}>
                          {currentQuote}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">Audio still playing in the background</p>
                      </motion.div>
                    </motion.div>
                  )}

                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={() => toggleLikeVideo(selectedVideo)}
                      className="rounded-full bg-background/80 backdrop-blur-sm hover:scale-110 transition-transform shadow-md border border-background/20 h-7 w-7"
                    >
                      <motion.div initial={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Heart
                          className={`h-3.5 w-3.5 ${likedVideos.includes(selectedVideo) ? "fill-red-500 text-red-500" : ""}`}
                        />
                      </motion.div>
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      onClick={toggleVideoVisibility}
                      className="rounded-full bg-background/80 backdrop-blur-sm hover:scale-110 transition-transform shadow-md border border-background/20 h-7 w-7"
                    >
                      <motion.div initial={{ scale: 1 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        {hideVideo ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                      </motion.div>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                  <div className="text-center p-4">
                    <Youtube className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Search for music or select a suggested video</p>
                  </div>
                </div>
              )}

              <div className="relative">
                <form onSubmit={handleYoutubeSearch} className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search music, artists, or paste YouTube URL..."
                      value={youtubeSearch}
                      onChange={(e) => setYoutubeSearch(e.target.value)}
                      className="flex-1 text-xs h-8 pr-8"
                      disabled={isSearching}
                      onFocus={() => setShowRecentSearches(true)}
                      onBlur={() => setTimeout(() => setShowRecentSearches(false), 200)}
                    />
                    {youtubeSearch && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-8 w-8"
                        onClick={() => setYoutubeSearch("")}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <Button
                    type="submit"
                    size="sm"
                    className="hover:scale-105 transition-transform h-8"
                    disabled={!youtubeSearch.trim() || isSearching}
                  >
                    {isSearching ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      >
                        <Loader2 className="h-3 w-3" />
                      </motion.div>
                    ) : (
                      <Search className="h-3 w-3" />
                    )}
                  </Button>
                  <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={startVoiceSearch}>
                    <Mic className="h-3 w-3" />
                  </Button>
                </form>

                {/* Recent searches dropdown */}
                {showRecentSearches && recentSearches.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full bg-background border rounded-md shadow-lg">
                    <div className="p-1 text-xs font-medium text-muted-foreground">Recent Searches</div>
                    {recentSearches.map((search, index) => (
                      <div
                        key={index}
                        className="px-2 py-1 text-xs hover:bg-muted cursor-pointer flex items-center"
                        onClick={() => {
                          setYoutubeSearch(search)
                          setShowRecentSearches(false)
                          setTimeout(() => {
                            if (searchInputRef.current?.form) {
                              searchInputRef.current.form.dispatchEvent(
                                new Event("submit", { bubbles: true, cancelable: true }),
                              )
                            }
                          }, 100)
                        }}
                      >
                        <Clock className="h-3 w-3 mr-1 text-muted-foreground" />
                        {search}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Voice search overlay */}
              <AnimatePresence>
                {showVoiceSearch && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                  >
                    <div className="bg-background rounded-lg p-6 max-w-md w-full">
                      <div className="text-center mb-4">
                        <h3 className="text-lg font-medium">Voice Search</h3>
                        <p className="text-sm text-muted-foreground">
                          {isListening ? "Listening..." : "Processing..."}
                        </p>
                      </div>

                      <div className="flex justify-center mb-4">
                        <div
                          className={`relative rounded-full h-20 w-20 flex items-center justify-center ${isListening ? "bg-primary/20" : "bg-muted"}`}
                        >
                          <motion.div
                            animate={
                              isListening
                                ? {
                                    scale: [1, 1.2, 1],
                                  }
                                : { scale: 1 }
                            }
                            transition={{
                              duration: 1.5,
                              repeat: isListening ? Number.POSITIVE_INFINITY : 0,
                              repeatType: "loop",
                            }}
                          >
                            <Mic className={`h-8 w-8 ${isListening ? "text-primary" : "text-muted-foreground"}`} />
                          </motion.div>
                        </div>
                      </div>

                      {transcript && (
                        <div className="mb-4 p-3 bg-muted rounded-md">
                          <p className="text-sm">{transcript}</p>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => setShowVoiceSearch(false)}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {youtubeError && (
                <div className="text-xs text-destructive bg-destructive/10 p-2 rounded-md">{youtubeError}</div>
              )}

              {directVideoId && !youtubeResults.length && (
                <div className="text-xs bg-primary/10 p-2 rounded-md">
                  Playing video directly from provided URL or ID
                </div>
              )}

              {youtubeResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1 max-h-40 overflow-y-auto border rounded-md p-2"
                >
                  {youtubeResults.map((result, index) => (
                    <motion.div
                      key={`${result.id}-${index}`}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center gap-2 p-1 hover:bg-muted rounded-md cursor-pointer transition-colors"
                      onClick={() => selectYoutubeVideo(result.id)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="w-12 h-8 bg-muted flex items-center justify-center rounded overflow-hidden">
                        <Youtube className="h-4 w-4 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium line-clamp-1">{result.title}</p>
                        <p className="text-[10px] text-muted-foreground">{result.channel}</p>
                      </div>
                      {likedVideos.includes(result.id) && (
                        <Heart className="h-3 w-3 fill-red-500 text-red-500 flex-shrink-0" />
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Favorites section */}
              {likedVideos.length > 0 && (
                <div className="mt-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full text-xs h-7">
                        <Heart className="h-3 w-3 mr-1 text-red-500" /> Your Favorites
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-2">
                      <div className="text-xs font-medium mb-1">Favorite Videos</div>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {likedVideos.map((videoId) => {
                          // Find video details
                          const allVideos = Object.values(sampleVideos).flat()
                          const videoDetails = allVideos.find((v) => v.id === videoId) || {
                            id: videoId,
                            title: "Unknown Video",
                            channel: "Unknown Channel",
                          }

                          return (
                            <div
                              key={videoId}
                              className="flex items-center gap-2 p-1 hover:bg-muted rounded-md cursor-pointer"
                              onClick={() => {
                                selectYoutubeVideo(videoId)
                                document.body.click() // Close popover
                              }}
                            >
                              <div className="w-10 h-6 bg-muted flex items-center justify-center rounded">
                                <Youtube className="h-3 w-3 text-red-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium line-clamp-1">{videoDetails.title}</p>
                                <p className="text-[9px] text-muted-foreground">{videoDetails.channel}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleLikeVideo(videoId)
                                }}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          )
                        })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              <div>
                <p className="text-xs font-medium mb-1">Music Categories</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(sampleVideos)
                    .filter(
                      ([category]) =>
                        ![
                          "despacito",
                          "seeyouagain",
                          "gangnamstyle",
                          "uptown",
                          "taylorswift",
                          "arijitsingh",
                          "indila",
                        ].includes(category),
                    )
                    .map(([category, videos], index) => (
                      <motion.div
                        key={category}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="w-auto"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 capitalize text-[10px] whitespace-nowrap px-1.5"
                          onClick={() => {
                            const randomIndex = Math.floor(Math.random() * videos.length)
                            selectYoutubeVideo(videos[randomIndex].id)
                          }}
                        >
                          {category}
                        </Button>
                      </motion.div>
                    ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="local" className="space-y-3 mt-3">
              <div className="bg-muted/30 rounded-lg p-3 transition-all duration-300">
                {currentLocalTrack !== null && localTracks.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-xs line-clamp-1">{localTracks[currentLocalTrack].name}</h3>
                        <p className="text-xs text-muted-foreground">Your Music</p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatTime(currentTime)} / {!isNaN(duration) ? formatTime(duration) : "0:00"}
                      </div>
                    </div>

                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={1}
                      onValueChange={handleSeek}
                      className="mb-3"
                    />
                  </>
                ) : (
                  <div className="text-center py-3 mb-3">
                    <Music className="h-8 w-8 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">No music files added yet</p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isShuffleOn ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setIsShuffleOn(!isShuffleOn)}
                            className="transition-all duration-300 hover:scale-110 h-7 w-7"
                            disabled={localTracks.length < 2}
                          >
                            <Shuffle className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Shuffle</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => changeTrack("prev")}
                      className="transition-all duration-300 hover:scale-110 h-7 w-7"
                      disabled={localTracks.length === 0}
                    >
                      <SkipBack className="h-3 w-3" />
                    </Button>

                    <Button
                      variant="default"
                      size="icon"
                      onClick={togglePlay}
                      className="transition-all duration-300 hover:scale-110 h-7 w-7"
                      disabled={localTracks.length === 0}
                    >
                      {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => changeTrack("next")}
                      className="transition-all duration-300 hover:scale-110 h-7 w-7"
                      disabled={localTracks.length === 0}
                    >
                      <SkipForward className="h-3 w-3" />
                    </Button>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant={isRepeatOn ? "default" : "ghost"}
                            size="icon"
                            onClick={() => setIsRepeatOn(!isRepeatOn)}
                            className="transition-all duration-300 hover:scale-110 h-7 w-7"
                            disabled={localTracks.length === 0}
                          >
                            <Repeat className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Repeat</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={toggleMute}
                      className="transition-all duration-300 hover:scale-110 h-7 w-7"
                      disabled={localTracks.length === 0}
                    >
                      {isMuted ? <VolumeX className="h-3 w-3" /> : <Volume2 className="h-3 w-3" />}
                    </Button>
                    <Slider
                      value={[volume]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="w-12"
                      disabled={localTracks.length === 0}
                    />
                  </div>
                </div>
              </div>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                multiple
                className="hidden"
              />

              <Button
                variant="outline"
                size="sm"
                className="w-full transition-all duration-300 hover:scale-105 text-xs h-8"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-3 w-3 mr-1" />
                Upload Music Files
              </Button>

              {localTracks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border rounded-md p-2 max-h-32 overflow-y-auto"
                >
                  <p className="text-xs font-medium mb-1">Your Library</p>
                  {localTracks.map((track, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center p-1 rounded-md cursor-pointer hover:bg-muted/50 ${
                        currentLocalTrack === index ? "bg-muted" : ""
                      }`}
                      onClick={() => playLocalTrack(index)}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="w-6 flex justify-center">
                        {currentLocalTrack === index && isPlaying ? (
                          <Pause className="h-2.5 w-2.5" />
                        ) : (
                          <Play className="h-2.5 w-2.5" />
                        )}
                      </div>
                      <div className="ml-1 truncate text-xs">{track.name}</div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>

          {/* Hidden audio elements for actual implementation */}
          <audio ref={audioRef} />
        </CardContent>
      </Card>
    </motion.div>
  )
}
