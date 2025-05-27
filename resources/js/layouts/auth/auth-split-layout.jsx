import React from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import '@css/auth/auth-shared.css';

export default function AuthSplitLayout({ children, logo, image, taglineText, logoText = 'Qindred' }) {
  return (
    <div className="auth-split-layout">
      {/* Image Panel */}
      <div className="auth-split-layout__panel auth-split-layout__panel--image">
        <Link href={route('home')} className="auth-logo qindred-logo">
          <AppLogoIcon variant="auth" className="qindred-logo-icon" />
          <span className="qindred-logo-text">{logoText}</span>
        </Link>
        {image && <img src={image} alt="" className="auth-image" />}
        <h1 className="auth-heading">Build & Explore Your Family Tree</h1>
        <h2 className="auth-tagline-title">Easily add family members, link relatives, and explore your lineage in a beautifully designed family tree.</h2>
        <p className="auth-tagline-text">{taglineText}</p>
      </div>

      {/* Form Panel */}
      <div className="auth-split-layout__panel auth-split-layout__panel--form">
        {children}
      </div>
    </div>
  );
}
