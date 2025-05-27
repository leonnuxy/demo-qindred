import React from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { Link } from '@inertiajs/react';
import '@css/auth/auth-shared.css';

// Mobile Header Component for branding on mobile devices
const MobileHeader = ({ logoText }) => (
  <div className="auth-mobile-header">
    <Link href={route('home')} className="auth-mobile-header__logo">
      <AppLogoIcon variant="auth" className="auth-mobile-header__logo-icon" />
      <span className="auth-mobile-header__logo-text">{logoText}</span>
    </Link>
    <p className="auth-mobile-header__tagline">
      Build your family tree 🌳 Connect with relatives • Preserve memories
    </p>
  </div>
);

export default function AuthSplitLayout({ children, logo, image, taglineText, logoText = 'Qindred' }) {
  return (
    <div className="auth-split-layout">
      {/* Image Panel (shows differently on mobile) */}
      <div className="auth-split-layout__panel auth-split-layout__panel--image">
        {/* Desktop version */}
        <div className="desktop-only">
          <Link href={route('home')} className="auth-logo qindred-logo">
            <AppLogoIcon variant="auth" className="qindred-logo-icon" />
            <span className="qindred-logo-text">{logoText}</span>
          </Link>
          {image && <img src={image} alt="Family Tree Illustration" className="auth-image" />}
          <h1 className="auth-heading">Build & Explore Your Family Tree</h1>
          <h2 className="auth-tagline-title">Easily add family members, link relatives, and explore your lineage in a beautifully designed family tree.</h2>
          <p className="auth-tagline-text">{taglineText}</p>
        </div>
        
        {/* Mobile version - Wrapped in white container */}
        <div className="mobile-only">
          <div className="mobile-header-container">
            <Link href={route('home')} className="auth-mobile-logo">
              <img src={logo} alt="Qindred Logo" className="auth-mobile-logo-img" />
              <span className="auth-mobile-logo-text">Qindred</span>
            </Link>
            <p className="auth-mobile-tagline">
              Build your family tree • Connect with relatives • Preserve memories
            </p>
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-split-layout__panel auth-split-layout__panel--form">
        {/* Form Content */}
        {children}
      </div>
    </div>
  );
}
