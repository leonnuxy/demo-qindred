import '@css/components/app-logo-icon.css';

export default function AppLogoIcon({ variant = 'auth', className, ...props }) {
    /**
     * Supports multiple variants:
     * - 'auth': Default, used in auth layouts (20% width)
     * - 'sidebar': Used in sidebar (100% width)
     * - 'header': Used in app header (fixed size)
     * 
     * Custom sizes can be applied via className (e.g., "size-5", "h-6 w-6")
     * which will override the default variant sizing.
     */
    
    // Determine which variant-specific class to use
    const variantClass = `app-logo-icon--${variant}`;
    
    return (
        <img 
            {...props}
            src="/assets/logo.png" 
            alt="Qindred Logo"
            className={`app-logo-icon ${variantClass} ${className || ''}`}
            style={{ ...props.style, backgroundColor: 'transparent' }}
        />
    );
}
