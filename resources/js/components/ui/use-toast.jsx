// resources/js/components/ui/use-toast.jsx
import { useState, useEffect } from 'react';
import toast, { Toaster as HotToaster } from 'react-hot-toast';

// Configuration options for toast
const DEFAULT_TOAST_DURATION = 5000; // 5 seconds

/**
 * Custom toast hook that wraps react-hot-toast for consistent usage across the app
 */
export function useToast() {
  return {
    /**
     * Show a success toast notification
     * @param {string} message - The message to display
     * @param {Object} options - Optional configuration options
     */
    success: (message, options = {}) => {
      toast.success(message, {
        duration: DEFAULT_TOAST_DURATION,
        position: 'top-right',
        ...options,
      });
    },

    /**
     * Show an error toast notification
     * @param {string} message - The message to display
     * @param {Object} options - Optional configuration options
     */
    error: (message, options = {}) => {
      toast.error(message, {
        duration: DEFAULT_TOAST_DURATION,
        position: 'top-right',
        ...options,
      });
    },

    /**
     * Show a standard toast notification
     * @param {Object} props - Toast properties
     * @param {string} props.title - Optional title for the toast
     * @param {string} props.description - Main content of the toast
     * @param {string} props.variant - Optional variant ('default', 'destructive', etc.)
     * @param {Object} options - Optional configuration options
     */
    toast: ({ title, description, variant = 'default' }, options = {}) => {
      const content = title ? `${title}${description ? ': ' + description : ''}` : description;
      
      if (variant === 'destructive') {
        toast.error(content, {
          duration: DEFAULT_TOAST_DURATION,
          position: 'top-right',
          ...options,
        });
      } else {
        toast(content, {
          duration: DEFAULT_TOAST_DURATION,
          position: 'top-right',
          ...options,
        });
      }
    },

    // Direct export of toast functions from react-hot-toast
    dismiss: toast.dismiss,
    promise: toast.promise,
    loading: toast.loading,
    custom: toast,
  };
}

/**
 * Toast container component
 */
export function Toaster() {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        className: 'toast-notification',
        duration: DEFAULT_TOAST_DURATION,
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '6px',
          padding: '12px 16px',
          fontSize: '14px',
        },
        success: {
          style: {
            borderLeft: '4px solid var(--success, #10b981)',
          },
          iconTheme: {
            primary: '#10b981',
            secondary: 'white',
          },
        },
        error: {
          style: {
            borderLeft: '4px solid var(--destructive, #ef4444)',
          },
          iconTheme: {
            primary: '#ef4444',
            secondary: 'white',
          },
        },
      }}
    />
  );
}

// Default export for simple import
export default { useToast, Toaster };
