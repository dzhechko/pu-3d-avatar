import React, { Suspense } from 'react';
import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import { ChatInterface } from "./ChatInterface";
import { SpeechProvider } from "../hooks/useSpeech";
import { AvatarWrapper } from "./AvatarWrapper";
import { Loader } from "@react-three/drei";
import { ThinkingIndicator } from "./ThinkingIndicator";
import { LoadingProgressBar } from "./LoadingProgressBar";

export const PracticePage = () => {
  return (
    <SpeechProvider>
      <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        {/* Loading Progress Bar - Positioned absolutely */}
        <LoadingProgressBar />
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          {/* Left Side - Avatar */}
          <div className="lg:w-2/3 h-[600px] relative bg-white rounded-2xl shadow-lg overflow-hidden">
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
                  <color attach="background" args={["#ffffff"]} />
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
            <div className="bg-white rounded-t-2xl p-6 shadow-lg">
              <h1 className="text-2xl font-bold text-gray-800">AI Conversation Partner</h1>
              <p className="text-gray-600 mt-2">Practice your English speaking skills</p>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 bg-white rounded-b-2xl shadow-lg">
              <ChatInterface />
            </div>
          </div>
        </div>
      </div>
    </SpeechProvider>
  );
}; 