'use client'

import { useState } from 'react'

interface LearningSceneProps {
  selectedLanguage: string
  onObjectClick: (obj: any) => void
}

// Main interactive scene component
function InteractiveScene({ onObjectClick }: { onObjectClick: (obj: any) => void }) {
  const objects = [
    { id: 'apple', position: 'top-8 left-8', color: 'bg-red-400', name: 'Apple', emoji: '🍎' },
    { id: 'car', position: 'top-8 left-1/2 transform -translate-x-1/2', color: 'bg-blue-400', name: 'Car', emoji: '🚗' },
    { id: 'house', position: 'top-8 right-8', color: 'bg-green-400', name: 'House', emoji: '🏠' },
    { id: 'coffee', position: 'bottom-16 left-16', color: 'bg-amber-400', name: 'Coffee', emoji: '☕' },
    { id: 'shirt', position: 'bottom-16 right-16', color: 'bg-purple-400', name: 'Shirt', emoji: '👕' },
    { id: 'book', position: 'top-1/2 left-4 transform -translate-y-1/2', color: 'bg-indigo-400', name: 'Book', emoji: '📚' },
    { id: 'phone', position: 'top-1/2 right-4 transform -translate-y-1/2', color: 'bg-pink-400', name: 'Phone', emoji: '📱' },
  ]

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-[#FEFAE0] to-[#B1AB86] rounded-lg overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#0A400C] rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-[#819067] rounded-full blur-3xl"></div>
      </div>
      
      {/* Interactive objects */}
      {objects.map((obj) => (
        <div
          key={obj.id}
          className={`absolute ${obj.position} w-20 h-20 ${obj.color} rounded-2xl cursor-pointer transform transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-black/20 flex items-center justify-center text-3xl group border-2 border-white/20`}
          onClick={() => onObjectClick(obj)}
        >
          <span className="group-hover:scale-125 transition-transform duration-200 drop-shadow-sm">{obj.emoji}</span>
          <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-3 py-1 rounded-md text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap font-medium">
            {obj.name}
          </div>
        </div>
      ))}
      
      {/* Instructions */}
      <div className="absolute bottom-4 left-4 text-[#0A400C] text-sm opacity-70 bg-white/20 px-3 py-2 rounded-lg backdrop-blur-sm">
        Click on objects to learn vocabulary
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-[#0A400C] font-semibold text-lg opacity-80">
        Language Learning Lab
      </div>
    </div>
  )
}

export default function LearningScene({ selectedLanguage, onObjectClick }: LearningSceneProps) {
  return (
    <div className="w-full h-full relative">
      <InteractiveScene onObjectClick={onObjectClick} />
    </div>
  )
} 