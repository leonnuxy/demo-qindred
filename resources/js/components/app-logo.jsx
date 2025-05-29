import AppLogoIcon from './app-logo-icon';
import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state, isMobile } = useSidebar();
    const isCollapsed = state === "collapsed" && !isMobile;
    
    return (
        <div className="app-logo" style={{ backgroundColor: 'transparent' }}>
            <div className={`app-logo__icon-container ${isCollapsed ? 'app-logo__icon-container--collapsed' : 'app-logo__icon-container--expanded'}`}
                 style={{ backgroundColor: 'transparent' }}>
                <AppLogoIcon 
                    variant="sidebar" 
                    className={`app-logo__icon ${isCollapsed ? 'app-logo__icon--collapsed' : 'app-logo__icon--expanded'}`}
                />
            </div>
            <div className={`app-logo__text-container ${isCollapsed ? 'app-logo__text-container--collapsed' : 'app-logo__text-container--expanded'}`}>
                <span className="app-logo__text">
                    Qindred
                </span>
            </div>
        </div>
    );
}
