import React, { useState, useEffect } from 'react';
import { GlassCard } from './GlassCard';

interface PreloaderProps {
  onFinish: () => void;
}

const FOOD_EMOJIS = ['🍳', '🥗', '🥘', '🍝', '🍜', '🍱', '🍛', '🍣', '🍤', '🧁', '🍕', '🌮', '🥑', '🥞'];

const TIPS = [
  "Sharp knives are actually safer than dull ones.",
  "Let your meat rest before slicing to keep it juicy.",
  "Taste as you go—it's the only way to perfect seasoning.",
  "Prep ingredients before you start cooking (Mise en place).",
  "Don't overcrowd the pan if you want a good sear.",
  "Salt pasta water until it tastes like the sea.",
  "Recipes are guides, not strict rules. Experiment!",
  "A dull knife is a chef's worst enemy.",
  "Clean as you go to keep your mind clear.",
  "Garlic burns easily; add it late in the sauté."
];

export const Preloader: React.FC<PreloaderProps> = ({ onFinish }) => {
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const [currentTip, setCurrentTip] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Pick a random tip on mount
    setCurrentTip(Math.floor(Math.random() * TIPS.length));

    // Cycle emojis
    const emojiInterval = setInterval(() => {
        setCurrentEmoji(prev => (prev + 1) % FOOD_EMOJIS.length);
    }, 400);

    // Smooth progress bar simulation
    const totalTime = 3000; // 3 seconds load time
    const intervalTime = 30;
    const steps = totalTime / intervalTime;
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + (100 / steps);
      });
    }, intervalTime);

    // Finish callback
    const timeout = setTimeout(() => {
      onFinish();
    }, totalTime + 500); // Slight buffer for "100%" visual

    return () => {
      clearInterval(emojiInterval);
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/30 dark:bg-slate-900/50 backdrop-blur-xl transition-all duration-700 animate-in fade-in">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-amber-400/20 dark:bg-sky-600/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-orange-400/20 dark:bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <GlassCard className="w-[90%] max-w-sm flex flex-col items-center justify-center py-12 px-6 text-center shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/60 dark:border-white/10">
          
          {/* Animated Emoji */}
          <div className="relative mb-8">
             <div className="absolute inset-0 bg-amber-400/30 dark:bg-sky-500/30 blur-2xl rounded-full scale-150 animate-pulse" />
             <div className="text-8xl relative z-10 animate-bounce drop-shadow-xl filter transition-all duration-300 transform">
                {FOOD_EMOJIS[currentEmoji]}
             </div>
          </div>

          <h2 className="text-4xl font-extrabold text-[#1e3c72] dark:text-sky-100 mb-2 font-['Varela_Round'] tracking-tight drop-shadow-sm">
            Alchemeal
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-[0.2em] text-xs uppercase mb-10">
            Initializing Kitchen...
          </p>

          {/* Glossy Progress Bar */}
          <div className="w-full h-4 bg-slate-200/50 dark:bg-slate-800/50 rounded-full overflow-hidden mb-8 relative shadow-inner border border-white/60 dark:border-white/10 backdrop-blur-sm">
             <div 
               className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 dark:from-sky-500 dark:via-blue-500 dark:to-cyan-500 transition-all ease-linear shadow-[0_0_15px_rgba(251,191,36,0.5)] dark:shadow-[0_0_15px_rgba(14,165,233,0.5)]"
               style={{ width: `${progress}%` }} 
             />
             {/* Gel Shine on Bar */}
             <div className="absolute top-0 left-0 w-full h-1/2 bg-white/40 pointer-events-none" />
             
             {/* Shimmer Effect moving across bar */}
             <div className="absolute top-0 bottom-0 w-full animate-shine bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ transform: 'skewX(-20deg)' }} />
          </div>

          {/* Tip Card */}
          <div className="min-h-[80px] w-full flex items-center justify-center bg-white/40 dark:bg-white/5 rounded-xl p-4 border border-white/50 dark:border-white/5 shadow-sm">
             <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 italic animate-fade-slide leading-relaxed">
                <span className="text-amber-500 dark:text-sky-400 not-italic mr-2">💡 Tip:</span> 
                "{TIPS[currentTip]}"
             </p>
          </div>
      </GlassCard>
    </div>
  );
};