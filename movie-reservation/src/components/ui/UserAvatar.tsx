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
          "rounded-2xl object-cover bg-surface border border-white/10 shrink-0",
          sizeClasses[size],
          className
        )} 
      />
    );
  }

  // Consistent background colors based on name hash
  const colors = [
    'bg-blue-500/10 text-blue-400 border-blue-500/20',
    'bg-purple-500/10 text-purple-400 border-purple-500/20',
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    'bg-white/5 text-gray-400 border-white/10',
  ];
  
  const colorIndex = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const colorClass = colors[colorIndex];

  return (
    <div className={cn(
      "rounded-2xl flex items-center justify-center font-black tracking-tighter border shadow-inner transition-transform hover:scale-105 shrink-0 uppercase",
      sizeClasses[size],
      colorClass,
      className
    )}>
      {initials}
    </div>
  );
}
