'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Brain,
  MessageCircle,
  BookOpen,
  Trophy,
  Home,
  RotateCcw,
  Volume2,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  Zap,
  ArrowRight,
  ArrowLeft,
  Shuffle,
  PlayCircle,
  PauseCircle,
  RefreshCw,
  Star,
  Award,
  TrendingUp
} from 'lucide-react'
import { languages, getLanguageByCode, shuffleArray } from '@/lib/utils'

// Sample flashcard data
const flashcardData = {
  basic: [
    { id: 1, english: 'Hello', spanish: 'Hola', french: 'Bonjour', german: 'Hallo', category: 'greetings' },
    { id: 2, english: 'Goodbye', spanish: 'Adiós', french: 'Au revoir', german: 'Auf Wiedersehen', category: 'greetings' },
    { id: 3, english: 'Thank you', spanish: 'Gracias', french: 'Merci', german: 'Danke', category: 'greetings' },
    { id: 4, english: 'Please', spanish: 'Por favor', french: 'S\'il vous plaît', german: 'Bitte', category: 'greetings' },
    { id: 5, english: 'Water', spanish: 'Agua', french: 'Eau', german: 'Wasser', category: 'food' },
    { id: 6, english: 'Food', spanish: 'Comida', french: 'Nourriture', german: 'Essen', category: 'food' },
    { id: 7, english: 'House', spanish: 'Casa', french: 'Maison', german: 'Haus', category: 'home' },
    { id: 8, english: 'Car', spanish: 'Coche', french: 'Voiture', german: 'Auto', category: 'transport' },
  ],
  intermediate: [
    { id: 9, english: 'Beautiful', spanish: 'Hermoso', french: 'Beau', german: 'Schön', category: 'adjectives' },
    { id: 10, english: 'Important', spanish: 'Importante', french: 'Important', german: 'Wichtig', category: 'adjectives' },
    { id: 11, english: 'Understand', spanish: 'Entender', french: 'Comprendre', german: 'Verstehen', category: 'verbs' },
    { id: 12, english: 'Learn', spanish: 'Aprender', french: 'Apprendre', german: 'Lernen', category: 'verbs' },
  ]
}

// Sample quiz data
const quizData = {
  basic: [
    {
      id: 1,
      question: 'How do you say "Hello" in Spanish?',
      options: ['Hola', 'Adiós', 'Gracias', 'Por favor'],
      correct: 0,
      category: 'greetings'
    },
    {
      id: 2,
      question: 'What does "Agua" mean in English?',
      options: ['Food', 'Water', 'House', 'Car'],
      correct: 1,
      category: 'food'
    },
    {
      id: 3,
      question: 'How do you say "Thank you" in French?',
      options: ['Bonjour', 'Au revoir', 'Merci', 'S\'il vous plaît'],
      correct: 2,
      category: 'greetings'
    },
  ],
  intermediate: [
    {
      id: 4,
      question: 'What does "Verstehen" mean in English?',
      options: ['Learn', 'Understand', 'Beautiful', 'Important'],
      correct: 1,
      category: 'verbs'
    },
    {
      id: 5,
      question: 'How do you say "Learn" in French?',
      options: ['Comprendre', 'Apprendre', 'Important', 'Beau'],
      correct: 1,
      category: 'verbs'
    },
  ]
}

