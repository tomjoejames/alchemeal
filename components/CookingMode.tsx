import React, { useState, useEffect } from 'react';
import { Recipe } from '../types';
import { GlassCard } from './GlassCard';
import { GlossyButton } from './GlossyButton';
import { X, Play, Pause, RotateCcw, ChevronRight, ChevronLeft, CheckCircle2, Volume2, VolumeX } from 'lucide-react';

interface CookingModeProps {
  recipe: Recipe;
  onClose: () => void;
}

export const CookingMode: React.FC<CookingModeProps> = ({ recipe, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [originalTime, setOriginalTime] = useState(0); // for progress bar
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  // Sound effect for timer completion
  const playAlarm = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = 'sine';
      // "Ding" sound effect
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.1); // C6
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1);
      
      osc.start();
      osc.stop(ctx.currentTime + 1);
    } catch (e) {
      console.error("Audio playback failed", e);
    }
  };

  // Voice Reader Effect
  useEffect(() => {
    // Check if browser supports speech synthesis
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    const synth = window.speechSynthesis;
    
    // Always cancel any existing speech before starting new speech or when disabled
    synth.cancel();

    if (isVoiceEnabled) {
      const textToSpeak = `Step ${currentStep + 1}. ${recipe.instructions[currentStep]}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.0; 
      utterance.pitch = 1.0;
      synth.speak(utterance);
    }

    // Cleanup: Stop speaking when component unmounts (closes) or dependencies change
    return () => {
      synth.cancel();
    };
  }, [currentStep, isVoiceEnabled, recipe.instructions]);

  // Helper to extract time from text (e.g., "cook for 5 mins")
  const parseTimeFromStep = (text: string): number => {
    const timeRegex = /(\d+)(?:-(\d+))?\s*(min|minute|sec|second)s?/i;
    const match = text.match(timeRegex);
    if (match) {
      const val = parseInt(match[1]);
      const unit = match[3].toLowerCase();
      // If it says "1-2 mins", take the higher value for safety, or average? Let's take lower to check. 
      return unit.startsWith('min') ? val * 60 : val;
    }
    return 0;
  };

  // When step changes, reset and check for time
  useEffect(() => {
    const detectedTime = parseTimeFromStep(recipe.instructions[currentStep]);
    setTimeLeft(detectedTime);
    setOriginalTime(detectedTime);
    setIsActive(false);
    setIsFinished(false);
  }, [currentStep, recipe]);

  // Timer logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            playAlarm();
            setIsActive(false);
            setIsFinished(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Auto-advance logic
  useEffect(() => {
    let timeoutId: any;
    if (isFinished && currentStep < recipe.instructions.length - 1) {
      timeoutId = setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
      }, 5000); // Wait 5 seconds before advancing
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isFinished, currentStep, recipe.instructions.length]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = originalTime > 0 ? ((originalTime - timeLeft) / originalTime) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center sm:p-2 md:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-white/40 dark:bg-black/80 backdrop-blur-xl transition-all duration-500" 
        onClick={onClose}
      />

      {/* Reduced width: w-[95%] on mobile, max-w-xl on desktop */}
      <GlassCard className="w-[95%] max-w-xl relative animate-in slide-in-from-bottom-5 md:zoom-in-95 duration-300 border-t md:border-2 border-white/80 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col h-[90dvh] md:h-auto md:max-h-[90vh] rounded-[24px]">
        {/* Header */}
        <div className="flex justify-between items-center mb-2 md:mb-6 border-b border-black/5 dark:border-white/10 pb-2 md:pb-4 flex-shrink-0">
          <div className="flex items-center gap-2 md:gap-3">
             <span className="text-2xl md:text-4xl animate-fade-slide" key={`emoji-${currentStep}`}>{recipe.emoji}</span>
             <div>
                <h3 className="text-base md:text-2xl font-extrabold text-[#1e3c72] dark:text-sky-100 font-['Varela_Round']">Cooking Mode</h3>
                <p key={`step-${currentStep}`} className="text-slate-500 dark:text-slate-400 text-[10px] md:text-sm font-bold animate-fade-slide">Step {currentStep + 1}/{recipe.instructions.length}</p>
             </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            <button 
                onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
                className={`p-1.5 md:p-2 rounded-full transition-all duration-300 ${isVoiceEnabled ? 'bg-amber-400 dark:bg-sky-600 text-white shadow-[0_0_15px_rgba(251,191,36,0.5)] dark:shadow-[0_0_15px_rgba(33,147,176,0.5)]' : 'hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-300'}`}
                title="Voice Reader"
            >
                {isVoiceEnabled ? <Volume2 size={18} className="animate-pulse md:w-6 md:h-6" /> : <VolumeX size={18} className="md:w-6 md:h-6" />}
            </button>
            <button 
                onClick={onClose}
                className="p-1.5 md:p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-300"
            >
                <X size={18} className="md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* Main Step Content */}
        <div className="flex-1 overflow-y-auto mb-2 md:mb-8 flex flex-col items-center p-1 md:p-4 text-center justify-center md:justify-start">
           <h2 
             key={currentStep}
             className="text-lg md:text-4xl font-bold text-[#2c3e50] dark:text-white leading-relaxed mb-4 md:mb-8 drop-shadow-sm transition-all duration-300 animate-fade-slide px-1"
           >
             {recipe.instructions[currentStep]}
           </h2>

           {/* Timer Section */}
           {(originalTime > 0 || timeLeft > 0) ? (
             <div className={`
                w-full max-w-md bg-white/50 dark:bg-slate-900/40 rounded-3xl p-3 md:p-6 border transition-all duration-500 mb-2 relative overflow-hidden group mt-auto md:mt-0 animate-fade-slide
                ${isActive && timeLeft < 10 ? 'border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)]' : ''}
                ${isActive && timeLeft >= 10 ? 'border-amber-300/50 dark:border-sky-300/50 shadow-[0_0_20px_rgba(251,191,36,0.2)] dark:shadow-[0_0_20px_rgba(56,189,248,0.2)]' : 'border-white dark:border-white/10 shadow-inner'}
             `}>
                
                {/* Critical State Pulsing Background Overlay */}
                {isActive && timeLeft < 10 && (
                    <>
                        <div className="absolute inset-0 bg-rose-500/10 animate-pulse z-0 pointer-events-none" />
                        <div className="absolute inset-0 rounded-3xl border-4 border-rose-400/50 animate-pulse z-20 pointer-events-none" />
                    </>
                )}

                {/* Progress Bar Background */}
                <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 z-0" />
                {/* Active Progress Liquid */}
                <div 
                  className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ease-linear z-0 opacity-20
                  ${isActive && timeLeft < 10 ? 'bg-gradient-to-r from-rose-500 to-orange-500' : 'bg-gradient-to-r from-amber-400 to-orange-500 dark:from-sky-600 dark:to-cyan-600'}
                  `}
                  style={{ width: `${progress}%` }}
                />

                <div className="relative z-10 flex flex-col items-center">
                    <div className={`
                        text-5xl md:text-7xl font-mono font-bold tracking-tighter mb-2 md:mb-4 transition-all duration-300
                        ${isActive && timeLeft < 10 ? 'text-rose-600 drop-shadow-[0_0_20px_rgba(244,63,94,0.6)] scale-110' : ''}
                        ${isActive && timeLeft >= 10 ? 'text-amber-500 dark:text-cyan-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.2)] dark:drop-shadow-[0_0_10px_rgba(33,147,176,0.2)] scale-105' : 'text-[#1e3c72] dark:text-sky-200'}
                    `}>
                        {formatTime(timeLeft)}
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={() => setIsActive(!isActive)}
                            className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-white dark:bg-white/10 shadow-lg border border-white/50 dark:border-white/20 text-amber-500 dark:text-cyan-300 hover:scale-110 transition-transform active:scale-95"
                        >
                            {isActive ? <Pause fill="currentColor" size={18} /> : <Play fill="currentColor" size={18} className="ml-0.5"/>}
                        </button>
                        <button 
                            onClick={() => {
                                setIsActive(false);
                                setTimeLeft(originalTime);
                                setIsFinished(false);
                            }}
                            className="w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center bg-white dark:bg-white/10 shadow-lg border border-white/50 dark:border-white/20 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:scale-110 transition-transform active:scale-95"
                        >
                            <RotateCcw size={18} />
                        </button>
                    </div>
                    
                    {isFinished && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm z-20 animate-in fade-in zoom-in">
                             <div className="text-emerald-500 flex flex-col items-center gap-2">
                                <CheckCircle2 size={32} className="md:w-12 md:h-12" />
                                <span className="font-bold text-base md:text-xl">Time's Up!</span>
                                <button onClick={() => setIsFinished(false)} className="text-xs md:text-sm underline text-slate-400 dark:text-slate-500 hover:text-slate-600 mt-1">Dismiss</button>
                             </div>
                        </div>
                    )}
                </div>
             </div>
           ) : (
             <div className="text-slate-400 dark:text-slate-500 font-medium italic bg-white/30 dark:bg-white/5 px-4 md:px-6 py-2 rounded-full border border-white/40 dark:border-white/10 mb-4 mt-auto md:mt-0 text-xs md:text-base animate-fade-slide">
                No timer needed.
             </div>
           )}
        </div>

        {/* Footer Navigation */}
        <div className="flex justify-between items-center mt-auto pt-2 md:pt-4 border-t border-white/50 dark:border-white/10 gap-2 flex-shrink-0">
           {/* Mobile: Icon only for Prev. Desktop: Full button */}
           <GlossyButton 
             variant="secondary"
             onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
             disabled={currentStep === 0}
             className="flex-shrink md:flex-none md:w-32 text-sm min-w-[50px]"
           >
             <div className="flex items-center justify-center gap-1">
                <ChevronLeft size={16} className="md:w-[18px] md:h-[18px]"/> 
                <span className="hidden md:inline">Prev</span>
             </div>
           </GlossyButton>

           <div className="flex gap-1 md:gap-2 overflow-x-auto max-w-[50%] justify-center px-1">
             {recipe.instructions.map((_, idx) => (
                <div 
                    key={idx} 
                    className={`h-1.5 md:h-2 rounded-full transition-all duration-300 flex-shrink-0 ${idx === currentStep ? 'w-4 md:w-8 bg-amber-400 dark:bg-cyan-500 animate-scale-pulse' : 'w-1.5 md:w-2 bg-slate-300 dark:bg-slate-700'}`} 
                />
             ))}
           </div>

           <GlossyButton 
             variant="primary"
             onClick={() => {
                 if (currentStep < recipe.instructions.length - 1) {
                     setCurrentStep(currentStep + 1);
                 } else {
                     onClose();
                 }
             }}
             className="flex-1 md:flex-none md:w-32 text-sm"
           >
             <div className="flex items-center justify-center gap-1">
                <span className="md:hidden">{currentStep === recipe.instructions.length - 1 ? 'Finish' : 'Next'}</span>
                <span className="hidden md:inline">{currentStep === recipe.instructions.length - 1 ? 'Finish' : 'Next'}</span> 
                <ChevronRight size={16} className="md:w-[18px] md:h-[18px]"/>
             </div>
           </GlossyButton>
        </div>
      </GlassCard>
    </div>
  );
};