import React from 'react';
import { useSpeech } from "../hooks/useSpeech";

export const ThinkingIndicator = () => {
  const { isProcessing } = useSpeech();

  if (!isProcessing) return null;

  return (
    <div className="bg-white/95 backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border border-gray-100 animate-fade-in">
      <div className="flex items-center gap-4">
        {/* Animated Brain Icon */}
        <div className="text-blue-500 animate-pulse">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        <div className="flex flex-col">
          <div className="text-gray-800 font-medium">AI is thinking</div>
          <div className="text-gray-500 text-sm">Processing your message...</div>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
}; 