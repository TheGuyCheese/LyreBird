'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  MessageCircle,
  BookOpen,
  Home,
  Send,
  Volume2,
  VolumeX,
  Bot,
  User,
  Lightbulb,
  Target,
  Settings,
  RefreshCw,
  Copy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Globe,
  Mic,
  MicOff,
  Camera,
  Image,
  FileText,
  Zap,
  Menu,
  X
} from 'lucide-react'
import { languages, getLanguageByCode } from '@/lib/utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  translation?: string
  timestamp: Date
  corrections?: string[]
  suggestions?: string[]
}

interface ConversationTopic {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  icon: any
  prompts: string[]
}

const conversationTopics: ConversationTopic[] = [
  {
    id: 'introductions',
    title: 'Introductions',
    description: 'Learn to introduce yourself and meet new people',
    difficulty: 'beginner',
    icon: User,
    prompts: [
      'Tell me about yourself',
      'What\'s your name and where are you from?',
      'What do you do for work or study?'
    ]
  },
  {
    id: 'restaurant',
    title: 'Restaurant',
    description: 'Practice ordering food and dining conversations',
    difficulty: 'intermediate',
    icon: Target,
    prompts: [
      'I\'d like to order something to eat',
      'Can you recommend a dish?',
      'Could I have the bill, please?'
    ]
  },
  {
    id: 'travel',
    title: 'Travel',
    description: 'Learn travel-related vocabulary and phrases',
    difficulty: 'intermediate',
    icon: Globe,
    prompts: [
      'I\'m looking for directions to...',
      'How much does a ticket cost?',
      'Where is the nearest hotel?'
    ]
  },
  {
    id: 'business',
    title: 'Business',
    description: 'Professional conversations and business etiquette',
    difficulty: 'advanced',
    icon: FileText,
    prompts: [
      'Let\'s discuss the project proposal',
      'I\'d like to schedule a meeting',
      'Can you explain the company policy?'
    ]
  }
]

