import React from 'react';
import { UserAvatar } from '@/components/ui/UserAvatar';
import { cn } from '@/lib/utils';

interface UserBadgeProps {
  name: string;
  avatar?: string | null;
  role?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showRole?: boolean;
}

export function UserBadge({ 
  name, 
  avatar, 
  role = 'SYSTEM USER', 
  size = 'md', 
  className,
  showRole = true 
}: UserBadgeProps) {
  const sizeMap = {
    sm: { avatar: 'sm' as const, name: 'text-xs', role: 'text-[8px]' },
    md: { avatar: 'md' as const, name: 'text-sm', role: 'text-[9px]' },
    lg: { avatar: 'lg' as const, name: 'text-base', role: 'text-[10px]' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <UserAvatar 
        name={name} 
        avatar={avatar} 
        size={currentSize.avatar} 
        className="rounded-xl border border-white/10 shadow-lg"
      />
      <div className="flex flex-col min-w-0">
        <span className={cn(
          "font-black text-white tracking-widest leading-none truncate",
          currentSize.name
        )}>
          {name.toLowerCase()}
        </span>
        {showRole && (
          <span className={cn(
            "font-black text-gray-600 uppercase tracking-[0.25em] mt-1.5 leading-none",
            currentSize.role
          )}>
            {role.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
