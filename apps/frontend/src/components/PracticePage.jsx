import React, { Suspense } from 'react';
import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import { ChatInterface } from "./ChatInterface";
import { SpeechProvider } from "../hooks/useSpeech";
import { AvatarWrapper } from "./AvatarWrapper";
import { Loader } from "@react-three/drei";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { LoadingProgressBar } from "./LoadingProgressBar";
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaMoon, FaSun } from 'react-icons/fa';
import { useDarkMode } from '../hooks/useDarkMode';

export const PracticePage = () => {
  const { isDarkMode, toggleDarkMode } = useDarkMode();

  return (
    <SpeechProvider>
      <div className={`relative min-h-screen ${isDarkMode ? 'bg-gradient-to-b from-gray-900 to-gray-800' : 'bg-gradient-to-b from-gray-50 to-gray-100'}`}>
        {/* Loading Progress Bar - Positioned absolutely */}
        <LoadingProgressBar />

        {/* Navigation and Controls */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
          <Link 
            to="/" 
            className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDarkMode 
                ? 'bg-gray-800 text-white hover:bg-gray-700' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            } shadow-lg transition-colors`}
          >
            <FaArrowLeft />
            <span>Back</span>
          </Link>

          <button
            onClick={toggleDarkMode}
            className={`p-3 rounded-lg shadow-lg transition-colors ${
              isDarkMode 
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' 
                : 'bg-white text-gray-800 hover:bg-gray-100'
            }`}
          >
            {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 pt-20 flex flex-col lg:flex-row gap-8">
          {/* Left Side - Avatar */}
          <div className={`lg:w-2/3 h-[600px] relative ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden`}>
            <AvatarWrapper>
              <Suspense fallback={null}>
                <Canvas
                  shadows
                  gl={{ 
                    antialias: true,
                    preserveDrawingBuffer: true,
                    alpha: true
                  }}
                >
                  <color attach="background" args={[isDarkMode ? "#1f2937" : "#ffffff"]} />
                  <Experience />
                </Canvas>
                <Loader />
              </Suspense>
            </AvatarWrapper>
            
            {/* Thinking Indicator - Now inside avatar container */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
              <ThinkingIndicator />
            </div>
          </div>

          {/* Right Side - Chat Interface */}
          <div className="lg:w-1/3 flex flex-col">
            {/* Chat Header */}
            <div className={`${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'} rounded-t-2xl p-6 shadow-lg`}>
              <h1 className="text-2xl font-bold">AI Conversation Partner</h1>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>Practice your English speaking skills</p>
            </div>

            {/* Chat Interface */}
            <div className={`flex-1 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-b-2xl shadow-lg`}>
              <ChatInterface darkMode={isDarkMode} />
            </div>
          </div>
        </div>
      </div>
    </SpeechProvider>
  );
}; 