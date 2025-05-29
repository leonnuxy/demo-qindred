import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { Link, usePage } from '@inertiajs/react';
import { LayoutGrid, Users, Mail, Network, Menu, Settings, HelpCircle } from 'lucide-react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';
import '@css/header.css';

// Helper function to create route URL safely
const route = (name, params = {}) => {
    const routes = {
        'dashboard': '/dashboard',
        'family-trees': '/family-trees',
        'forest': '/forest',
        'invitations.index': '/invitations',
        'settings': '/settings',
        'help': '/help',
    };
    return routes[name] || '/';
};

// Main Qindred navigation items
const mainNavItems = [
    {
        title: 'Dashboard',
        href: route('dashboard'),
        icon: LayoutGrid,
        component: 'Dashboard'
    },
    {
        title: 'Family Trees',
        href: route('family-trees'),
        icon: Network,
        component: 'FamilyTrees/'
    },
    {
        title: 'Forest',
        href: route('forest'),
        icon: Users,
        component: 'Forest/Index'
    },
    {
        title: 'Invitations',
        href: route('invitations.index'),
        icon: Mail,
        component: 'User/InvitationsPage'
    }
];

// Secondary navigation items
const rightNavItems = [
    {
        title: 'Settings',
        href: route('settings'),
        icon: Settings,
    },
    {
        title: 'Help & Support',
        href: route('help'),
        icon: HelpCircle,
    },
];

export function AppHeader({ breadcrumbs = [] }) {
    const page = usePage();
    const { auth } = page.props;
    const { component: currentComponent = '', url: currentUrl = '' } = page;
    const getInitials = useInitials();

    // Check if navigation item is active
    const isItemActive = (item) => {
        if (item.component) {
            if (item.exact === true && currentComponent === item.component) {
                return true;
            }
            if (!item.exact && currentComponent.startsWith(item.component)) {
                return true;
            }
        }
        return item.href === currentUrl;
    };

    const activeItemStyles = 'bg-qindred-green-100 text-qindred-green-800 font-semibold border border-qindred-green-400/30 shadow-sm';

    return (
        <>
            <div className="app-header border-sidebar-border/80 border-b bg-background/95 backdrop-blur-md">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="mr-3 h-9 w-9 hover:bg-qindred-green-50 hover:text-qindred-green-700 transition-colors"
                                >
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent 
                                side="left" 
                                className="bg-sidebar/95 backdrop-blur-md flex h-full w-72 flex-col border-sidebar-border/80"
                            >
                                <SheetTitle className="sr-only">Qindred Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left p-6 border-b border-sidebar-border/50">
                                    <div className="flex items-center gap-3">
                                        <AppLogoIcon variant="header" className="h-8 w-8" />
                                        <span className="font-bold text-xl text-foreground">Qindred</span>
                                    </div>
                                </SheetHeader>
                                <div className="flex h-full flex-1 flex-col p-4">
                                    <div className="flex h-full flex-col justify-between">
                                        <div className="flex flex-col space-y-2">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                                Main Navigation
                                            </h3>
                                            {mainNavItems.map((item) => (
                                                <Link 
                                                    key={item.title} 
                                                    href={item.href} 
                                                    className={cn(
                                                        "flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-qindred-green-50 hover:text-qindred-green-700",
                                                        isItemActive(item) && "bg-qindred-green-100 text-qindred-green-800 border border-qindred-green-400/30"
                                                    )}
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="border-t border-sidebar-border/50 pt-4">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                                                Quick Actions
                                            </h3>
                                            <div className="flex flex-col space-y-2">
                                                {rightNavItems.map((item) => (
                                                    <Link 
                                                        key={item.title} 
                                                        href={item.href} 
                                                        className="flex items-center space-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground"
                                                    >
                                                        {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                        <span>{item.title}</span>
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    {/* Logo */}
                    <Link href="/dashboard" prefetch className="flex items-center hover:opacity-80 transition-opacity">
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-8 hidden h-full items-center space-x-1 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-1">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem key={index} className="relative flex h-full items-center">
                                        <Link 
                                            href={item.href} 
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                "h-10 px-4 rounded-lg transition-all hover:bg-qindred-green-50 hover:text-qindred-green-700",
                                                isItemActive(item) && activeItemStyles
                                            )}
                                        >
                                            {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                            {item.title}
                                        </Link>
                                        {isItemActive(item) && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-qindred-green-700 rounded-t-sm"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
                    </div>

                    {/* Right Side Actions */}
                    <div className="ml-auto flex items-center space-x-2">
                        <div className="hidden lg:flex items-center space-x-1">
                            {rightNavItems.map((item) => (
                                <TooltipProvider key={item.title} delayDuration={0}>
                                    <Tooltip>
                                        <TooltipTrigger>
                                            <Link 
                                                href={item.href} 
                                                className="group inline-flex h-9 w-9 items-center justify-center rounded-lg bg-transparent text-sm font-medium transition-all hover:bg-qindred-green-50 hover:text-qindred-green-700 focus-visible:ring-2 focus-visible:ring-qindred-green-400 focus-visible:ring-offset-2 focus-visible:outline-none"
                                            >
                                                <span className="sr-only">{item.title}</span>
                                                {item.icon && <Icon iconNode={item.icon} className="h-5 w-5 opacity-70 group-hover:opacity-100 transition-opacity" />}
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>{item.title}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>

                        {/* User Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="ghost" 
                                    className="h-10 w-10 rounded-full p-0 hover:ring-2 hover:ring-qindred-green-400/50 hover:ring-offset-2 transition-all"
                                >
                                    <Avatar className="h-8 w-8 overflow-hidden rounded-full border border-border/50">
                                        <AvatarImage 
                                            src={auth?.user?.avatar || auth?.user?.avatar_url} 
                                            alt={auth?.user?.name}
                                        />
                                        <AvatarFallback className="bg-qindred-green-100 text-qindred-green-800 font-semibold">
                                            {getInitials(auth?.user?.name || 'User')}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                                className="w-60 bg-background/95 backdrop-blur-md border border-border/80" 
                                align="end"
                            >
                                <UserMenuContent user={auth?.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs && breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b bg-background/50 backdrop-blur-sm">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-muted-foreground md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
