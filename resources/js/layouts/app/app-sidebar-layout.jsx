import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { AppFloatingHeader } from '@/components/app-floating-header';
import { AppFooter } from '@/components/app-footer';
import { SidebarInset } from '@/components/ui/sidebar';

export default function AppSidebarLayout({ children, breadcrumbs = [] }) {
    return (<AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar">
                <AppSidebarHeader breadcrumbs={breadcrumbs}/>
                <SidebarInset className="relative">
                    <AppFloatingHeader className="floating-header" />
                    <div className="pt-16 flex flex-col min-h-[calc(100vh-4rem)]">
                        <div className="flex-1 pb-4">
                            {children}
                        </div>
                        <AppFooter />
                    </div>
                </SidebarInset>
            </AppContent>
        </AppShell>);
}
