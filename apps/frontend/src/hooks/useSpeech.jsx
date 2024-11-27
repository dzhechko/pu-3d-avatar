import { createContext, useContext, useState, useEffect, useRef } from "react";

const SpeechContext = createContext({});

const backendUrl = "http://localhost:3000";
const DEBUG = true;
const MIN_RECORDING_TIME = 1000; // Minimum recording time in milliseconds

export const SpeechProvider = ({ children }) => {
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState(null);
  const mediaRecorder = useRef(null);
  const chunks = useRef([]);
  const recordingStartTime = useRef(null);

  // Initialize media recorder
  useEffect(() => {
    if (typeof window !== "undefined") {
      navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
          const recorder = new MediaRecorder(stream);
          
          recorder.onstart = () => {
            chunks.current = [];
            recordingStartTime.current = Date.now();
            setError(null);
            if (DEBUG) console.log('🎤 Started recording');
          };
          
          recorder.ondataavailable = (e) => {
            chunks.current.push(e.data);
          };
          
          recorder.onstop = async () => {
            const recordingDuration = Date.now() - recordingStartTime.current;
            if (DEBUG) console.log(`🕒 Recording duration: ${recordingDuration}ms`);

            if (recordingDuration < MIN_RECORDING_TIME) {
              if (DEBUG) console.log('⚠️ Recording too short');
              setError('Please record for at least 1 second');
              return;
            }

            if (DEBUG) console.log('🛑 Stopped recording, processing audio...');
            setIsProcessing(true);
            const audioBlob = new Blob(chunks.current, { type: "audio/webm" });
            try {
              await sendAudioMessage(audioBlob);
            } catch (error) {
              console.error('Error processing audio:', error);
              setError('Error processing audio. Please try again.');
              setIsProcessing(false);
            }
          };
          
          mediaRecorder.current = recorder;
        })
        .catch((err) => {
          console.error("Error accessing microphone:", err);
          setError('Error accessing microphone. Please check your permissions.');
        });
    }
  }, []);

  const startRecording = () => {
    if (mediaRecorder.current && !isProcessing) {
      mediaRecorder.current.start();
      setIsRecording(true);
      setError(null);
      if (DEBUG) console.log('🎙️ Recording started');
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && isRecording) {
      mediaRecorder.current.stop();
      setIsRecording(false);
      if (DEBUG) console.log('🎙️ Recording stopped');
    }
  };

  const sendAudioMessage = async (audioBlob) => {
    try {
      if (DEBUG) console.log('📤 Sending audio message...');
      
      // Convert blob to base64
      const reader = new FileReader();
      
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Audio = reader.result.split(",")[1];
            
            const response = await fetch(`${backendUrl}/sts`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ audio: base64Audio }),
            });

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Network response was not ok');
            }

            const data = await response.json();
            if (DEBUG) console.log('📥 Received response:', data);
            setMessage(data.messages[0]);
            resolve();
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error('Error reading audio file'));
        };

        reader.readAsDataURL(audioBlob);
      });
    } catch (error) {
      console.error("Error sending audio message:", error);
      throw error;
    }
  };

  const sendMessage = async (text) => {
    try {
      setIsProcessing(true);
      setError(null);
      if (DEBUG) console.log('📤 Sending text message:', text);
      
      const response = await fetch(`${backendUrl}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json();
      if (DEBUG) console.log('📥 Received response:', data);
      setMessage(data.messages[0]);
    } catch (error) {
      console.error("Error sending message:", error);
      setError('Error sending message. Please try again.');
      setIsProcessing(false);
    }
  };

  const onMessagePlayed = () => {
    if (DEBUG) console.log('✅ Message played, resetting state');
    setMessage(null);
    setIsProcessing(false);
    setError(null);
  };

  const contextValue = {
    message,
    isProcessing,
    isRecording,
    error,
    sendMessage,
    onMessagePlayed,
    startRecording,
    stopRecording,
  };

  return (
    <SpeechContext.Provider value={contextValue}>
      {typeof children === 'function' ? children(contextValue) : children}
    </SpeechContext.Provider>
  );
};

export const useSpeech = () => {
  const context = useContext(SpeechContext);
  if (context === undefined) {
    throw new Error("useSpeech must be used within a SpeechProvider");
  }
  return context;
};