export default function ChatPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState('spanish')
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<ConversationTopic | null>(null)
  const [conversationLevel, setConversationLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner')
  const [isListening, setIsListening] = useState(false)
  const [corrections, setCorrections] = useState<string[]>([])
  const [isVoiceMuted, setIsVoiceMuted] = useState(false)
  const [isTopicsMenuOpen, setIsTopicsMenuOpen] = useState(false)
  const [userLanguage, setUserLanguage] = useState('english') // Track user's original language
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/')
    }
  }, [user, isLoaded, router])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (selectedTopic) {
      initializeConversation(selectedTopic)
    }
  }, [selectedTopic, selectedLanguage])

  // Load preferences from localStorage
  useEffect(() => {
    const savedVoicePreference = localStorage.getItem('voiceMuted')
    if (savedVoicePreference !== null) {
      setIsVoiceMuted(JSON.parse(savedVoicePreference))
    }
    
    const savedLanguagePreference = localStorage.getItem('selectedLanguage')
    if (savedLanguagePreference) {
      setSelectedLanguage(savedLanguagePreference)
    }
    
    const savedUserLanguage = localStorage.getItem('userLanguage')
    if (savedUserLanguage) {
      setUserLanguage(savedUserLanguage)
    }
  }, [])

  // Save language preferences to localStorage
  useEffect(() => {
    localStorage.setItem('selectedLanguage', selectedLanguage)
  }, [selectedLanguage])

  useEffect(() => {
    localStorage.setItem('userLanguage', userLanguage)
  }, [userLanguage])

  const initializeConversation = (topic: ConversationTopic) => {
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `Hello! I'm your AI language tutor. Today we'll practice ${topic.title.toLowerCase()} in ${getLanguageByCode(selectedLanguage).name}. I'll speak with you in ${getLanguageByCode(selectedLanguage).name} and help you improve your skills. Let's start with: ${topic.prompts[0]}`,
      timestamp: new Date()
    }
    setMessages([welcomeMessage])
    setCorrections([]) // Clear any existing corrections
  }

  const sendMessage = async (message: string) => {
    if (!message.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          language: selectedLanguage,
          userLanguage: userLanguage, // Send user's original language
          topic: selectedTopic?.id,
          level: conversationLevel,
          conversationHistory: messages.slice(-5) // Send last 5 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Response is not JSON')
      }

      const data = await response.json()
      
      // Validate the response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format')
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || 'I received your message but couldn\'t generate a proper response.',
        translation: data.translation || undefined, // Add translation field
        timestamp: new Date(),
        corrections: Array.isArray(data.corrections) ? data.corrections : [],
        suggestions: Array.isArray(data.suggestions) ? data.suggestions : []
      }

      setMessages(prev => [...prev, assistantMessage])
      setCorrections(Array.isArray(data.corrections) ? data.corrections : [])
    } catch (error) {
      console.error('Error sending message:', error)
      
      let errorContent = 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.'
      
      if (error instanceof Error) {
        if (error.message.includes('Response is not JSON')) {
          errorContent = 'The server returned an unexpected response. Please check if the API is properly configured.'
        } else if (error.message.includes('HTTP error')) {
          errorContent = `Server error: ${error.message}. Please try again.`
        }
      }
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const speakMessage = (text: string) => {
    if ('speechSynthesis' in window && !isVoiceMuted) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = selectedLanguage === 'spanish' ? 'es-ES' : 
                      selectedLanguage === 'french' ? 'fr-FR' : 
                      selectedLanguage === 'german' ? 'de-DE' : 'en-US'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const toggleVoiceMute = () => {
    const newMutedState = !isVoiceMuted
    setIsVoiceMuted(newMutedState)
    // Save preference to localStorage
    localStorage.setItem('voiceMuted', JSON.stringify(newMutedState))
  }

  const startListening = () => {
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.lang = selectedLanguage === 'spanish' ? 'es-ES' : 
                        selectedLanguage === 'french' ? 'fr-FR' : 
                        selectedLanguage === 'german' ? 'de-DE' : 'en-US'
      recognition.continuous = false
      recognition.interimResults = false
      
      recognition.onstart = () => {
        setIsListening(true)
      }
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setInputMessage(transcript)
        setIsListening(false)
      }
      
      recognition.onerror = () => {
        setIsListening(false)
      }
      
      recognition.onend = () => {
        setIsListening(false)
      }
      
      recognition.start()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const clearConversation = () => {
    setMessages([])
    setCorrections([])
    // Don't clear the selected topic - keep it for easy restart
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputMessage)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white to-sand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your AI chat...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-white to-sand-beige">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sand-beige/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold text-primary">LinguaLearn</span>
              </div>
              
              <nav className="hidden md:flex space-x-6">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => router.push('/dashboard')}>
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => router.push('/events')}>
                  <BookOpen className="w-4 h-4 mr-2" />
                  Events
                </Button>
                <Button variant="ghost" className="text-primary hover:text-primary/80">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  AI Chat
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Learning:</span>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-32 lg:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                    <SelectItem value="french">🇫🇷 French</SelectItem>
                    <SelectItem value="german">🇩🇪 German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Native:</span>
                <Select value={userLanguage} onValueChange={setUserLanguage}>
                  <SelectTrigger className="w-32 lg:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">🇺🇸 English</SelectItem>
                    <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                    <SelectItem value="french">🇫🇷 French</SelectItem>
                    <SelectItem value="german">🇩🇪 German</SelectItem>
                    <SelectItem value="portuguese">🇵🇹 Portuguese</SelectItem>
                    <SelectItem value="italian">🇮🇹 Italian</SelectItem>
                    <SelectItem value="chinese">🇨🇳 Chinese</SelectItem>
                    <SelectItem value="japanese">🇯🇵 Japanese</SelectItem>
                    <SelectItem value="korean">🇰🇷 Korean</SelectItem>
                    <SelectItem value="arabic">🇸🇦 Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Mobile language selectors */}
              <div className="sm:hidden flex items-center space-x-1">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="spanish">🇪🇸</SelectItem>
                    <SelectItem value="french">🇫🇷</SelectItem>
                    <SelectItem value="german">🇩🇪</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={userLanguage} onValueChange={setUserLanguage}>
                  <SelectTrigger className="w-16">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="english">🇺🇸</SelectItem>
                    <SelectItem value="spanish">🇪🇸</SelectItem>
                    <SelectItem value="french">🇫🇷</SelectItem>
                    <SelectItem value="german">🇩🇪</SelectItem>
                    <SelectItem value="portuguese">🇵🇹</SelectItem>
                    <SelectItem value="italian">🇮🇹</SelectItem>
                    <SelectItem value="chinese">🇨🇳</SelectItem>
                    <SelectItem value="japanese">🇯🇵</SelectItem>
                    <SelectItem value="korean">🇰🇷</SelectItem>
                    <SelectItem value="arabic">🇸🇦</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
            {/* Chat Area - Left Side */}
            <div className="lg:col-span-2 h-full flex flex-col min-h-0">
              <Card className="h-full flex flex-col overflow-hidden">
                <CardHeader className="flex-shrink-0 border-b border-sand-beige/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Hamburger Menu for Topics */}
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsTopicsMenuOpen(!isTopicsMenuOpen)}
                          className="p-2"
                        >
                          {isTopicsMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                        </Button>
                        
                        {/* Topics Dropdown */}
                        {isTopicsMenuOpen && (
                          <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-sand-beige/20 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                            <div className="p-3 border-b border-sand-beige/20">
                              <h3 className="font-semibold text-sm">Conversation Topics</h3>
                              <p className="text-xs text-muted-foreground">Choose a topic to practice</p>
                            </div>
                            <div className="p-2 space-y-1">
                              {conversationTopics.map((topic) => (
                                <Button
                                  key={topic.id}
                                  variant={selectedTopic?.id === topic.id ? "default" : "ghost"}
                                  className="w-full justify-start h-auto p-3 text-left"
                                                                     onClick={() => {
                                     setSelectedTopic(topic)
                                     setIsTopicsMenuOpen(false)
                                     // Reset chat when topic is selected
                                     setMessages([])
                                     setCorrections([])
                                   }}
                                >
                                  <div className="flex items-start space-x-3 w-full">
                                    <topic.icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <div className="text-left flex-1 min-w-0">
                                      <div className="font-medium text-sm">{topic.title}</div>
                                      <div className="text-xs opacity-80 mt-1 whitespace-normal break-words">{topic.description}</div>
                                      <Badge 
                                        variant={selectedTopic?.id === topic.id ? "secondary" : "outline"} 
                                        className="mt-2 text-xs"
                                      >
                                        {topic.difficulty}
                                      </Badge>
                                    </div>
                                  </div>
                                </Button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Bot className="w-6 h-6 text-primary" />
                      <CardTitle className="text-xl">AI Language Tutor</CardTitle>
                      {selectedTopic && (
                        <Badge variant="outline" className="capitalize">
                          {selectedTopic.title}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {getLanguageByCode(selectedLanguage).flag} {getLanguageByCode(selectedLanguage).name}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {conversationLevel}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Messages */}
                <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                  {messages.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-4">
                      <div className="text-center">
                        <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                          Start Your Conversation
                        </h3>
                        <p className="text-muted-foreground">
                          Start chatting with your AI tutor or select a conversation topic from the menu for guided practice.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Messages Container */}
                      <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <AnimatePresence>
                          {messages.map((message) => (
                            <motion.div
                              key={message.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                              <div className={`max-w-[80%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                                <div className={`flex items-start space-x-3 ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    message.role === 'user' 
                                      ? 'bg-primary text-primary-foreground' 
                                      : 'bg-secondary text-secondary-foreground'
                                  }`}>
                                    {message.role === 'user' ? (
                                      <User className="w-4 h-4" />
                                    ) : (
                                      <Bot className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div className={`rounded-2xl px-4 py-3 ${
                                    message.role === 'user'
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-white border border-sand-beige/20 shadow-sm'
                                  }`}>
                                    <div className="text-sm whitespace-pre-wrap break-words">
                                      {message.content}
                                    </div>
                                    {/* Translation Display */}
                                    {message.translation && message.role === 'assistant' && (
                                      <div className="mt-2 pt-2 border-t border-sand-beige/20">
                                        <div className="text-xs text-muted-foreground mb-1">Translation:</div>
                                        <div className="text-sm text-muted-foreground italic">
                                          {message.translation}
                                        </div>
                                      </div>
                                    )}
                                    <div className="flex items-center justify-between mt-2">
                                      <span className="text-xs opacity-70">
                                        {message.timestamp.toLocaleTimeString()}
                                      </span>
                                      <div className="flex space-x-1">
                                        {message.role === 'assistant' && (
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => speakMessage(message.content)} // Only speak the main content, not translation
                                            className={`h-6 w-6 p-0 ${isVoiceMuted ? 'opacity-50' : ''}`}
                                            title={isVoiceMuted ? 'Voice is muted' : 'Play message'}
                                          >
                                            {isVoiceMuted ? (
                                              <VolumeX className="w-3 h-3" />
                                            ) : (
                                              <Volume2 className="w-3 h-3" />
                                            )}
                                          </Button>
                                        )}
                                        <Button
                                          size="sm"
                                          variant="ghost"
                                          onClick={() => copyToClipboard(message.content)}
                                          className="h-6 w-6 p-0"
                                        >
                                          <Copy className="w-3 h-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        
                        {isLoading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex justify-start"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                                <Bot className="w-4 h-4" />
                              </div>
                              <div className="bg-white border border-sand-beige/20 rounded-2xl px-4 py-3">
                                <div className="flex items-center space-x-2">
                                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                  <span className="text-sm text-muted-foreground">AI is typing...</span>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                        
                        <div ref={messagesEndRef} />
                      </div>
                      
                      {/* Input Area */}
                      <div className="border-t border-sand-beige/20 p-4 flex-shrink-0">
                        <div className="flex items-center space-x-3">
                          <div className="flex-1 relative">
                            <input
                              ref={inputRef}
                              type="text"
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              onKeyPress={handleKeyPress}
                              placeholder={`Type your message in ${getLanguageByCode(selectedLanguage).name}...`}
                              className="w-full px-4 py-3 pr-12 rounded-2xl border border-sand-beige/20 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                              disabled={isLoading}
                            />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                              onClick={startListening}
                              disabled={isListening}
                            >
                              {isListening ? (
                                <MicOff className="w-4 h-4 text-red-500" />
                              ) : (
                                <Mic className="w-4 h-4 text-muted-foreground" />
                              )}
                            </Button>
                          </div>
                          <Button
                            onClick={() => sendMessage(inputMessage)}
                            disabled={!inputMessage.trim() || isLoading}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        {/* Quick Actions and Clear Chat Button */}
                        {selectedTopic ? (
                          <div className="flex flex-wrap items-center justify-between gap-2 mt-3">
                            <div className="flex flex-wrap gap-1.5 flex-1">
                              {selectedTopic.prompts.map((prompt, index) => (
                                <Button
                                  key={index}
                                  variant="outline"
                                  size="sm"
                                  onClick={() => sendMessage(prompt)}
                                  className="text-xs h-7 px-2 py-1 text-[10px] bg-custom-green text-white hover:bg-custom-green/90 border-custom-green"
                                >
                                  <Sparkles className="w-2.5 h-2.5 mr-1" />
                                  {prompt}
                                </Button>
                              ))}
                            </div>
                            
                            {/* Clear Chat Button - Same line, right side */}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearConversation}
                              className="text-xs h-7 px-2 py-1 ml-2 flex-shrink-0 bg-custom-green text-white hover:bg-custom-green/90 border-custom-green"
                            >
                              <RefreshCw className="w-2.5 h-2.5 mr-1" />
                              Clear
                            </Button>
                          </div>
                        ) : (
                          messages.length > 0 && (
                            <div className="mt-3 flex justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={clearConversation}
                                className="text-xs h-7 px-2 py-1 bg-custom-green text-white hover:bg-custom-green/90 border-custom-green"
                              >
                                <RefreshCw className="w-2.5 h-2.5 mr-1" />
                                Clear
                              </Button>
                            </div>
                          )
                        )}
                      </div>
                    </>
                  )}
                </div>
              </Card>
            </div>

            {/* Right Side - 3D Agent Model and Controls */}
            <div className="lg:col-span-1 space-y-4">
              {/* 3D Agent Model Placeholder */}
              <Card className="h-80">
                <CardContent className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Bot className="w-12 h-12 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      3D Agent Model
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      3D avatar will be deployed here
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Controls Below 3D Agent */}
              <div className="space-y-4">
                {/* Conversation Level */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-semibold">Conversation Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={conversationLevel} onValueChange={(value: any) => setConversationLevel(value)}>
                      <SelectTrigger className="w-full bg-custom-green text-white hover:bg-custom-green/90">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">Beginner</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Mute Button beside Conversation Level */}
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-custom-green text-white hover:bg-custom-green/90 border-custom-green"
                        onClick={toggleVoiceMute}
                      >
                        {isVoiceMuted ? (
                          <VolumeX className="w-4 h-4 mr-2" />
                        ) : (
                          <Volume2 className="w-4 h-4 mr-2" />
                        )}
                        {isVoiceMuted ? 'Unmute' : 'Mute'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Corrections */}
                {corrections.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                                           <CardTitle className="text-lg font-semibold flex items-center">
                       <Lightbulb className="w-4 h-4 mr-2 text-custom-green" />
                       Corrections
                     </CardTitle>
                    </CardHeader>
                    <CardContent>
                                             <div className="space-y-2">
                         {corrections.map((correction, index) => (
                           <div key={index} className="p-3 bg-custom-green/10 rounded-xl border border-custom-green/30">
                             <p className="text-xs text-custom-green">{correction}</p>
                           </div>
                         ))}
                       </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 