import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  title: string;
  icon?: LucideIcon;
  viewAllLink?: string;
  className?: string;
}

export function SectionHeader({ title, icon: Icon, viewAllLink, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-8", className)}>
      <h2 className="text-2xl md:text-3xl font-display font-bold flex items-center gap-2 text-white">
        {Icon && <Icon className="w-6 h-6 text-primary" />}
        {title}
      </h2>
      {viewAllLink && (
        <Link 
          to={viewAllLink} 
          className="text-primary hover:text-primary-hover font-medium flex items-center gap-1 transition-colors text-sm md:text-base border-b border-primary/20 hover:border-primary"
        >
          View All
        </Link>
      )}
    </div>
  );
}
