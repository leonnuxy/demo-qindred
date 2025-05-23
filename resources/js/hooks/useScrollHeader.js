import { useState, useEffect } from 'react';

/**
 * Custom hook for handling floating header scroll behavior
 * @param {number} scrollThreshold - The scroll threshold to trigger header state changes (default: 10)
 * @param {boolean} hideOnScroll - Whether to hide the header on scroll down (default: false)
 * @returns {Object} - The header states (isScrolled, isVisible)
 */
export function useScrollHeader({ scrollThreshold = 10, hideOnScroll = false } = {}) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Check if we've scrolled past the threshold
      if (currentScrollY > scrollThreshold) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Handle hide on scroll functionality
      if (hideOnScroll) {
        // Hide header when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Clean up event listener
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrollThreshold, hideOnScroll, lastScrollY]);

  return { isScrolled, isVisible };
}