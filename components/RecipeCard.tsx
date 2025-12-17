import React, { useState } from 'react';
import { Recipe } from '../types';
import { GlassCard } from './GlassCard';
import { GlossyButton } from './GlossyButton';
import { CookingMode } from './CookingMode';
import { Clock, Users, Flame, Save, RefreshCw, PlayCircle, IndianRupee } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onSave: () => void;
  onRegenerate: () => void;
  isSaving?: boolean;
  showNutrition?: boolean;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onSave, onRegenerate, isSaving, showNutrition = true }) => {
  const [isCooking, setIsCooking] = useState(false);

  return (
    <>
      <GlassCard className="w-full max-w-4xl mx-auto my-2 md:my-8 animate-float-slow transition-all duration-500 hover:shadow-[0_20px_40px_rgba(255,176,20,0.2)] dark:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
        
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-8 pt-2">
          <div className="relative inline-block group cursor-default">
              {/* Emoji Glow - Amber in Light, Sky in Dark */}
              <div className="absolute inset-0 bg-amber-400/30 dark:bg-sky-600/30 blur-3xl rounded-full scale-0 group-hover:scale-125 transition-transform duration-700" />
              <div className="text-6xl md:text-8xl mb-4 drop-shadow-xl transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 ease-out z-10 relative">
                  {recipe.emoji}
              </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e3c72] dark:text-sky-100 drop-shadow-sm mb-3 tracking-tight font-['Varela_Round'] leading-tight px-1">
            {recipe.title}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-medium text-base md:text-lg max-w-xl mx-auto leading-relaxed px-1">
            {recipe.description}
          </p>
        </div>

        {/* Meta Data Pills - Amber icons in Light, Sky in Dark */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4 mb-8">
          {[
              { icon: Clock, label: `Prep: ${recipe.prepTime}` },
              { icon: Flame, label: `Cook: ${recipe.cookTime}` },
              { icon: Users, label: `Serves ${recipe.servings}` },
              { icon: IndianRupee, label: recipe.estimatedCost || 'N/A' }
          ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-800/50 px-4 py-2 md:px-5 md:py-2.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.05)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.3)] border border-white/40 dark:border-white/5 text-[#1e3c72] dark:text-sky-100 font-semibold hover:scale-105 transition-transform duration-300 text-sm md:text-base cursor-default">
                  <item.icon size={16} className="text-amber-500 dark:text-sky-400 md:w-[18px] md:h-[18px]" />
                  <span>{item.label}</span>
              </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8">
          {/* Ingredients - Styled as Pantry Tags */}
          <div className="bg-[rgba(255,255,255,0.4)] dark:bg-slate-900/40 rounded-3xl p-5 md:p-6 border border-white/60 dark:border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] transition-colors hover:bg-white/50 dark:hover:bg-slate-800/40">
              <h3 className="text-xl font-bold text-[#1e3c72] dark:text-sky-200 mb-4 flex items-center gap-2 font-['Varela_Round']">
                  <span className="text-2xl filter drop-shadow-sm">🥗</span> Ingredients
              </h3>
              <div className="flex flex-col gap-3">
                  {recipe.ingredients.map((ing, idx) => (
                      <div 
                        key={idx} 
                        className="bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 flex items-center justify-between text-[#1e3c72] dark:text-slate-200 font-bold text-sm md:text-base hover:scale-[1.02] hover:bg-amber-50 dark:hover:bg-slate-700 transition-all duration-300 cursor-default group animate-fade-slide opacity-0"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                          <span>{ing.item}</span>
                          <span className="bg-amber-100 dark:bg-sky-900/30 text-amber-800 dark:text-sky-300 text-xs px-3 py-1 rounded-full border border-amber-200 dark:border-sky-800 shadow-inner font-semibold group-hover:bg-amber-200 dark:group-hover:bg-sky-800 transition-colors">
                              {ing.amount}
                          </span>
                      </div>
                  ))}
              </div>
          </div>

          {/* Instructions - Clean list in Sunken Container */}
          <div className="bg-[rgba(255,255,255,0.4)] dark:bg-slate-900/40 rounded-3xl p-5 md:p-6 border border-white/60 dark:border-white/5 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] transition-colors hover:bg-white/50 dark:hover:bg-slate-800/40">
              <h3 className="text-xl font-bold text-[#1e3c72] dark:text-sky-200 mb-4 flex items-center gap-2 font-['Varela_Round']">
                  <span className="text-2xl filter drop-shadow-sm">🍳</span> Method
              </h3>
              <ol className="space-y-4">
                  {recipe.instructions.map((step, idx) => (
                      <li 
                        key={idx} 
                        className="flex gap-4 group animate-fade-slide opacity-0"
                        style={{ animationDelay: `${(idx * 150) + 300}ms` }}
                      >
                          {/* Step Number Gradient: Amber/Orange in Light, Sky/Blue in Dark */}
                          <span className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 dark:from-sky-700 dark:to-blue-900 text-white flex items-center justify-center text-sm font-bold shadow-md border border-white/50 dark:border-white/10 group-hover:scale-110 transition-transform">
                              {idx + 1}
                          </span>
                          <p className="text-[#2c3e50] dark:text-slate-400 text-sm md:text-base leading-relaxed font-medium pt-1 group-hover:text-[#1e3c72] dark:group-hover:text-slate-200 transition-colors">{step}</p>
                      </li>
                  ))}
              </ol>
          </div>
        </div>

        {/* Nutrition Tiles - Mini Milk Glass - Conditional Rendering */}
        {showNutrition && recipe.nutrition && (
            <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
            {Object.entries(recipe.nutrition).map(([key, value], idx) => (
                <div 
                    key={key} 
                    className="bg-[rgba(255,255,255,0.65)] dark:bg-slate-800/40 backdrop-blur-sm rounded-2xl p-3 md:p-4 border border-white/90 dark:border-white/5 text-center shadow-[0_4px_10px_rgba(0,0,0,0.03)] dark:shadow-none flex flex-col justify-center items-center hover:-translate-y-1 transition-transform animate-scale-pulse"
                    style={{ animationDelay: `${idx * 100}ms` }}
                >
                    <p className="text-[10px] md:text-xs uppercase font-bold text-amber-500 dark:text-sky-500 tracking-wider mb-1">{key}</p>
                    <p className="text-base md:text-lg font-extrabold text-[#2c3e50] dark:text-slate-200">{value}</p>
                </div>
            ))}
            </div>
        )}

        {/* Actions - Spacious Grid */}
        <div className="flex flex-col gap-4 pb-2">
            <GlossyButton onClick={() => setIsCooking(true)} variant="primary" className="w-full text-lg h-[60px]">
                <div className="flex items-center justify-center gap-2">
                    <PlayCircle size={24} className="fill-white/20" /> 
                    <span>Start Cooking Mode</span>
                </div>
            </GlossyButton>

            <div className="grid grid-cols-2 gap-4">
                <GlossyButton onClick={onRegenerate} variant="secondary" className="text-base">
                    <div className="flex items-center justify-center gap-2">
                        <RefreshCw size={18} /> 
                        <span>Regenerate</span>
                    </div>
                </GlossyButton>

                <GlossyButton onClick={onSave} variant="primary" isLoading={isSaving} className="text-base">
                    <div className="flex items-center justify-center gap-2">
                        <Save size={18} /> 
                        <span>Save Recipe</span>
                    </div>
                </GlossyButton>
            </div>
        </div>
      </GlassCard>

      {/* Cooking Mode Overlay */}
      {isCooking && (
        <CookingMode recipe={recipe} onClose={() => setIsCooking(false)} />
      )}
    </>
  );
};