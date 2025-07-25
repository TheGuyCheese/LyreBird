import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    // Check if Gemini API key is configured
    if (!process.env.GOOGLE_GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY === 'placeholder_gemini_api_key_replace_with_real_key') {
      return NextResponse.json(
        { 
          response: 'The AI chat feature requires a Google Gemini API key. Please configure your GOOGLE_GEMINI_API_KEY in the .env.local file.',
          translation: 'The AI chat feature requires a Google Gemini API key. Please configure your GOOGLE_GEMINI_API_KEY in the .env.local file.',
          corrections: [],
          suggestions: ['Set up your Google Gemini API key to enable AI conversations']
        },
        { status: 200 }
      )
    }

    const { message, language, userLanguage, topic, level, conversationHistory } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    // Get the language full names
    const languageNames: { [key: string]: string } = {
      spanish: 'Spanish',
      french: 'French',
      german: 'German',
      italian: 'Italian',
      portuguese: 'Portuguese',
      russian: 'Russian',
      japanese: 'Japanese',
      korean: 'Korean',
      chinese: 'Chinese',
      arabic: 'Arabic',
      english: 'English'
    }

    const targetLanguage = languageNames[language] || 'Spanish'
    const originalLanguage = languageNames[userLanguage || 'english'] || 'English'
    
    // Create context based on topic and level
    const topicContext = {
      introductions: 'introductions, meeting new people, personal information, greetings, and basic conversation starters',
      restaurant: 'restaurant dining, ordering food, asking about menu items, making reservations, and food-related vocabulary',
      travel: 'traveling, asking for directions, booking accommodations, transportation, and travel-related situations',
      business: 'professional communication, meetings, presentations, workplace etiquette, and business terminology'
    }

    const levelInstructions = {
      beginner: 'Use simple vocabulary, basic grammar structures, and provide clear explanations. Be patient and encouraging.',
      intermediate: 'Use more complex vocabulary and grammar. Introduce idiomatic expressions and cultural context.',
      advanced: 'Use sophisticated vocabulary, complex grammar structures, and discuss nuanced topics. Challenge the learner appropriately.'
    }

    // Build conversation history context
    const historyContext = conversationHistory
      .map((msg: any) => `${msg.role === 'user' ? 'Student' : 'Tutor'}: ${msg.content}`)
      .join('\n')

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `You are an AI language tutor specializing in ${targetLanguage}. You are having a conversation with a ${level} level student about ${topicContext[topic as keyof typeof topicContext] || 'general conversation'}.

The student's native language is ${originalLanguage}, and they are learning ${targetLanguage}.

INSTRUCTIONS:
1. Respond primarily in ${targetLanguage} (this will be your main response)
2. ${levelInstructions[level as keyof typeof levelInstructions]}
3. If the student makes errors, gently correct them by showing the correct version
4. Ask follow-up questions to keep the conversation engaging
5. Be encouraging and supportive
6. Include cultural context when relevant
7. Focus on practical, real-world language use
8. Provide a translation of your response in ${originalLanguage} for the student's understanding

CONVERSATION HISTORY:
${historyContext}

STUDENT'S LATEST MESSAGE: ${message}

Please respond as a helpful language tutor. Your response should be primarily in ${targetLanguage}, and you should also provide a translation in ${originalLanguage}.

IMPORTANT: Respond ONLY with valid JSON in exactly this format (no additional text, no "json" prefix):
{
  "response": "Your main response to the student in ${targetLanguage}",
  "translation": "Translation of your response in ${originalLanguage}",
  "corrections": ["List of corrections if any"],
  "suggestions": ["Helpful suggestions or alternative ways to express the same idea"]
}`

    const result = await model.generateContent(prompt)
    const response = await result.response
    let text = response.text()

    // Clean up the response text - remove any "json" prefix and extra formatting
    text = text.replace(/^json\s*/i, '').trim()
    
    // Try to extract JSON from the response if it's wrapped in other text
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      text = jsonMatch[0]
    }

    // Try to parse JSON response
    let parsedResponse
    try {
      parsedResponse = JSON.parse(text)
      
      // Ensure the required fields exist
      if (!parsedResponse.response) {
        parsedResponse.response = text
      }
      if (!parsedResponse.translation) {
        // If no translation provided, use the response as translation
        parsedResponse.translation = parsedResponse.response
      }
      if (!Array.isArray(parsedResponse.corrections)) {
        parsedResponse.corrections = []
      }
      if (!Array.isArray(parsedResponse.suggestions)) {
        parsedResponse.suggestions = []
      }
    } catch (e) {
      // If JSON parsing fails, create a structured response
      parsedResponse = {
        response: text,
        translation: text, // Fallback translation
        corrections: [],
        suggestions: []
      }
    }

    return NextResponse.json(parsedResponse, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('Error in chat API:', error)
    return NextResponse.json(
      { 
        response: 'I apologize, but I encountered an error processing your message. Please try again.',
        translation: 'I apologize, but I encountered an error processing your message. Please try again.',
        corrections: [],
        suggestions: ['Try rephrasing your message', 'Check your internet connection']
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    { message: 'Chat API is working' },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
} 