import { Search, Bell, Settings } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
    DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { useScrollHeader } from '@/hooks/useScrollHeader';
import { useSidebar } from '@/components/ui/sidebar';
import { usePage, Link } from '@inertiajs/react';
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

    // Sample notifications with more realistic Qindred content
    const notifications = [
        {
            id: 1,
            title: 'New Family Connection',
            message: 'Sarah Johnson has accepted your invitation to connect.',
            time: '2 hours ago',
            type: 'connection',
            unread: true
        },
        {
            id: 2,
            title: 'Birthday Reminder',
            message: 'James Williams\' birthday is coming up next week.',
            time: '1 day ago',
            type: 'reminder',
            unread: true
        },
        {
            id: 3,
            title: 'New Document Shared',
            message: 'Elizabeth Brown shared a family photo album with you.',
            time: '3 days ago',
            type: 'document',
            unread: false
        },
        {
            id: 4,
            title: 'Tree Update',
            message: 'Your family tree "Smith Family" has been updated.',
            time: '1 week ago',
            type: 'update',
            unread: false
        }
    ];

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <header
            className={cn(
                'floating-header',
                { scrolled: isScrolled },
                { hidden: !isVisible },
                { 'sidebar-collapsed': isCollapsed },
                { 'sidebar-expanded': !isCollapsed },
                isMobile ? 'mobile-header' : 'desktop-header',
                className
            )}
        >
            <div className="floating-header-content">
                {/* Search - hidden on mobile, visible on desktop */}
                <div className="search-wrapper desktop-search hidden md:flex">
                    <Search className="search-icon" />
                    <Input
                        type="search"
                        placeholder="Search family trees, members, documents..."
                        className="search-input"
                    />
                </div>

                {/* Actions */}
                <div className="actions ml-auto md:ml-0">
                    {/* Quick Settings - Desktop only */}
                    {!isMobile && (
                        <Button
                            variant="outline"
                            size="icon"
                            className="action-button"
                            asChild
                        >
                            <Link href="/settings">
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Settings</span>
                            </Link>
                        </Button>
                    )}

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size={isMobile ? "sm" : "icon"}
                                className="notification-trigger relative"
                            >
                                <Bell className={cn(isMobile ? "h-4 w-4" : "h-4 w-4")} />
                                {unreadCount > 0 && (
                                    <Badge className="notification-badge absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </Badge>
                                )}
                                <span className="sr-only">
                                    Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
                                </span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            align="end"
                            className="notifications-content w-80"
                            side={isMobile ? "bottom" : "bottom"}
                            sideOffset={8}
                        >
                            <DropdownMenuLabel className="flex items-center justify-between">
                                <span>Notifications</span>
                                {unreadCount > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                        {unreadCount} new
                                    </Badge>
                                )}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <div className="max-h-96 overflow-y-auto">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <DropdownMenuItem
                                            key={notification.id}
                                            className={cn(
                                                "flex flex-col items-start p-4 cursor-pointer",
                                                notification.unread && "bg-qindred-green-50/50"
                                            )}
                                        >
                                            <div className="flex w-full justify-between items-start">
                                                <div className="flex items-center gap-2">
                                                    <p className="text-sm font-semibold">
                                                        {notification.title}
                                                    </p>
                                                    {notification.unread && (
                                                        <div className="h-2 w-2 bg-qindred-green-500 rounded-full" />
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground">
                                                    {notification.time}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {notification.message}
                                            </p>
                                        </DropdownMenuItem>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        No notifications
                                    </div>
                                )}
                            </div>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/notifications" className="w-full text-center">
                                    View all notifications
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* User Profile */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                className="profile-trigger h-9 w-9 rounded-full p-0"
                            >
                                <Avatar className="h-7 w-7">
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
                                    <AvatarFallback className="bg-qindred-green-100 text-qindred-green-800 font-semibold text-xs">
                                        {auth?.user?.name
                                            ? getInitials(auth.user.name)
                                            : 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="sr-only">User menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="profile-menu w-56"
                            align="end"
                            side={isMobile ? "bottom" : "bottom"}
                            sideOffset={8}
                        >
                            <UserMenuContent user={auth?.user} />
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
