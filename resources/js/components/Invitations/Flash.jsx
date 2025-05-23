import React from 'react';

export function Flash({ type, message }) {
  if (!message) return null;
  
  // Use CSS classes from invitations.css
  const classes = `flash flash-${type}`;
  
  return (
    <div className={classes}>
      {message}
    </div>
  );
}
