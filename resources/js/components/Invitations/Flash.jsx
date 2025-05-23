import React from 'react';

export function Flash({ type, message }) {
  if (!message) return null;
  
  return (
    <div className={`flash flash-${type}`}>
      {message}
    </div>
  );
}
