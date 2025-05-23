// resources/js/components/nav-main.jsx

import React from 'react';
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [] }) {
  const { component: currentComponent = '', url: currentUrl = '' } = usePage();

  /**
   * Returns true if this nav item should be marked "active"
   */
  const isItemActive = (item) => {
    // 1) If item.component is defined, match on that first
    if (item.component) {
      // Exact match
      if (item.exact === true && currentComponent === item.component) {
        return true;
      }
      // “Starts with” match for section headings
      if (!item.exact && currentComponent.startsWith(item.component)) {
        return true;
      }
    }

    // 2) Fallback: compare href to the current URL
    return item.href === currentUrl;
  };

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel>Qindred Menu</SidebarGroupLabel>

      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={isItemActive(item)}
              tooltip={{ children: item.title }}
              className="sidebar-menu-button"
            >
              <Link href={item.href} prefetch>
                {item.icon && <item.icon className="h-5 w-5" />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
