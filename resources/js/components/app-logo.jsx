import AppLogoIcon from './app-logo-icon';
import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state, isMobile } = useSidebar();
    const isCollapsed = state === "collapsed" && !isMobile;
    
    return (<>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-12 items-center justify-center rounded-md transition-all duration-200 hover:bg-sidebar-accent/80">
                <AppLogoIcon 
                  variant="sidebar" 
                  className="size-8 fill-current text-white dark:text-black"
                />
            </div>
            <div className={`transition-all duration-200 ${isCollapsed ? 'w-0 opacity-0' : 'opacity-100'}`}>
                <span
                    className="font-bold text-foreground dark:text-white text-[1.5rem] leading-none tracking-wide"
                >
                    Qindred
                </span>
            </div>
        </>);
}

