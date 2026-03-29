import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  maxWidth?: string;
}

export function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className={cn(
              "relative bg-surface/90 backdrop-blur-3xl border border-white/10 rounded-[32px] w-full shadow-[0_50px_150px_rgba(0,0,0,0.8)] flex flex-col max-h-[92vh] overflow-hidden",
              maxWidth
            )}
          >
            <div className="flex items-center justify-between p-8 border-b border-white/10 bg-white/[0.02]">
              <h2 className="text-2xl font-display font-black text-white tracking-tighter uppercase">{title}</h2>
              <button
                onClick={onClose}
                className="w-12 h-12 flex items-center justify-center text-gray-400 hover:text-white rounded-2xl hover:bg-white/5 transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-10 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
