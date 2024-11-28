import React from 'react';
import { useSpeech } from "../hooks/useSpeech";
import { useDarkMode } from "../hooks/useDarkMode";

const DEBUG = true;

export const ThinkingIndicator = () => {
  const { isProcessing } = useSpeech();
  const { isDarkMode } = useDarkMode();

  if (DEBUG) {
    console.log('🎭 ThinkingIndicator - Dark Mode:', isDarkMode);
    console.log('⚙️ ThinkingIndicator - Processing:', isProcessing);
  }

  if (!isProcessing) return null;

  return (
    <div 
      className={`
        backdrop-blur-md px-6 py-3 rounded-2xl shadow-xl border animate-fade-in
        ${isDarkMode 
          ? 'bg-gray-800/95 border-gray-700 text-white' 
          : 'bg-white/95 border-gray-100 text-gray-800'
        }
      `}
    >
      <div className="flex items-center gap-4">
        {/* Animated Brain Icon */}
        <div className={`animate-pulse ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>

        <div className="flex flex-col">
          <div className={`font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            AI is thinking
          </div>
          <div className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Processing your message...
          </div>
        </div>

        {/* Animated Dots */}
        <div className="flex gap-1">
          {['-0.3s', '-0.15s', '0s'].map((delay, index) => (
            <div 
              key={index}
              className={`
                w-2 h-2 rounded-full animate-bounce
                ${isDarkMode ? 'bg-blue-400' : 'bg-blue-500'}
              `}
              style={{ animationDelay: delay }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}; 