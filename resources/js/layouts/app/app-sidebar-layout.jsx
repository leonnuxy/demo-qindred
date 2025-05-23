import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AppFloatingHeader } from '@/components/app-floating-header';
import { SidebarInset } from '@/components/ui/sidebar';

export default function AppSidebarLayout({ children, breadcrumbs = [] }) {
    return (<AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs}/>
                <SidebarInset className="relative">
                    <AppFloatingHeader className="floating-header" />
                    <div className="pt-16">
                        {children}
                    </div>
                </SidebarInset>
            </AppContent>
        </AppShell>);
}