export default function EventsPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState('spanish')
  const [selectedLevel, setSelectedLevel] = useState<'basic' | 'intermediate'>('basic')
  const [activeTab, setActiveTab] = useState('flashcards')
  
  // Flashcard states
  const [currentFlashcard, setCurrentFlashcard] = useState(0)
  const [showAnswer, setShowAnswer] = useState(false)
  const [flashcards, setFlashcards] = useState<any[]>([])
  const [studiedCards, setStudiedCards] = useState<number[]>([])
  const [correctCards, setCorrectCards] = useState<number[]>([])
  const [shuffledCards, setShuffledCards] = useState<any[]>([])
  
  // Quiz states
  const [currentQuiz, setCurrentQuiz] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showQuizAnswer, setShowQuizAnswer] = useState(false)
  const [quizScore, setQuizScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [quizzes, setQuizzes] = useState<any[]>([])
  
  // Stats
  const [sessionStats, setSessionStats] = useState({
    cardsStudied: 0,
    correctAnswers: 0,
    timeStudied: 0,
    streak: 0
  })

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/')
    }
  }, [user, isLoaded, router])

  useEffect(() => {
    setFlashcards(flashcardData[selectedLevel])
    setQuizzes(quizData[selectedLevel])
    setCurrentFlashcard(0)
    setCurrentQuiz(0)
    setShowAnswer(false)
    setShowQuizAnswer(false)
    setQuizCompleted(false)
    setQuizScore(0)
    setSelectedAnswer(null)
  }, [selectedLevel])

  useEffect(() => {
    if (flashcards.length > 0) {
      setShuffledCards(shuffleArray([...flashcards]))
    }
  }, [flashcards])

  const handleFlashcardAnswer = (correct: boolean) => {
    const cardId = shuffledCards[currentFlashcard]?.id
    if (cardId && !studiedCards.includes(cardId)) {
      setStudiedCards(prev => [...prev, cardId])
      setSessionStats(prev => ({
        ...prev,
        cardsStudied: prev.cardsStudied + 1,
        correctAnswers: correct ? prev.correctAnswers + 1 : prev.correctAnswers,
        streak: correct ? prev.streak + 1 : 0
      }))
      
      if (correct) {
        setCorrectCards(prev => [...prev, cardId])
      }
    }
    
    setShowAnswer(false)
    if (currentFlashcard < shuffledCards.length - 1) {
      setCurrentFlashcard(prev => prev + 1)
    } else {
      // Restart with new shuffled deck
      setShuffledCards(shuffleArray([...flashcards]))
      setCurrentFlashcard(0)
    }
  }

  const handleQuizAnswer = (answerIndex: number) => {
    setSelectedAnswer(answerIndex)
    setShowQuizAnswer(true)
    
    if (answerIndex === quizzes[currentQuiz].correct) {
      setQuizScore(prev => prev + 1)
      setSessionStats(prev => ({
        ...prev,
        correctAnswers: prev.correctAnswers + 1,
        streak: prev.streak + 1
      }))
    } else {
      setSessionStats(prev => ({
        ...prev,
        streak: 0
      }))
    }
    
    setTimeout(() => {
      if (currentQuiz < quizzes.length - 1) {
        setCurrentQuiz(prev => prev + 1)
        setSelectedAnswer(null)
        setShowQuizAnswer(false)
      } else {
        setQuizCompleted(true)
      }
    }, 2000)
  }

  const resetQuiz = () => {
    setCurrentQuiz(0)
    setSelectedAnswer(null)
    setShowQuizAnswer(false)
    setQuizScore(0)
    setQuizCompleted(false)
  }

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = selectedLanguage === 'spanish' ? 'es-ES' : 
                      selectedLanguage === 'french' ? 'fr-FR' : 'de-DE'
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const getTranslation = (card: any) => {
    return card[selectedLanguage] || card.spanish
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-white to-sand-beige flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your learning events...</p>
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
                <Button variant="ghost" className="text-primary hover:text-primary/80">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Events
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => router.push('/chat')}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  AI Chat
                </Button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spanish">🇪🇸 Spanish</SelectItem>
                  <SelectItem value="french">🇫🇷 French</SelectItem>
                  <SelectItem value="german">🇩🇪 German</SelectItem>
                </SelectContent>
              </Select>
              
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">Learning Events</h1>
            <p className="text-xl text-muted-foreground">
              Practice with flashcards and test your knowledge with quizzes
            </p>
          </div>

          {/* Level Selection */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4 p-1 bg-white/80 rounded-2xl">
              <Button
                variant={selectedLevel === 'basic' ? 'default' : 'ghost'}
                onClick={() => setSelectedLevel('basic')}
                className="rounded-xl"
              >
                <Target className="w-4 h-4 mr-2" />
                Basic
              </Button>
              <Button
                variant={selectedLevel === 'intermediate' ? 'default' : 'ghost'}
                onClick={() => setSelectedLevel('intermediate')}
                className="rounded-xl"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Intermediate
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold text-primary">{sessionStats.cardsStudied}</div>
                <div className="text-sm text-muted-foreground">Cards Studied</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-500">{sessionStats.correctAnswers}</div>
                <div className="text-sm text-muted-foreground">Correct Answers</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                                        <Zap className="w-8 h-8 text-custom-green mx-auto mb-2" />
                        <div className="text-2xl font-bold text-custom-green">{sessionStats.streak}</div>
                <div className="text-sm text-muted-foreground">Current Streak</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-500">{Math.floor(sessionStats.timeStudied / 60)}m</div>
                <div className="text-sm text-muted-foreground">Time Studied</div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="flashcards">
                <BookOpen className="w-4 h-4 mr-2" />
                Flashcards
              </TabsTrigger>
              <TabsTrigger value="quiz">
                <Brain className="w-4 h-4 mr-2" />
                Quiz
              </TabsTrigger>
            </TabsList>

            {/* Flashcards */}
            <TabsContent value="flashcards" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                {shuffledCards.length > 0 && (
                  <Card className="overflow-hidden">
                    <CardHeader className="text-center">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline">
                          {currentFlashcard + 1} / {shuffledCards.length}
                        </Badge>
                        <Badge variant="outline" className="capitalize">
                          {shuffledCards[currentFlashcard]?.category}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-8">
                      <div className="text-center min-h-[200px] flex flex-col justify-center">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={showAnswer ? 'answer' : 'question'}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            {!showAnswer ? (
                              <div>
                                <div className="text-4xl font-bold text-primary mb-4">
                                  {shuffledCards[currentFlashcard]?.english}
                                </div>
                                <p className="text-muted-foreground mb-6">
                                  Tap to reveal the {selectedLanguage} translation
                                </p>
                                <Button
                                  size="lg"
                                  onClick={() => setShowAnswer(true)}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  Show Answer
                                </Button>
                              </div>
                            ) : (
                              <div>
                                <div className="text-4xl font-bold text-secondary mb-4">
                                  {getTranslation(shuffledCards[currentFlashcard])}
                                </div>
                                <div className="text-xl text-muted-foreground mb-6">
                                  {shuffledCards[currentFlashcard]?.english}
                                </div>
                                <div className="flex justify-center space-x-4 mb-6">
                                  <Button
                                    variant="outline"
                                    onClick={() => speakWord(getTranslation(shuffledCards[currentFlashcard]))}
                                  >
                                    <Volume2 className="w-4 h-4 mr-2" />
                                    Pronounce
                                  </Button>
                                </div>
                                <div className="flex justify-center space-x-4">
                                  <Button
                                    variant="outline"
                                    onClick={() => handleFlashcardAnswer(false)}
                                    className="text-red-500 border-red-500 hover:bg-red-50"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Need Practice
                                  </Button>
                                  <Button
                                    onClick={() => handleFlashcardAnswer(true)}
                                    className="bg-green-500 hover:bg-green-600"
                                  >
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    I Know This
                                  </Button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Flashcard Controls */}
                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setShuffledCards(shuffleArray([...flashcards]))}
                  >
                    <Shuffle className="w-4 h-4 mr-2" />
                    Shuffle
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentFlashcard(0)}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Restart
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Quiz */}
            <TabsContent value="quiz" className="space-y-6">
              <div className="max-w-2xl mx-auto">
                {!quizCompleted ? (
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Question {currentQuiz + 1} of {quizzes.length}</CardTitle>
                        <Badge variant="outline">Score: {quizScore}</Badge>
                      </div>
                      <Progress value={((currentQuiz + 1) / quizzes.length) * 100} className="h-2" />
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="text-center">
                          <h3 className="text-2xl font-bold text-primary mb-4">
                            {quizzes[currentQuiz]?.question}
                          </h3>
                        </div>
                        
                        <div className="space-y-3">
                          {quizzes[currentQuiz]?.options.map((option: string, index: number) => (
                            <Button
                              key={index}
                              variant="outline"
                              className={`w-full h-12 text-left justify-start ${
                                selectedAnswer === index
                                  ? showQuizAnswer
                                    ? index === quizzes[currentQuiz].correct
                                      ? 'bg-green-100 border-green-500 text-green-700'
                                      : 'bg-red-100 border-red-500 text-red-700'
                                    : 'bg-primary/10 border-primary'
                                  : showQuizAnswer && index === quizzes[currentQuiz].correct
                                  ? 'bg-green-100 border-green-500 text-green-700'
                                  : ''
                              }`}
                              onClick={() => !showQuizAnswer && handleQuizAnswer(index)}
                              disabled={showQuizAnswer}
                            >
                              <div className="flex items-center">
                                <div className="w-6 h-6 rounded-full bg-white border-2 border-current mr-3 flex items-center justify-center text-xs font-bold">
                                  {String.fromCharCode(65 + index)}
                                </div>
                                {option}
                                {showQuizAnswer && index === quizzes[currentQuiz].correct && (
                                  <CheckCircle2 className="w-4 h-4 ml-auto text-green-500" />
                                )}
                                {showQuizAnswer && selectedAnswer === index && index !== quizzes[currentQuiz].correct && (
                                  <XCircle className="w-4 h-4 ml-auto text-red-500" />
                                )}
                              </div>
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className="text-center">
                      <CardTitle className="text-3xl text-primary">Quiz Complete!</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 text-center">
                      <div className="mb-6">
                        <div className="text-6xl font-bold text-primary mb-2">
                          {quizScore}/{quizzes.length}
                        </div>
                        <div className="text-xl text-muted-foreground">
                          {Math.round((quizScore / quizzes.length) * 100)}% Correct
                        </div>
                      </div>
                      
                      <div className="mb-8">
                        {quizScore === quizzes.length ? (
                          <div className="flex flex-col items-center space-y-2">
                                                      <Trophy className="w-16 h-16 text-custom-green" />
                          <div className="text-2xl font-bold text-custom-green">Perfect Score!</div>
                            <div className="text-muted-foreground">You've mastered this level!</div>
                          </div>
                        ) : quizScore >= quizzes.length * 0.8 ? (
                          <div className="flex flex-col items-center space-y-2">
                            <Award className="w-16 h-16 text-blue-500" />
                            <div className="text-2xl font-bold text-blue-500">Great Job!</div>
                            <div className="text-muted-foreground">You're doing excellent!</div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center space-y-2">
                            <Target className="w-16 h-16 text-orange-500" />
                            <div className="text-2xl font-bold text-orange-500">Keep Practicing!</div>
                            <div className="text-muted-foreground">You're making progress!</div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-center space-x-4">
                        <Button onClick={resetQuiz} variant="outline">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Try Again
                        </Button>
                        <Button onClick={() => router.push('/dashboard')}>
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back to Dashboard
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
} 