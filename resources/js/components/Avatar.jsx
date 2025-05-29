import React, { useState } from 'react';

export default function Avatar({ src, alt, name, className = "" }) {
  const [imageError, setImageError] = useState(false);
  
  // Get first letter of name for fallback
  const fallbackLetter = (name || 'U').charAt(0).toUpperCase();
  
  return (
    <div className={`rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}>
      {src && !imageError ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-lg font-medium">
          {fallbackLetter}
        </span>
      )}
    </div>
  );
}
