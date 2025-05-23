import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Users, UserRound, Mail, Settings, LayoutPanelTop } from 'lucide-react';
import { Network } from 'lucide-react';
import AppLogo from './app-logo';

// Helper function to create route URL safely
const route = (name, params = {}) => {
    // This is a simplified version - in a real app we would use the route() helper from Laravel
    // For now, we'll just hardcode some common routes
    const routes = {
        'dashboard': '/dashboard',
        'family-trees': '/family-trees',
        'forest': '/forest',
        'invitations.index': '/invitations',
    };
    
    return routes[name] || '/';
};

// Define main navigation items for the family tree app - similar to the provided navigationItems
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

const footerNavItems = [
    {
        title: 'Help & Support',
        href: '/help',
        icon: BookOpen,
    },
    {
        title: 'Documentation',
        href: '/docs',
        icon: Folder,
    },
];

export function AppSidebar() {
    const page = usePage();
    const { component } = page;
    
    // Add an active class to the correct navigation item
    const isActive = (navComponent) => {
        if (component === navComponent) return true;
        if (navComponent.endsWith('/') && component.startsWith(navComponent)) return true;
        return false;
    };

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                
                {/* For mobile view only */}
                <div className="md:hidden mt-4">
                    <SidebarGroup className="px-2 py-0">
                        <SidebarGroupLabel>Quick Access</SidebarGroupLabel>
                        <SidebarMenu>
                            {footerNavItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={{ children: item.title }}>
                                        <Link href={item.href}>
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </div>
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto hidden md:block" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
