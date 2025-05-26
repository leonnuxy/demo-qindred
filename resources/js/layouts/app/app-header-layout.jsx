import { AppContent } from '@/components/app-content';
import { AppHeader } from '@/components/app-header';
import { AppFooter } from '@/components/app-footer';
import { AppShell } from '@/components/app-shell';
export default function AppHeaderLayout({ children, breadcrumbs }) {
    return (<AppShell>
            <AppHeader breadcrumbs={breadcrumbs}/>
            <AppContent className="flex flex-col min-h-[calc(100vh-4rem)]">
                <div className="flex-1 pb-4">{children}</div>
                <AppFooter />
            </AppContent>
        </AppShell>);
}
