import React from 'react';
import { cn } from '@/lib/utils';

export interface UserAvatarProps {
  name?: string;
  avatar?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function UserAvatar({ name = 'User', avatar, className, size = 'md' }: UserAvatarProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2) || '?';

  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-lg',
  };

  if (avatar) {
    return (
      <img 
        src={avatar} 
        alt={name} 
        className={cn(
          "rounded-full object-cover bg-surface border border-white/10 shrink-0",
          sizeClasses[size],
          className
        )} 
      />
    );
  }

  // Consistent background colors based on name hash
  const colors = [
    'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    'bg-amber-500/20 text-amber-400 border-amber-500/30',
    'bg-rose-500/20 text-rose-400 border-rose-500/30',
    'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  ];
  
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const colorClass = colors[colorIndex];

  return (
    <div className={cn(
      "rounded-full flex items-center justify-center font-black tracking-tighter border shadow-inner transition-transform hover:scale-105 shrink-0",
      sizeClasses[size],
      colorClass,
      className
    )}>
      {initials}
    </div>
  );
}
