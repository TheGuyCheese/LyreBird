import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'

// Improved phoneme to viseme mapping for better lip-sync
const phonemeToVisemeMap: { [key: string]: string } = {
  // Consonants
  'p': 'PP', 'b': 'PP', 'm': 'PP',
  'f': 'FF', 'v': 'FF',
  'th': 'TH', 'dh': 'TH',
  't': 'DD', 'd': 'DD', 'n': 'DD', 'l': 'DD',
  'k': 'kk', 'g': 'kk', 'ng': 'kk',
  'ch': 'CH', 'j': 'CH', 'sh': 'CH', 'zh': 'CH',
  's': 'SS', 'z': 'SS',
  'r': 'RR',
  // Vowels
  'a': 'aa', 'ae': 'aa',
  'e': 'E', 'eh': 'E',
  'i': 'I', 'ih': 'I',
  'o': 'O', 'oh': 'O',
  'u': 'U', 'uh': 'U',
  // Default
  'sil': 'sil'
}

// Improved viseme generation with better timing
function generateVisemeData(text: string, duration: number) {
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(' ').filter((word: string) => word.length > 0)
  const visemes = []
  let currentTime = 0
  
  // Start with silence
  visemes.push({
    start: 0,
    end: 0.1,
    value: 'sil'
  })
  currentTime = 0.1
  
  const totalWords = words.length
  const avgTimePerWord = (duration - 0.2) / totalWords // Leave time for silence at start/end
  
  for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
    const word = words[wordIndex]
    const wordDuration = avgTimePerWord * (0.8 + Math.random() * 0.4) // Add some variation
    
    // Generate visemes for each character/phoneme in the word
    const chars = word.split('')
    const timePerChar = wordDuration / chars.length
    
    for (let charIndex = 0; charIndex < chars.length; charIndex++) {
      const char = chars[charIndex]
      const visemeType = getVisemeForChar(char)
      const charDuration = timePerChar * (0.7 + Math.random() * 0.6) // Variation in timing
      
      visemes.push({
        start: currentTime,
        end: currentTime + charDuration,
        value: visemeType
      })
      
      currentTime += charDuration
    }
    
    // Add a small pause between words (except for the last word)
    if (wordIndex < words.length - 1) {
      const pauseDuration = 0.05 + Math.random() * 0.1
      visemes.push({
        start: currentTime,
        end: currentTime + pauseDuration,
        value: 'sil'
      })
      currentTime += pauseDuration
    }
  }
  
  // End with silence
  if (currentTime < duration) {
    visemes.push({
      start: currentTime,
      end: duration,
      value: 'sil'
    })
  }
  
  return visemes
}

// Function removed - not needed in improved implementation

function getVisemeForChar(char: string): string {
  const vowels = 'aeiou'
  const consonants = {
    'p': 'PP', 'b': 'PP', 'm': 'PP',
    'f': 'FF', 'v': 'FF', 'w': 'FF',
    't': 'DD', 'd': 'DD', 'n': 'DD', 'l': 'DD',
    'k': 'kk', 'g': 'kk', 'q': 'kk',
    'c': 'CH', 'j': 'CH',
    's': 'SS', 'z': 'SS', 'x': 'SS',
    'r': 'RR',
    'h': 'sil', 'y': 'I' // Special cases
  }
  
  if (vowels.includes(char)) {
    switch (char) {
      case 'a': return 'aa'
      case 'e': return 'E'
      case 'i': return 'I'
      case 'o': return 'O'
      case 'u': return 'U'
      default: return 'aa'
    }
  }
  
  return consonants[char as keyof typeof consonants] || 'sil'
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await auth()
    const userId = authResult?.userId

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { text } = await request.json()

    if (!text) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 })
    }

    // Improved duration estimation
    const wordsPerMinute = 140 // Slightly slower for better lip-sync
    const words = text.split(' ').filter((word: string) => word.trim().length > 0)
    const estimatedDuration = Math.max((words.length / wordsPerMinute) * 60, 1.0) // Minimum 1 second
    
    // Generate viseme timing data
    const visemes = generateVisemeData(text, estimatedDuration)
    
    console.log(`Generated ${visemes.length} visemes for text: "${text.substring(0, 50)}..."`)
    console.log('First few visemes:', visemes.slice(0, 5))
    
    return NextResponse.json({
      text,
      duration: estimatedDuration,
      visemes,
      wordCount: words.length,
      // Note: In a real implementation, you would include base64 audio data here
      audioAvailable: false,
      debug: {
        estimatedDuration,
        wordCount: words.length,
        visemeCount: visemes.length
      }
    })

  } catch (error) {
    console.error('Error in speech API:', error)
    return NextResponse.json(
      { error: 'Failed to generate speech' }, 
      { status: 500 }
    )
  }
} 