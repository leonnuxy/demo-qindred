import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AppFloatingHeader } from '@/components/app-floating-header';
import { AppFooter } from '@/components/app-footer';
import { SidebarInset } from '@/components/ui/sidebar';

import '@css/layouts/app-sidebar-layout.css';

export default function AppSidebarLayout({ children, breadcrumbs = [] }) {
    return (<AppShell variant="sidebar" className="app-sidebar-layout">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs}/>
                <SidebarInset className="relative">
                    <AppFloatingHeader className="floating-header" />
                    <div className="app-sidebar-layout__content">
                        <div className="app-sidebar-layout__main">
                            {children}
                        </div>
                        <AppFooter />
                    </div>
                </SidebarInset>
            </AppContent>
        </AppShell>);
}
