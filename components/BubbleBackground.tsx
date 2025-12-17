import React from 'react';

export const BubbleBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 
        AeroTaste Principle: "Morning Light" vs "Midnight Aurora"
        Strategy: Multi-stop gradient with animation
      */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,_#1083D3_0%,_#D3E8F5_25%,_#FFB014_50%,_#FF3B30_75%,_#A31F6A_100%)] dark:bg-[linear-gradient(180deg,_#0f2027_0%,_#203a43_50%,_#2c5364_100%)] opacity-90 transition-all duration-700 animate-gradient-xy bg-[length:200%_200%]" />
      
      {/* Aurora Blurs for "Softness" */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[100px] transition-colors duration-700 animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-sky-300/30 dark:bg-cyan-900/20 rounded-full blur-[120px] transition-colors duration-700 animate-pulse" style={{ animationDelay: '2s' }} />
      
      {/* Floating Glass Orbs - "Viscosity" */}
      <div className="absolute top-[15%] left-[10%] w-32 h-32 rounded-full bg-gradient-to-b from-white/40 to-transparent dark:from-white/10 dark:to-transparent backdrop-blur-sm border border-white/50 dark:border-white/20 shadow-[0_8px_32px_rgba(255,255,255,0.3)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] animate-float-slow transition-all duration-700" />
      <div className="absolute top-[60%] right-[15%] w-20 h-20 rounded-full bg-gradient-to-b from-white/30 to-transparent dark:from-white/10 dark:to-transparent backdrop-blur-md border border-white/40 dark:border-white/20 shadow-lg animate-float-medium transition-all duration-700" />
      <div className="absolute bottom-[20%] left-[30%] w-40 h-40 rounded-full bg-gradient-to-b from-white/20 to-transparent dark:from-white/5 dark:to-transparent backdrop-blur-sm border border-white/30 dark:border-white/10 animate-float-fast transition-all duration-700" />
      
      {/* Sunbeams */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.6),_transparent_50%)] dark:bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_50%)] pointer-events-none transition-all duration-700" />
    </div>
  );
};