import AppLogoIcon from './app-logo-icon';
import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";
    
    return (<>
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md transition-all duration-200">
                <AppLogoIcon 
                  variant="sidebar" 
                  className="size-5 fill-current text-white dark:text-black"
                />
            </div>
            <div className={`ml-1 grid flex-1 text-left text-sm transition-all duration-200 ${isCollapsed ? 'opacity-0 w-0 ml-0' : 'opacity-100 ml-2'}`}>
                <span
                    className="mb-0.5 truncate leading-none font-semibold"
                    style={{
                        fontSize: '1.35rem',
                        letterSpacing: '0.03em',
                        color: '#2d3748',
                        textShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    }}
                >
                    Qindred
                </span>
            </div>
        </>);
}

