import React, { useEffect } from 'react';
import { useSpeech } from "../hooks/useSpeech";

const DEBUG = true;

export const LoadingProgressBar = () => {
  const { isProcessing, error } = useSpeech();

  useEffect(() => {
    if (DEBUG) {
      console.log('🚀 LoadingProgressBar - Mount/Update');
      console.log('🔄 isProcessing:', isProcessing);
      console.log('❌ Error:', error);
    }
  }, [isProcessing, error]);

  if (!isProcessing && !error) {
    if (DEBUG) console.log('⏹️ LoadingProgressBar - Not showing (isProcessing is false)');
    return null;
  }

  if (DEBUG) console.log('▶️ LoadingProgressBar - Rendering progress bar');

  return (
    <div className="fixed top-0 left-0 w-full z-[9999] pointer-events-none">
      {error ? (
        // Error state
        <div className="h-3 w-full bg-red-100">
          <div 
            className="h-full bg-gradient-to-r from-red-500 to-orange-500"
            style={{
              width: '100%',
              transition: 'all 0.2s ease-in-out',
            }}
          />
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-50 text-red-600 px-4 py-2 rounded-lg shadow-lg text-sm font-medium">
            {error}
          </div>
        </div>
      ) : (
        // Loading state
        <>
          {/* Main progress bar container */}
          <div className="h-3 w-full bg-black/10">
            {/* Animated progress bar */}
            <div 
              className="h-full bg-gradient-to-r from-green-400 via-blue-500 to-purple-600"
              style={{
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s ease-in-out infinite',
                transition: 'all 0.2s ease-in-out',
              }}
            />
          </div>
          
          {/* Glowing effect */}
          <div 
            className="absolute top-0 h-3 w-full bg-gradient-to-r from-green-400/50 via-blue-500/50 to-purple-600/50 blur-lg"
            style={{
              backgroundSize: '200% 100%',
              animation: 'loading 1.5s ease-in-out infinite',
              transition: 'all 0.2s ease-in-out',
            }}
          />
        </>
      )}
    </div>
  );
}; 