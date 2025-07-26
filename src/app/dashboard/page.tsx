'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

// Dynamically import the InteractiveObjectsScene component
const InteractiveObjectsScene = dynamic(() => import('@/components/InteractiveObjectsScene'), { 
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading Learning Environment...</p>
      </div>
    </div>
  )
})
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
  Settings,
  Home,
  Users,
  Coffee,
  Car,
  Apple,
  Shirt,
  Volume2,
  Play,
  Pause,
  RotateCcw,
  Zap,
  Target,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Globe
} from 'lucide-react'
import { languages, getLanguageByCode } from '@/lib/utils'

// Language translations for objects
const translations: { [key: string]: { [key: string]: string } } = {
  apple: {
    es: 'manzana',
    fr: 'pomme',
    de: 'apfel',
    it: 'mela',
    pt: 'maçã',
    ru: 'яблоко',
    ja: 'りんご',
    ko: '사과',
    zh: '苹果',
    ar: 'تفاحة'
  },
  car: {
    es: 'coche',
    fr: 'voiture',
    de: 'auto',
    it: 'macchina',
    pt: 'carro',
    ru: 'машина',
    ja: '車',
    ko: '자동차',
    zh: '汽车',
    ar: 'سيارة'
  },
  house: {
    es: 'casa',
    fr: 'maison',
    de: 'haus',
    it: 'casa',
    pt: 'casa',
    ru: 'дом',
    ja: '家',
    ko: '집',
    zh: '房子',
    ar: 'بيت'
  },
  coffee: {
    es: 'café',
    fr: 'café',
    de: 'kaffee',
    it: 'caffè',
    pt: 'café',
    ru: 'кофе',
    ja: 'コーヒー',
    ko: '커피',
    zh: '咖啡',
    ar: 'قهوة'
  },
  shirt: {
    es: 'camisa',
    fr: 'chemise',
    de: 'hemd',
    it: 'camicia',
    pt: 'camisa',
    ru: 'рубашка',
    ja: 'シャツ',
    ko: '셔츠',
    zh: '衬衫',
    ar: 'قميص'
  }
}

export default function Dashboard() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [selectedLanguage, setSelectedLanguage] = useState('es')
  const [progress, setProgress] = useState(65)
  const [streak, setStreak] = useState(12)
  const [points, setPoints] = useState(2840)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/')
    }
  }, [user, isLoaded, router])



  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = selectedLanguage === 'zh' ? 'zh-CN' : `${selectedLanguage}-${selectedLanguage.toUpperCase()}`
      utterance.rate = 0.8
      speechSynthesis.speak(utterance)
    }
  }



  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#B9B38F'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Loading your learning space...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#B9B38F'}}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sand-beige/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <img 
                  src="/logo.ico" 
                  alt="LyreBird Logo" 
                  className="w-10 h-10 rounded-full object-cover"
                />
                <span className="text-xl font-bold text-primary">LyreBird</span>
              </div>
              
              <nav className="hidden md:flex space-x-6">
                <Button variant="ghost" className="text-primary hover:text-primary/80">
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                <Button variant="ghost" className="text-muted-foreground hover:text-primary" onClick={() => router.push('/events')}>
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
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                                        <Trophy className="w-5 h-5 text-custom-green" />
                <span className="font-semibold text-primary">{points}</span>
              </div>
              
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Learning Progress</CardTitle>
                <CardDescription>Your journey in {getLanguageByCode(selectedLanguage).name}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Overall Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-primary/5 rounded-xl">
                      <div className="text-2xl font-bold text-primary">{streak}</div>
                      <div className="text-sm text-muted-foreground">Day Streak</div>
                    </div>
                    <div className="text-center p-3 bg-secondary/5 rounded-xl">
                      <div className="text-2xl font-bold text-secondary">{points}</div>
                      <div className="text-sm text-muted-foreground">Points</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Daily Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-primary" />
                      <span className="text-sm">Practice 30 minutes</span>
                    </div>
                    <Badge variant="outline">20/30</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                                                          <Zap className="w-4 h-4 text-custom-green" />
                      <span className="text-sm">Learn 10 new words</span>
                    </div>
                    <Badge variant="outline">7/10</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <MessageCircle className="w-4 h-4 text-blue-500" />
                      <span className="text-sm">Complete 1 conversation</span>
                    </div>
                    <Badge className="bg-green-500">Complete!</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: Trophy, name: 'First Steps', earned: true },
                    { icon: Award, name: 'Week Warrior', earned: true },
                    { icon: TrendingUp, name: 'Fast Learner', earned: false },
                    { icon: Globe, name: 'Polyglot', earned: false },
                    { icon: Brain, name: 'AI Master', earned: true },
                    { icon: Users, name: 'Social Butterfly', earned: false },
                  ].map((achievement, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg text-center ${
                        achievement.earned 
                          ? 'bg-primary/10 text-primary' 
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      <achievement.icon className="w-6 h-6 mx-auto mb-1" />
                      <div className="text-xs">{achievement.name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content - 3D Learning */}
          <div className="lg:col-span-3 space-y-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-xl">Interactive Learning Environment</CardTitle>
                <CardDescription>
                  Click on objects to learn their names in {getLanguageByCode(selectedLanguage).name}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[500px] bg-gradient-to-br from-blue-50 to-purple-50">
                  <InteractiveObjectsScene
                    selectedLanguage={selectedLanguage}
                  />
                </div>
              </CardContent>
            </Card>



            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/events')}>
                <CardContent className="p-6 text-center">
                  <BookOpen className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Practice Events</h3>
                  <p className="text-sm text-muted-foreground">Flashcards, quizzes, and more</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/chat')}>
                <CardContent className="p-6 text-center">
                  <MessageCircle className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">AI Chat</h3>
                  <p className="text-sm text-muted-foreground">Practice conversations with AI</p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6 text-center">
                  <TrendingUp className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg mb-2">Progress</h3>
                  <p className="text-sm text-muted-foreground">Track your learning journey</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 