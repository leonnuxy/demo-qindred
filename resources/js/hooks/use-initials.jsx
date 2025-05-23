// resources/js/hooks/use-initials.jsx

import { useCallback } from 'react';

/**
 * Returns a function that, given a full name string,
 * produces its 1–2 character initials (uppercased).
 * If the input is missing or not a string, returns ''.
 */
export function useInitials() {
  return useCallback((fullName) => {
    if (typeof fullName !== 'string') {
      return '';
    }

    // Split on spaces, filter out any empty parts
    const parts = fullName.trim().split(' ').filter(Boolean);
    if (parts.length === 0) {
      return '';
    }

    // Grab first letter of first and last (if present)
    const firstInitial = parts[0].charAt(0);
    const lastInitial = parts.length > 1 
      ? parts[parts.length - 1].charAt(0) 
      : '';

    return (firstInitial + lastInitial).toUpperCase();
  }, []);
}
