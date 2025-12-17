import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`
      relative group overflow-hidden
      bg-[rgba(255,255,255,0.65)] dark:bg-slate-900/60 backdrop-blur-[16px]
      border border-[rgba(255,255,255,0.9)] dark:border-slate-700/50
      rounded-[24px] md:rounded-[32px]
      shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.6)]
      p-6 md:p-8
      z-10
      transition-all duration-500 ease-out 
      hover:scale-[1.01] hover:shadow-[0_20px_40px_rgba(31,38,135,0.25)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.8)]
      ${className}
    `}>
      {/* Shine Effect Overlay */}
      <div className="absolute inset-0 -translate-x-[150%] skew-x-12 group-hover:animate-shine bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 z-0 pointer-events-none" />
      
      {/* Content wrapper to ensure z-index above shine */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};