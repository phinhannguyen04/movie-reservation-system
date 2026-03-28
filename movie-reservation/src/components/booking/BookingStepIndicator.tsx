import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookingStepIndicatorProps {
  currentStep: number;
}

export function BookingStepIndicator({ currentStep }: BookingStepIndicatorProps) {
  const steps = [
    { num: 1, label: 'Showtime' }, 
    { num: 2, label: 'Seats' },
    { num: 3, label: 'Payment' }, 
    { num: 4, label: 'Ticket' }
  ];

  return (
    <div className="flex items-center justify-between max-w-3xl mx-auto relative mb-8">
      <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-white/5 -z-10" />
      <div 
        className="absolute left-0 top-1/2 h-0.5 bg-primary -z-10 transition-all duration-500"
        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
      />
      {steps.map((s) => (
        <div key={s.num} className="flex flex-col items-center gap-2 bg-background px-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300",
            currentStep >= s.num ? "bg-primary text-white" : "bg-white/5 text-gray-500",
            currentStep === s.num && "ring-4 ring-primary/20"
          )}>
            {currentStep > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
          </div>
          <span className={cn("text-xs font-medium hidden sm:block", currentStep >= s.num ? "text-white" : "text-gray-500")}>
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
}
