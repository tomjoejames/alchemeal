import React, { useState, useEffect } from 'react';
import { User, UserPreferences, Recipe, CuisineType, CookingMethod, Language, DishSuggestion } from './types';
import { generateRecipe, getDishSuggestions } from './services/geminiService';
import { mockLogin, saveRecipe, getSavedRecipes } from './services/storageService';
import { BubbleBackground } from './components/BubbleBackground';
import { GlassCard } from './components/GlassCard';
import { GlossyButton } from './components/GlossyButton';
import { RecipeCard } from './components/RecipeCard';
import { Preloader } from './components/Preloader';
import { ChefHat, LogOut, Sparkles, BookOpen, Clock, Flame, Moon, Sun, Globe, Settings, Lightbulb, ArrowRight, Utensils, Sliders, Check, Plus, Home, TrendingUp, Calendar, Users, ChevronRight, User as UserIcon, Monitor } from 'lucide-react';

const App: React.FC = () => {
  // Initialize dark mode based on system preference to prevent flash
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [showPreloader, setShowPreloader] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  
  // Default view is now dashboard
  const [view, setView] = useState<'dashboard' | 'form' | 'result' | 'saved' | 'settings'>('dashboard');
  
  // App Settings / Customization State
  const [showServingsInput, setShowServingsInput] = useState(true);
  const [showCostInput, setShowCostInput] = useState(true);
  const [showNutritionOutput, setShowNutritionOutput] = useState(true);

  // Form State
  const [ingredients, setIngredients] = useState('');
  const [cuisine, setCuisine] = useState<CuisineType>(CuisineType.Any);
  const [restrictions, setRestrictions] = useState('');
  const [time, setTime] = useState(30);
  const [servings, setServings] = useState(2);
  const [maxCost, setMaxCost] = useState(500);
  const [method, setMethod] = useState<CookingMethod>(CookingMethod.Fire);
  const [language, setLanguage] = useState<Language>(Language.English);

  // Settings / Diet Profile State
  const [dietaryProfile, setDietaryProfile] = useState('');
  const [suggestions, setSuggestions] = useState<DishSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Dark Mode Toggle Logic
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auth Handling
  const handleLogin = async () => {
    setLoading(true);
    try {
      const u = await mockLogin();
      setUser(u);
      const saved = await getSavedRecipes(u);
      setSavedRecipes(saved);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setGeneratedRecipe(null);
    setView('dashboard');
  };

  // Recipe Generation
  const handleGenerate = async () => {
    if (!ingredients.trim()) {
        alert("Please enter a dish name or at least one ingredient!");
        return;
    }

    setLoading(true);
    try {
      const prefs: UserPreferences = {
        ingredients,
        cuisine,
        restrictions: restrictions || dietaryProfile, // Use global profile if local is empty
        timeAvailable: time,
        cookingMethod: method,
        servings: servings, // Will use default if input hidden
        maxCost: maxCost, // Will use default if input hidden
        language: language,
        includeNutrition: showNutritionOutput
      };
      const recipe = await generateRecipe(prefs);
      setGeneratedRecipe(recipe);
      setView('result');
    } catch (error) {
      console.error(error);
      alert("Failed to generate recipe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Suggestion Generation
  const handleGetSuggestions = async () => {
      if (!dietaryProfile.trim()) {
          alert("Please fill in your dietary profile to get suggestions.");
          return;
      }
      setSuggestionsLoading(true);
      try {
          const results = await getDishSuggestions(dietaryProfile, language);
          setSuggestions(results);
      } catch (error) {
          console.error(error);
          alert("Could not fetch suggestions.");
      } finally {
          setSuggestionsLoading(false);
      }
  };

  const handleCookSuggestion = (dishName: string) => {
      setIngredients(dishName);
      setView('form');
  };

  // Save Handling
  const handleSave = async () => {
    if (!user || !generatedRecipe) return;
    setLoading(true);
    try {
      await saveRecipe(user, generatedRecipe);
      const saved = await getSavedRecipes(user);
      setSavedRecipes(saved);
      alert("Recipe saved successfully!");
    } finally {
      setLoading(false);
    }
  };

  // Styles
  // Yellow focus ring for light, Sky focus ring for dark
  const sunkenInputClass = "w-full p-3 rounded-xl bg-white/90 dark:bg-slate-800/60 border border-black/5 dark:border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] dark:shadow-none focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-sky-600 text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all text-base";
  const compactInputClass = "w-full p-2.5 rounded-lg bg-white/90 dark:bg-slate-800/60 border border-black/5 dark:border-white/5 shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] dark:shadow-none focus:outline-none focus:ring-2 focus:ring-amber-300 dark:focus:ring-sky-600 text-slate-700 dark:text-slate-200 text-center font-bold text-sm md:text-base";
  
  const labelClass = "block text-[#1e3c72] dark:text-sky-200 font-bold mb-2 ml-1 text-base";

  // Toggle Switch Component (Local helper)
  const ToggleSwitch = ({ label, checked, onChange, icon: Icon }: { label: string, checked: boolean, onChange: (val: boolean) => void, icon?: React.ElementType }) => (
      <div className="flex items-center justify-between bg-white/50 dark:bg-slate-900/30 p-4 rounded-xl border border-white/60 dark:border-white/5 active:scale-[0.98] transition-transform">
          <div className="flex items-center gap-3">
             {Icon && <Icon size={20} className="text-amber-500 dark:text-sky-500" />}
             <span className="font-bold text-[#1e3c72] dark:text-sky-200 text-base">{label}</span>
          </div>
          <button 
              onClick={() => onChange(!checked)}
              className={`w-14 h-8 rounded-full relative transition-colors duration-300 shadow-inner border border-black/5 dark:border-white/10 ${checked ? 'bg-amber-400 dark:bg-sky-600' : 'bg-slate-300 dark:bg-slate-700'}`}
          >
              <div className={`absolute top-1 w-6 h-6 rounded-full bg-white dark:bg-slate-200 shadow-md transition-transform duration-300 flex items-center justify-center ${checked ? 'left-7' : 'left-1'}`}>
                 {checked && <Check size={14} className="text-amber-600 dark:text-sky-700" />}
              </div>
          </button>
      </div>
  );

  // 1. Show Preloader First
  if (showPreloader) {
    return (
      <div className="min-h-screen w-full font-['Open_Sans'] bg-white dark:bg-slate-900 transition-colors duration-500">
        <BubbleBackground />
        <Preloader onFinish={() => setShowPreloader(false)} />
      </div>
    );
  }

  // 2. Show Login Screen if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center p-4 font-['Open_Sans'] text-slate-900 dark:text-slate-100 overflow-hidden animate-in fade-in duration-500">
        <BubbleBackground />
        <GlassCard className="max-w-sm w-full text-center py-10 md:py-12">
             <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-3 rounded-full bg-white/50 dark:bg-slate-800/50 hover:bg-white/70 dark:hover:bg-slate-700/50 transition-colors text-slate-600 dark:text-slate-300"
                >
                  {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            <div className="mb-8 flex justify-center">
                <div className="bg-gradient-to-br from-amber-400 to-orange-500 dark:from-sky-700 dark:to-cyan-800 p-5 rounded-full shadow-[0_10px_20px_rgba(245,158,11,0.3)] dark:shadow-[0_10px_20px_rgba(0,0,0,0.5)] border-4 border-white dark:border-white/10 animate-float-medium">
                    <ChefHat size={48} className="text-white drop-shadow-md" />
                </div>
            </div>
            <h1 className="text-4xl font-extrabold text-[#1e3c72] dark:text-sky-100 mb-3 tracking-tight font-['Varela_Round'] drop-shadow-sm">
                Alchemeal
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg font-medium">
                The future of cooking, today.
            </p>
            <div className="flex justify-center">
                <GlossyButton onClick={handleLogin} isLoading={loading} className="w-auto px-8 py-3 text-base shadow-lg">
                    Sign in with Google
                </GlossyButton>
            </div>
            <p className="mt-6 text-xs text-slate-400 dark:text-slate-500 font-semibold">
                (Simulated login for demo)
            </p>
        </GlassCard>
      </div>
    );
  }

  // 3. Render Main App
  return (
    <div className="min-h-screen w-full flex flex-col items-center font-['Open_Sans'] text-slate-900 dark:text-white overflow-x-hidden pb-32 md:pb-10 animate-in fade-in duration-500">
      <BubbleBackground />
      
      {/* Top Navigation Bar - Minimalist (No Logo/Name, No Logout/Theme Toggles) */}
      <nav className="w-full max-w-5xl flex justify-center md:justify-end items-center p-4 md:py-6 relative z-20">
        <div className="hidden md:flex gap-3">
             <button 
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-full font-bold transition-all ${view === 'dashboard' ? 'bg-white/80 dark:bg-slate-800/80 text-amber-600 dark:text-sky-100' : 'hover:bg-white/30 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400'}`}
            >
                Home
            </button>
             <button 
                onClick={() => setView('form')}
                className={`px-4 py-2 rounded-full font-bold transition-all ${view === 'form' ? 'bg-white/80 dark:bg-slate-800/80 text-amber-600 dark:text-sky-100' : 'hover:bg-white/30 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400'}`}
            >
                Create
            </button>
            <button 
                onClick={() => setView('saved')}
                className={`px-4 py-2 rounded-full font-bold transition-all ${view === 'saved' ? 'bg-white/80 dark:bg-slate-800/80 text-amber-600 dark:text-sky-100' : 'hover:bg-white/30 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400'}`}
            >
                Saved
            </button>
            <button 
                onClick={() => setView('settings')}
                className={`px-4 py-2 rounded-full font-bold transition-all ${view === 'settings' ? 'bg-white/80 dark:bg-slate-800/80 text-amber-600 dark:text-sky-100' : 'hover:bg-white/30 dark:hover:bg-slate-800/30 text-slate-600 dark:text-slate-400'}`}
            >
                Settings
            </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="w-full max-w-lg md:max-w-4xl relative z-10 px-4 md:px-0">
        
        {view === 'dashboard' && (
           <div className="space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-300">
              <GlassCard className="w-full relative overflow-hidden">
                   <h2 className="text-3xl md:text-4xl font-extrabold text-[#1e3c72] dark:text-sky-100 mb-2 font-['Varela_Round']">
                      Hello, {user.displayName.split(' ')[0]}!
                   </h2>
                   <p className="text-slate-600 dark:text-slate-400 text-lg mb-6">
                      Ready to discover your next favorite meal?
                   </p>
                   
                   <div className="grid grid-cols-2 gap-4">
                       <div className="bg-white/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/50 dark:border-white/5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors" onClick={() => setView('form')}>
                           <div className="bg-gradient-to-br from-amber-400 to-orange-400 dark:from-sky-700 dark:to-cyan-800 p-3 rounded-full mb-2 shadow-md">
                               <Plus size={24} className="text-white"/>
                           </div>
                           <span className="font-bold text-[#1e3c72] dark:text-sky-200">New Recipe</span>
                       </div>
                       <div className="bg-white/50 dark:bg-slate-800/40 p-4 rounded-2xl border border-white/50 dark:border-white/5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/60 dark:hover:bg-slate-800/60 transition-colors" onClick={() => setView('saved')}>
                           <div className="bg-gradient-to-br from-amber-400 to-orange-400 dark:from-amber-700 dark:to-orange-800 p-3 rounded-full mb-2 shadow-md">
                               <BookOpen size={24} className="text-white"/>
                           </div>
                           <span className="font-bold text-[#1e3c72] dark:text-sky-200">My Cookbook</span>
                       </div>
                   </div>
              </GlassCard>

               {/* AI Chef Consultant / Suggestions */}
               <GlassCard className="w-full border-t-4 border-t-indigo-300 dark:border-t-indigo-900">
                    <h3 className="text-xl md:text-2xl font-bold text-[#1e3c72] dark:text-sky-200 mb-4 flex items-center gap-2">
                        <Lightbulb size={24} className="text-amber-500 fill-amber-500 dark:text-amber-400 dark:fill-amber-400/20" />
                        Chef's Suggestions
                    </h3>
                    
                    <div className="mb-4">
                        <label className={labelClass + " text-sm"}>Your Dietary Profile</label>
                        <textarea 
                            className={`${sunkenInputClass} text-sm p-3 min-h-[80px]`}
                            placeholder="e.g. Vegetarian, loves spicy food, low carb..."
                            value={dietaryProfile}
                            onChange={(e) => setDietaryProfile(e.target.value)}
                        />
                    </div>

                    <GlossyButton onClick={handleGetSuggestions} isLoading={suggestionsLoading} variant="secondary" className="w-full text-base mb-6">
                        Suggest a Dish
                    </GlossyButton>

                    {suggestions.length > 0 && (
                        <div className="flex flex-col gap-3">
                            {suggestions.map((suggestion, idx) => (
                                <div key={idx} className="bg-white/80 dark:bg-slate-800/50 p-4 rounded-xl border border-white dark:border-white/10 hover:shadow-lg transition-all flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-lg text-[#1e3c72] dark:text-sky-200">{suggestion.name}</h4>
                                        <span className="text-xs text-green-600 dark:text-green-400 font-semibold bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded-full">
                                            {suggestion.matchReason}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 italic">"{suggestion.description}"</p>
                                    <button 
                                        onClick={() => handleCookSuggestion(suggestion.name)}
                                        className="mt-auto text-sm font-bold text-white bg-amber-500 dark:bg-sky-700 hover:bg-amber-600 dark:hover:bg-sky-600 px-4 py-2.5 rounded-full flex items-center justify-center gap-2 transition-colors shadow-md w-full"
                                    >
                                        Create This Recipe <ArrowRight size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
               </GlassCard>

               {/* Recent Activity / Stats */}
               {savedRecipes.length > 0 && (
                   <div className="pb-4">
                       <div className="flex justify-between items-end mb-3 px-2">
                           <h3 className="text-lg font-bold text-[#1e3c72] dark:text-sky-200 flex items-center gap-2">
                               <TrendingUp size={20} className="text-amber-500 dark:text-sky-500" />
                               Recent Saves
                           </h3>
                           <span className="text-xs text-slate-500 dark:text-slate-400 font-bold cursor-pointer hover:underline" onClick={() => setView('saved')}>View All</span>
                       </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {savedRecipes.slice(0, 2).map(recipe => (
                                <div 
                                    key={recipe.id}
                                    onClick={() => { setGeneratedRecipe(recipe); setView('result'); }}
                                    className="bg-white/60 dark:bg-slate-800/40 p-4 rounded-[20px] border border-white/80 dark:border-white/10 flex items-center gap-4 cursor-pointer hover:bg-white/90 dark:hover:bg-slate-800/60 transition-all shadow-sm"
                                >
                                    <span className="text-3xl">{recipe.emoji}</span>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-[#1e3c72] dark:text-sky-100 truncate">{recipe.title}</h4>
                                        <div className="flex gap-3 text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-1">
                                            <span className="flex items-center gap-0.5"><Clock size={10}/> {recipe.prepTime}</span>
                                            <span className="flex items-center gap-0.5"><Users size={10}/> {recipe.servings}</span>
                                        </div>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400" />
                                </div>
                           ))}
                       </div>
                   </div>
               )}
           </div>
        )}
        
        {view === 'form' && (
          <div className="animate-in fade-in zoom-in duration-300 w-full max-w-2xl mx-auto space-y-4 md:space-y-6">
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#1e3c72] dark:text-sky-100 drop-shadow-md mb-2 flex items-center justify-center gap-3 font-['Varela_Round']">
                <Sparkles className="text-amber-400 fill-amber-400 w-6 h-6 md:w-8 md:h-8 animate-pulse" /> 
                Create Your Dish
            </h2>
            
            {/* Input Group 1: Dish Name */}
            <GlassCard className="p-4 md:p-5">
                <label className="block text-[#1e3c72] dark:text-sky-200 font-bold mb-2 ml-1 text-sm md:text-base">Dish Name or Ingredients</label>
                <textarea 
                    className={`${sunkenInputClass} py-3 px-4 min-h-[60px] leading-relaxed resize-none`}
                    placeholder="e.g. Butter Chicken"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                />
            </GlassCard>

            {/* Input Group 2: Cuisine & Method */}
            <div className="grid grid-cols-2 gap-4">
                <GlassCard className="p-4">
                    <label className="block text-[#1e3c72] dark:text-sky-200 font-bold mb-2 ml-1 text-xs md:text-sm">Cuisine</label>
                    <div className="relative">
                        <select 
                            className={`${sunkenInputClass} py-2 pl-3 pr-6 text-sm appearance-none cursor-pointer`}
                            value={cuisine}
                            onChange={(e) => setCuisine(e.target.value as CuisineType)}
                        >
                            {Object.values(CuisineType).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                    </div>
                </GlassCard>

                <GlassCard className="p-4">
                    <label className="block text-[#1e3c72] dark:text-sky-200 font-bold mb-2 ml-1 text-xs md:text-sm">Method</label>
                    <div className="relative">
                        <select 
                            className={`${sunkenInputClass} py-2 pl-3 pr-6 text-sm appearance-none cursor-pointer`}
                            value={method}
                            onChange={(e) => setMethod(e.target.value as CookingMethod)}
                        >
                            {Object.values(CookingMethod).map(m => (
                                <option key={m} value={m}>{m.split(' ')[0]}</option>
                            ))}
                        </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                    </div>
                </GlassCard>
            </div>

            {/* Input Group 3: Metrics */}
            <GlassCard className="p-4 md:p-5">
                <div className="grid grid-cols-3 gap-3 md:gap-6">
                    <div className="flex flex-col items-center">
                        <label className="text-xs font-bold text-[#1e3c72] dark:text-sky-200 mb-1">Time (min)</label>
                        <input 
                            type="number" 
                            min="5" max="300" step="5"
                            value={time} 
                            onChange={(e) => setTime(Number(e.target.value))}
                            className={`${compactInputClass} py-1.5`}
                        />
                    </div>
                    
                    {showServingsInput && (
                        <div className="flex flex-col items-center">
                            <label className="text-xs font-bold text-[#1e3c72] dark:text-sky-200 mb-1">Servings</label>
                            <input 
                                type="number" 
                                min="1" max="50" step="1"
                                value={servings} 
                                onChange={(e) => setServings(Number(e.target.value))}
                                className={`${compactInputClass} py-1.5`}
                            />
                        </div>
                    )}

                    {showCostInput && (
                        <div className="flex flex-col items-center">
                            <label className="text-xs font-bold text-[#1e3c72] dark:text-sky-200 mb-1">Max Cost</label>
                            <input 
                                type="number" 
                                min="100" max="10000" step="50"
                                value={maxCost} 
                                onChange={(e) => setMaxCost(Number(e.target.value))}
                                className={`${compactInputClass} py-1.5`}
                            />
                        </div>
                    )}
                </div>
            </GlassCard>

            {/* Input Group 4: Restrictions & Action */}
            <GlassCard className="p-4 md:p-5 flex flex-col gap-4">
                 <div>
                     <label className="block text-[#1e3c72] dark:text-sky-200 font-bold mb-2 ml-1 text-sm">Restrictions / Notes</label>
                     <input 
                        type="text"
                        className={`${sunkenInputClass} py-3 text-sm`}
                        placeholder="e.g. Spicy, Keto, No Nuts"
                        value={restrictions}
                        onChange={(e) => setRestrictions(e.target.value)}
                    />
                     <p className="text-xs text-slate-400 mt-2 text-right">
                       Diet Profile: {dietaryProfile ? <span className="text-green-500 dark:text-green-400 font-bold">Active</span> : "None"}
                    </p>
                </div>
                <GlossyButton onClick={handleGenerate} isLoading={loading} className="w-full text-base h-12 shadow-lg">
                    Generate Recipe
                </GlossyButton>
            </GlassCard>
          </div>
        )}

        {/* --- SETTINGS VIEW --- */}
        {view === 'settings' && (
            <div className="animate-in fade-in zoom-in duration-300 w-full max-w-2xl mx-auto space-y-6">
                <h2 className="text-2xl md:text-4xl font-extrabold text-[#1e3c72] dark:text-sky-100 drop-shadow-md mb-4 flex items-center justify-center gap-3 font-['Varela_Round']">
                    <Settings className="text-slate-500 dark:text-slate-400 w-8 h-8" /> 
                    Preferences
                </h2>

                {/* Appearance Card */}
                <GlassCard className="p-5">
                     <h3 className="text-lg md:text-xl font-bold text-[#1e3c72] dark:text-sky-200 mb-4 flex items-center gap-2">
                        <Monitor size={20} className="text-amber-500 dark:text-sky-500" />
                        Appearance
                    </h3>
                    <ToggleSwitch 
                        label={isDarkMode ? "Dark Mode" : "Light Mode"}
                        checked={isDarkMode} 
                        onChange={setIsDarkMode}
                        icon={isDarkMode ? Moon : Sun}
                    />
                </GlassCard>

                {/* Language Card */}
                <GlassCard className="p-5">
                    <h3 className="text-lg md:text-xl font-bold text-[#1e3c72] dark:text-sky-200 mb-4 flex items-center gap-2">
                        <Globe size={20} className="text-amber-500 dark:text-sky-500" />
                        Language
                    </h3>
                    <div className="relative">
                        <select 
                            className={`${sunkenInputClass} appearance-none cursor-pointer`}
                            value={language}
                            onChange={(e) => setLanguage(e.target.value as Language)}
                        >
                            {Object.values(Language).map(l => (
                                <option key={l} value={l}>{l}</option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                            ▼
                        </div>
                    </div>
                </GlassCard>
                
                {/* Customization Card */}
                <GlassCard className="p-5">
                     <h3 className="text-lg md:text-xl font-bold text-[#1e3c72] dark:text-sky-200 mb-4 flex items-center gap-2">
                        <Sliders size={20} className="text-amber-500 dark:text-sky-500" />
                        Customization
                    </h3>
                    
                    <div className="grid gap-4 md:grid-cols-1">
                         <ToggleSwitch 
                            label="Show Servings Input" 
                            checked={showServingsInput} 
                            onChange={setShowServingsInput} 
                         />
                         <ToggleSwitch 
                            label="Show Cost Estimate Input" 
                            checked={showCostInput} 
                            onChange={setShowCostInput} 
                         />
                         <ToggleSwitch 
                            label="Show Nutrition Data" 
                            checked={showNutritionOutput} 
                            onChange={setShowNutritionOutput} 
                         />
                    </div>
                </GlassCard>

                {/* Account Card */}
                <GlassCard className="p-5">
                    <h3 className="text-lg md:text-xl font-bold text-[#1e3c72] dark:text-sky-200 mb-4 flex items-center gap-2">
                        <UserIcon size={20} className="text-amber-500 dark:text-sky-500" />
                        Account
                    </h3>
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/40 dark:bg-slate-800/40 p-4 rounded-xl border border-white/50 dark:border-white/5">
                        <div className="flex items-center gap-3 w-full">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 flex items-center justify-center text-slate-500 dark:text-slate-300 font-bold shadow-inner text-xl">
                                {user.displayName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-[#1e3c72] dark:text-sky-100 text-lg">{user.displayName}</span>
                                <span className="text-sm text-slate-500 dark:text-slate-400">{user.email}</span>
                            </div>
                        </div>
                        <GlossyButton onClick={handleLogout} variant="danger" className="w-full md:w-auto shadow-md">
                            <div className="flex items-center gap-2">
                                <LogOut size={16} />
                                Sign Out
                            </div>
                        </GlossyButton>
                    </div>
                </GlassCard>
            </div>
        )}

        {view === 'result' && generatedRecipe && (
            <div className="animate-in slide-in-from-bottom-10 fade-in duration-500 w-full">
                <button 
                    onClick={() => setView('form')}
                    className="mb-4 text-[#1e3c72] dark:text-sky-200 font-bold hover:underline flex items-center gap-2 bg-white/40 dark:bg-slate-800/40 px-4 py-2 rounded-full w-fit text-sm md:text-base backdrop-blur-md"
                >
                    &larr; Back to Generator
                </button>
                <RecipeCard 
                    recipe={generatedRecipe} 
                    onSave={handleSave} 
                    onRegenerate={handleGenerate}
                    isSaving={loading}
                    showNutrition={showNutritionOutput}
                />
            </div>
        )}

        {view === 'saved' && (
            <GlassCard className="min-h-[500px] w-full">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-extrabold text-[#1e3c72] dark:text-sky-100 font-['Varela_Round']">Saved Recipes</h2>
                </div>
                
                {savedRecipes.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 dark:text-slate-400">
                        <p className="text-xl mb-6">No recipes saved yet.</p>
                        <GlossyButton onClick={() => setView('form')} variant="secondary">Start Cooking</GlossyButton>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {savedRecipes.map(recipe => (
                            <div 
                                key={recipe.id} 
                                onClick={() => { setGeneratedRecipe(recipe); setView('result'); }}
                                className="bg-white/60 dark:bg-slate-800/50 p-5 rounded-[24px] border border-white/80 dark:border-white/10 hover:bg-white/80 dark:hover:bg-slate-800/70 transition-all cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_20px_rgba(251,191,36,0.15)] group hover:-translate-y-1 active:scale-[0.98]"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-4xl filter drop-shadow-sm group-hover:scale-110 transition-transform">{recipe.emoji}</span>
                                    <span className="text-xs bg-amber-50 dark:bg-cyan-950 text-amber-700 dark:text-cyan-200 px-3 py-1 rounded-full font-bold border border-amber-200 dark:border-cyan-800">{recipe.cookingMethod.split(' ')[0]}</span>
                                </div>
                                <h3 className="font-extrabold text-xl text-[#1e3c72] dark:text-sky-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-sky-300 transition-colors">{recipe.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{recipe.description}</p>
                                <div className="flex gap-4 text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide">
                                    <span className="flex items-center gap-1"><Clock size={12}/> {recipe.prepTime}</span>
                                    <span className="flex items-center gap-1"><Flame size={12}/> {recipe.cookTime}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </GlassCard>
        )}
      </div>

      {/* ICON-ONLY FLOATING DOCK BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 w-max max-w-[90%]">
        {/* Main Dock */}
        <div className="flex items-center gap-8 bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-white/50 dark:border-white/10 rounded-full px-8 h-16 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]">
            <button 
                onClick={() => setView('dashboard')}
                className={`transition-all duration-300 ${view === 'dashboard' ? 'text-amber-500 dark:text-sky-400 scale-125' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                <Home size={26} strokeWidth={view === 'dashboard' ? 2.5 : 2} />
            </button>

            <button 
                onClick={() => setView('saved')}
                className={`transition-all duration-300 ${view === 'saved' ? 'text-amber-500 dark:text-sky-400 scale-125' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                <BookOpen size={26} strokeWidth={view === 'saved' ? 2.5 : 2} />
            </button>

            <button 
                onClick={() => setView('settings')}
                className={`transition-all duration-300 ${view === 'settings' ? 'text-amber-500 dark:text-sky-400 scale-125' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
            >
                <Settings size={26} strokeWidth={view === 'settings' ? 2.5 : 2} />
            </button>
        </div>

        {/* Floating Action Button (Create New) - Always Visible */}
        <button 
            onClick={() => setView('form')}
            className={`h-14 w-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 dark:from-sky-600 dark:to-cyan-700 flex items-center justify-center text-white shadow-lg shadow-orange-500/30 dark:shadow-cyan-900/40 border border-white/40 dark:border-white/20 active:scale-95 transition-transform ${view === 'form' ? 'ring-4 ring-white/30 dark:ring-white/10 scale-110' : ''}`}
        >
            <Plus size={28} />
        </button>
      </div>

    </div>
  );
};

export default App;