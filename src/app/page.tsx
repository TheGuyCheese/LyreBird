'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Brain, 
  MessageCircle, 
  Zap, 
  Globe, 
  Users, 
  Trophy,
  Star,
  ArrowRight,
  CheckCircle2,
  Play,
  BookOpen,
  Headphones,
  Target,
  Award,
  TrendingUp
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Conversations',
    description: 'Chat with our advanced AI in your target language. Get instant feedback and corrections.',
    color: 'text-blue-500'
  },
  {
    icon: Globe,
    title: 'Interactive 3D Learning',
    description: 'Explore 3D models and learn vocabulary in an immersive environment.',
    color: 'text-green-500'
  },
  {
    icon: Zap,
    title: 'Smart Flashcards',
    description: 'Adaptive flashcard system that learns from your progress and optimizes review timing.',
    color: 'text-custom-green'
  },
  {
    icon: Trophy,
    title: 'Gamified Progress',
    description: 'Earn points, unlock achievements, and track your learning journey.',
    color: 'text-purple-500'
  },
  {
    icon: MessageCircle,
    title: 'Real-time Feedback',
    description: 'Get instant corrections and suggestions to improve your language skills.',
    color: 'text-red-500'
  },
  {
    icon: Users,
    title: 'Community Learning',
    description: 'Connect with other learners, share progress, and practice together.',
    color: 'text-indigo-500'
  }
]

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Spanish Learner',
    content: 'LyreBird transformed my language learning journey! The AI conversations feel so natural.',
    rating: 5,
    avatar: '👩‍💼'
  },
  {
    name: 'Michael Chen',
    role: 'French Enthusiast',
    content: 'The 3D learning environment is incredible. I never thought learning could be this engaging!',
    rating: 5,
    avatar: '👨‍💻'
  },
  {
    name: 'Emily Rodriguez',
    role: 'German Student',
    content: 'Perfect for busy professionals. I can practice during my commute with the mobile app.',
    rating: 5,
    avatar: '👩‍🎓'
  }
]

const stats = [
  { number: '1M+', label: 'Active Learners' },
  { number: '50+', label: 'Languages' },
  { number: '99%', label: 'Success Rate' },
  { number: '24/7', label: 'AI Support' }
]

export default function LandingPage() {
  const { isSignedIn } = useUser()
  const router = useRouter()
  const [currentFeature, setCurrentFeature] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard')
    }
  }, [isSignedIn, router])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6
      }
    }
  }

  if (isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: '#B9B38F'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{backgroundColor: '#B9B38F'}}>
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/logo.ico" 
              alt="LyreBird Logo" 
              className="w-12 h-12 rounded-full object-cover"
            />
            <span className="text-2xl font-bold text-primary">LyreBird</span>
          </div>
          
          <div className="flex space-x-4">
            <SignInButton mode="modal">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                Sign In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button className="bg-primary hover:bg-primary/90">
                Get Started
              </Button>
            </SignUpButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl md:text-7xl font-bold text-primary mb-6">
            Master Languages with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-olive-green to-dark-green">
              AI
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Experience the future of language learning with AI-powered conversations, 
            interactive 3D environments, and personalized learning paths.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <SignUpButton mode="modal">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-lg px-8 py-4">
                Start Learning Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </SignUpButton>
            <a href="https://github.com/dinasquare/LyreBird" target="_blank">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground text-lg px-8 py-4">
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <motion.h2 variants={itemVariants} className="text-4xl font-bold text-primary mb-4">
            Why Choose LyreBird?
          </motion.h2>
          <motion.p variants={itemVariants} className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our cutting-edge features make language learning more effective, engaging, and enjoyable than ever before.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-300 group-hover:scale-105 border-2 border-transparent group-hover:border-primary/20">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">Your Learning Journey</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Follow our proven learning path designed by language experts and powered by AI.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Assessment',
                description: 'Take a quick placement test to determine your current level',
                icon: Target
              },
              {
                step: '02',
                title: 'Personalized Plan',
                description: 'Get a customized learning plan based on your goals and schedule',
                icon: BookOpen
              },
              {
                step: '03',
                title: 'Practice & Progress',
                description: 'Practice with AI, track progress, and achieve fluency faster',
                icon: TrendingUp
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center relative"
              >
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-sand-beige rounded-full flex items-center justify-center text-sm font-bold text-primary">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-primary mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-primary mb-4">What Our Learners Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join thousands of successful language learners who have transformed their lives with LyreBird.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className="h-full hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="text-4xl mb-2">{testimonial.avatar}</div>
                  <div className="flex justify-center mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                                                <Star key={i} className="w-5 h-5 text-custom-green fill-current" />
                    ))}
                  </div>
                  <CardTitle className="text-lg">{testimonial.name}</CardTitle>
                  <CardDescription>{testimonial.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-center text-muted-foreground italic">
                    "{testimonial.content}"
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-12 text-white"
          >
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Journey?</h2>
            <p className="text-xl mb-8 text-primary-foreground/90">
              Join millions of learners worldwide and discover the fastest way to master any language.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <SignUpButton mode="modal">
                <Button size="lg" variant="outline" className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-4">
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </SignUpButton>
              <Button size="lg" variant="ghost" className="text-white border-white hover:bg-white/10 text-lg px-8 py-4">
                Learn More
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-green text-cream-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-cream-white rounded-xl flex items-center justify-center">
                  <Brain className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xl font-bold">LyreBird</span>
              </div>
              <p className="text-cream-white/80 mb-4">
                The future of language learning is here. Master any language with AI-powered conversations and interactive learning.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-cream-white/80">
                <li><a href="#" className="hover:text-cream-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-cream-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-cream-white transition-colors">Languages</a></li>
                <li><a href="#" className="hover:text-cream-white transition-colors">Mobile App</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-cream-white/80">
                <li><a href="#" className="hover:text-cream-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-cream-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-cream-white transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-cream-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-cream-white/80">
                <li><a href="#" className="hover:text-cream-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-cream-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-cream-white transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-cream-white transition-colors">Terms</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-cream-white/20 mt-8 pt-8 text-center text-cream-white/60">
            <p>&copy; 2025 LyreBird. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 