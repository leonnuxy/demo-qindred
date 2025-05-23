// resources/js/components/user-info.jsx

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

export function UserInfo({ user, showEmail = false }) {
  const getInitials = useInitials();

  // Build a safe “full name” string:
  const fullName = user?.name
    ? user.name
    : `${user?.first_name ?? ''} ${user?.last_name ?? ''}`.trim();

  const initials = getInitials(fullName);

  return (
    <div className="flex items-center space-x-2">
      <Avatar className="h-8 w-8 overflow-hidden rounded-full">
        {user?.avatar_path ? (
          <AvatarImage src={user.avatar_path} alt={fullName || 'User'} />
        ) : (
          <AvatarFallback className="bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
            {initials || '—'}
          </AvatarFallback>
        )}
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <span className="block truncate font-medium">
          {fullName || 'Unnamed'}
        </span>
        {showEmail && user?.email && (
          <span className="block truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        )}
      </div>
    </div>
  );
}
