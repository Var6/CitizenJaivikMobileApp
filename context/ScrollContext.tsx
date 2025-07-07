// context/ScrollContext.tsx
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface ScrollContextType {
  isTabBarVisible: boolean;
  hideTabBar: () => void;
  showTabBar: () => void;
  handleScroll: (event: any) => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export const useScrollContext = () => {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within a ScrollProvider');
  }
  return context;
};

interface ScrollProviderProps {
  children: React.ReactNode;
}

export const ScrollProvider: React.FC<ScrollProviderProps> = ({ children }) => {
  const [isTabBarVisible, setIsTabBarVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideTabBar = useCallback(() => {
    setIsTabBarVisible(false);
  }, []);

  const showTabBar = useCallback(() => {
    setIsTabBarVisible(true);
  }, []);

  const handleScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent.contentOffset.y;
    const scrollDifference = currentScrollY - lastScrollY.current;
    
    // Only trigger if scroll is significant enough (50px threshold)
    if (Math.abs(scrollDifference) > 50) {
      if (scrollDifference > 0 && currentScrollY > 100) {
        // Scrolling down and not at the very top
        hideTabBar();
      } else if (scrollDifference < 0) {
        // Scrolling up
        showTabBar();
      }
      lastScrollY.current = currentScrollY;
    }

    // Clear any existing timeout
    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    // Show tab bar after user stops scrolling for 1 second
    scrollTimeout.current = setTimeout(() => {
      showTabBar();
    }, 1000);
  }, [hideTabBar, showTabBar]);

  return (
    <ScrollContext.Provider value={{
      isTabBarVisible,
      hideTabBar,
      showTabBar,
      handleScroll,
    }}>
      {children}
    </ScrollContext.Provider>
  );
};