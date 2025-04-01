import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a context for theme management
const ThemeContext = createContext();

// Custom hook for consuming the theme context
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  // Check if user has previously set a preference
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    
    // If user has a saved preference, use it
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check if user's device prefers dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Default to light theme
    return 'light';
  };
  
  const [theme, setTheme] = useState(getInitialTheme);
  
  // Apply theme changes to the document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light-mode');
    root.classList.remove('dark-mode');
    
    // Add appropriate class based on current theme
    root.classList.add(`${theme}-mode`);
    
    // Save preference to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Toggle between light and dark mode
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };
  
  // Check if current theme is dark
  const isDarkMode = theme === 'dark';
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;