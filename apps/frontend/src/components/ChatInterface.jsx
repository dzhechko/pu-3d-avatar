import React, { useState } from "react";
import { useSpeech } from "../hooks/useSpeech";

// Microphone icon component
const MicrophoneIcon = ({ className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    fill="none" 
    viewBox="0 0 24 24" 
    strokeWidth={1.5} 
    stroke="currentColor" 
    className={className}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" 
    />
  </svg>
);

export const ChatInterface = () => {
  const [inputMessage, setInputMessage] = useState("");
  const { 
    sendMessage, 
    isProcessing, 
    message, 
    isRecording,
    startRecording,
    stopRecording
  } = useSpeech();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;
    
    await sendMessage(inputMessage);
    setInputMessage("");
  };

  const handleVoiceButton = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Status Area */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isProcessing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-sm text-gray-600">
            {isProcessing ? "AI is processing..." : "Ready to chat"}
          </span>
        </div>
        {isRecording && (
          <div className="mt-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-sm text-red-500">Recording... Click microphone to stop</span>
          </div>
        )}
      </div>

      {/* Message Input Area */}
      <div className="p-4 mt-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message here..."
              className="w-full p-4 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px] resize-none bg-gray-50"
              disabled={isProcessing || isRecording}
            />
            <button
              type="button"
              onClick={handleVoiceButton}
              disabled={isProcessing}
              className={`absolute right-3 bottom-3 p-3 rounded-xl transition-all
                ${isRecording 
                  ? 'bg-red-500 text-white hover:bg-red-600' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
                transform hover:scale-105 active:scale-95
              `}
            >
              <MicrophoneIcon />
            </button>
          </div>
          <button
            type="submit"
            disabled={isProcessing || !inputMessage.trim() || isRecording}
            className={`w-full py-3 px-4 rounded-xl font-medium text-white transition-all
              ${isProcessing || !inputMessage.trim() || isRecording
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-[1.02] active:scale-[0.98]'
              }
            `}
          >
            {isProcessing ? "Processing..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
};
