import { useState, useEffect } from 'react';

const DEBUG = true;

export const useDarkMode = () => {
  // Initialize state from localStorage or default to false
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('darkMode');
      if (DEBUG) console.log('🌓 Initializing dark mode from storage:', savedMode);
      return savedMode === 'true';
    } catch (error) {
      console.error('Error reading dark mode from storage:', error);
      return false;
    }
  });

  // Update localStorage when dark mode changes
  useEffect(() => {
    try {
      if (DEBUG) console.log('🌓 Updating dark mode in storage:', isDarkMode);
      localStorage.setItem('darkMode', String(isDarkMode));
      
      // Force a re-render of components using dark mode
      window.dispatchEvent(new Event('darkmode-changed'));
    } catch (error) {
      console.error('Error saving dark mode to storage:', error);
    }
  }, [isDarkMode]);

  // Listen for dark mode changes from other components
  useEffect(() => {
    const handleDarkModeChange = () => {
      try {
        const savedMode = localStorage.getItem('darkMode');
        if (DEBUG) console.log('🌓 Dark mode changed externally:', savedMode);
        setIsDarkMode(savedMode === 'true');
      } catch (error) {
        console.error('Error handling dark mode change:', error);
      }
    };

    window.addEventListener('darkmode-changed', handleDarkModeChange);
    return () => window.removeEventListener('darkmode-changed', handleDarkModeChange);
  }, []);

  const toggleDarkMode = () => {
    if (DEBUG) console.log('🌓 Toggling dark mode from:', isDarkMode);
    setIsDarkMode(prev => !prev);
  };

  return { isDarkMode, toggleDarkMode };
}; 