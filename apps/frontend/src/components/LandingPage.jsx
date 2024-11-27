import React from 'react';
import { useNavigate } from 'react-router-dom';

export const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-gray-800">Logo</div>
        <nav>
          <ul className="flex space-x-6">
            <li><a href="#" className="text-gray-600 hover:text-gray-800">About</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-800">Features</a></li>
            <li><a href="#" className="text-gray-600 hover:text-gray-800">Contact</a></li>
          </ul>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex">
        {/* Left Side */}
        <div className="w-1/2 flex flex-col justify-center px-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Practice Your English with AI
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Improve your English speaking skills with our AI-powered conversation partner. 
            Practice anytime, anywhere.
          </p>
          <button 
            onClick={() => navigate('/practice')}
            className="bg-blue-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors w-fit"
          >
            Start Practice Now
          </button>
        </div>

        {/* Right Side - Interactive SVG Display */}
        <div className="w-1/2 bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-12">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Main Circle with Animation */}
            <div className="relative w-96 h-96">
              {/* Animated circles */}
              <div className="absolute inset-0 animate-spin-slow">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#93C5FD" 
                    strokeWidth="0.5" 
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>
              <div className="absolute inset-8 animate-spin-slow-reverse">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="45" 
                    fill="none" 
                    stroke="#C4B5FD" 
                    strokeWidth="0.5" 
                    strokeDasharray="4 4"
                  />
                </svg>
              </div>

              {/* Central Brain Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-32 h-32 text-blue-600 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313-12.454z" />
                  <path d="M17.5 8a4.5 4.5 0 1 1 -4.5 4.5" />
                  <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
                </svg>
              </div>

              {/* Orbiting Elements */}
              <div className="absolute inset-0">
                {/* Message Bubbles */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 transform">
                  <svg className="w-12 h-12 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 9h8m-8 4h6m-8-3a6 6 0 1 1 12 0c0 3.314-2.686 6-6 6h-2l-4 4v-4c-2.543 0-4-2.686-4-6z" />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 transform">
                  <svg className="w-12 h-12 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 12h1m8 -9v1m8 8h1m-9 8v1m-6.4 -15.4l.7 .7m12.1 -.7l-.7 .7m0 11.4l.7 .7m-12.1 -.7l-.7 .7" />
                  </svg>
                </div>
                <div className="absolute left-0 top-1/2 -translate-y-1/2 transform">
                  <svg className="w-12 h-12 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 18h-7a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v7" />
                    <path d="M3 6l9 6l9 -6" />
                  </svg>
                </div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 transform">
                  <svg className="w-12 h-12 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M8 9h8m-8 4h6m4 -11v16l-4 -4h-8a4 4 0 0 1 -4 -4v-4a4 4 0 0 1 4 -4h8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}; 