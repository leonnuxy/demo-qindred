import React from 'react';

export function InvitationPlaceholder({ variant = 'default' }) {
  // Generate different placeholder styles for more realistic appearance
  const getRandomWidth = () => {
    const options = ['50%', '60%', '70%', '75%'];
    return options[Math.floor(Math.random() * options.length)];
  };

  return (
    <div className={`invitation-placeholder-item ${variant === 'narrow' ? 'narrow' : ''}`}>
      <div className="invitation-placeholder-details">
        <div className="invitation-placeholder-text" style={{ width: getRandomWidth() }}></div>
        <div className="invitation-placeholder-text small" style={{ width: getRandomWidth() }}></div>
      </div>
      <div className="invitation-placeholder-actions">
        <div className="invitation-placeholder-button"></div>
        <div className="invitation-placeholder-button"></div>
      </div>
    </div>
  );
}
