import React from 'react';

interface GlossyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const GlossyButton: React.FC<GlossyButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading,
  className = '',
  ...props 
}) => {
  
  const getVariantClasses = () => {
    switch (variant) {
      case 'secondary':
        // Light: Silver/Neutral (Secondary to Yellow)
        // Dark: Slate (Secondary to Blue)
        return `
          bg-gradient-to-b from-slate-100 to-slate-300
          shadow-[0_4px_15px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.8)]
          text-slate-600
          
          dark:from-slate-700 dark:to-slate-800 
          dark:shadow-[0_4px_15px_rgba(0,0,0,0.3),inset_0_1px_0_rgba(255,255,255,0.1)]
          dark:text-slate-200
        `;
      case 'danger':
        // Light: Bright Poppy Red -> Magenta
        // Dark: Deep Red
        return `
          bg-gradient-to-b from-[#FF3B30] to-[#A31F6A]
          shadow-[0_4px_15px_rgba(255,59,48,0.5),inset_0_1px_0_rgba(255,255,255,0.4)]
          text-white

          dark:from-red-900 dark:to-red-950 
          dark:shadow-[0_4px_15px_rgba(150,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
          dark:text-white
        `;
      case 'primary':
      default:
        // Light: Yellow/Orange Accent
        // Dark: Sky/Blue Accent
        return `
          bg-gradient-to-b from-[#FFB014] to-[#F59E0B]
          shadow-[0_4px_15px_rgba(255,176,20,0.5),inset_0_1px_0_rgba(255,255,255,0.4)]
          text-white

          dark:from-[#0EA5E9] dark:to-[#0284C7]
          dark:shadow-[0_4px_15px_rgba(14,165,233,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]
          dark:text-white
        `;
    }
  };

  return (
    <button 
      className={`relative h-[44px] md:h-[50px] rounded-xl border-none overflow-hidden transition-all duration-300 transform hover:scale-[1.03] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed group min-w-[120px] md:min-w-[140px] text-base ${getVariantClasses()} ${className}`}
      disabled={isLoading}
      {...props}
    >
      {/* Shine Effect */}
      <div className="absolute inset-0 -translate-x-[150%] skew-x-12 group-hover:animate-shine bg-gradient-to-r from-transparent via-white/40 to-transparent z-20 pointer-events-none" />

      {/* The Gel Lens (The "Wet" Look) */}
      <div 
        className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/50 to-white/10 pointer-events-none"
        style={{ borderRadius: '0 0 50% 50% / 0 0 20px 20px' }}
      />
      
      {/* Content */}
      <div className="relative z-30 flex items-center justify-center gap-2 font-bold px-6">
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 md:h-5 md:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        <span className="whitespace-nowrap" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.25)' }}>{children}</span>
      </div>
    </button>
  );
};