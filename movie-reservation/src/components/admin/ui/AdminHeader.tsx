import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface AdminHeaderProps {
  title: string;
  description: string;
  category?: string;
  actions?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function AdminHeader({ 
  title, 
  description, 
  category = "System Node", 
  actions, 
  icon: Icon,
  className 
}: AdminHeaderProps) {
  return (
    <div className={cn("flex flex-col xl:flex-row xl:items-center justify-between gap-8 pt-4 mb-10", className)}>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="space-y-2"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="px-2 py-1 bg-primary/20 text-primary rounded-md text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
            {category}
          </div>
          <div className="h-1 w-1 rounded-full bg-primary animate-pulse"></div>
        </div>
        <div className="flex items-center gap-4">
          {Icon && (
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 shadow-xl shadow-black/20">
              <Icon className="w-6 h-6 text-primary" />
            </div>
          )}
          <h1 className="text-5xl font-display font-black text-white tracking-tighter">
            {title}
          </h1>
        </div>
        <p className="text-gray-500 max-w-xl font-medium leading-relaxed">
          {description}
        </p>
      </motion.div>
      
      {actions && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-4"
        >
          {actions}
        </motion.div>
      )}
    </div>
  );
}
