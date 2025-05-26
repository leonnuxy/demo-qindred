import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useScrollHeader } from '@/hooks/useScrollHeader';
import { useSidebar } from '@/components/ui/sidebar';
import { usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import '@css/floating-header.css';

export function AppFloatingHeader({ className }) {
    const { props: { auth } } = usePage();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    const getInitials = useInitials();
    const isMobile = useIsMobile();
    const { isScrolled, isVisible } = useScrollHeader({
        scrollThreshold: 10,
        hideOnScroll: isMobile, // Only hide on scroll for mobile
    });

    return (
        <header
            className={cn(
                'floating-header',
                { scrolled: isScrolled },
                { hidden: !isVisible },
                { 'sidebar-collapsed': isCollapsed },
                { 'sidebar-expanded': !isCollapsed },
                className
            )}
        >
            <div className="floating-header-content">
                {/* Search - hidden on mobile, visible on desktop */}
                <div className="search-wrapper desktop-search hidden md:flex">
                    <Search className="search-icon" />
                    <Input
                        type="search"
                        placeholder="Search family trees, members..."
                        className="search-input"
                    />
                </div>

                <div className="actions ml-auto md:ml-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size={isMobile ? "sm" : "icon"}
                                className="notification-trigger relative"
                                style={{
                                    backgroundColor: 'hsl(var(--background) / 0.8)',
                                    backdropFilter: 'blur(8px)',
                                    borderColor: 'hsl(var(--border) / 0.4)',
                                    border: '1px solid hsl(var(--border) / 0.4)'
                                }}
                            >
                                <span className="inline-flex items-center">
                                    <Bell className={cn(isMobile ? "h-5 w-5" : "h-5 w-5")} />
                                    <Badge className="notification-badge">3</Badge>
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="notifications-content"
                            side={isMobile ? "bottom" : "right"}
                        >
                            <div className="flex flex-col space-y-2 p-2">
                                <h3 className="font-medium">Notifications</h3>
                                <div className="flex flex-col gap-2">
                                    <div className="rounded-md bg-muted p-3">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-semibold">New Family Connection</p>
                                            <span className="text-xs text-muted-foreground">2h ago</span>
                                        </div>
                                        <p className="text-sm">Sarah Johnson has accepted your invitation to connect.</p>
                                    </div>
                                    <div className="rounded-md bg-muted p-3">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-semibold">Birthday Reminder</p>
                                            <span className="text-xs text-muted-foreground">1d ago</span>
                                        </div>
                                        <p className="text-sm">James Williams' birthday is coming up next week.</p>
                                    </div>
                                    <div className="rounded-md bg-muted p-3">
                                        <div className="flex justify-between">
                                            <p className="text-sm font-semibold">New Document Shared</p>
                                            <span className="text-xs text-muted-foreground">3d ago</span>
                                        </div>
                                        <p className="text-sm">Elizabeth Brown shared a family photo album with you.</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full">View all notifications</Button>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="profile-trigger"
                                size={isMobile ? "sm" : "default"}
                                style={{
                                    backgroundColor: 'hsl(var(--background) / 0.8)',
                                    backdropFilter: 'blur(8px)',
                                    borderColor: 'hsl(var(--border) / 0.4)',
                                    border: '1px solid hsl(var(--border) / 0.4)',
                                    padding: '0.25rem',
                                    borderRadius: '9999px'
                                }}
                            >
                                <span className="inline-flex">
                                    <Avatar>
                                        <AvatarImage
                                            src={auth?.user?.avatar_url || auth?.user?.avatar || '/assets/avatar-placeholder.png'}
                                            alt={auth?.user?.name}
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.style.display = 'none';
                                                const fallback = e.target.parentElement.querySelector('[data-slot="avatar-fallback"]');
                                                if (fallback) {
                                                    fallback.style.display = 'flex';
                                                }
                                            }}
                                        />
                                        <AvatarFallback>
                                            {auth?.user?.name
                                                ? getInitials(auth.user.name)
                                                : 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="profile-menu"
                            align="end"
                            side={isMobile ? "bottom" : "right"}
                        >
                            <UserMenuContent user={auth?.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
