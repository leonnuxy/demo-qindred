import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import AppLogoIcon from './app-logo-icon';
import { Link } from '@inertiajs/react';

export function AppSidebarHeader({ breadcrumbs = [] }) {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

    return (<header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-4">
                <SidebarTrigger className="-ml-1"/>
                
                {/* Show the app name in the header when sidebar is collapsed (desktop only) */}
                {isCollapsed && (
                    <div className="hidden md:flex items-center">
                        <Link href="/dashboard" className="flex items-center space-x-2">
                            <span className="font-semibold text-lg">Qindred</span>
                        </Link>
                    </div>
                )}
                
                <Breadcrumbs breadcrumbs={breadcrumbs}/>
            </div>
        </header>);
}
