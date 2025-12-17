export enum CuisineType {
  Any = 'Any',
  Italian = 'Italian',
  Mexican = 'Mexican',
  Indian = 'Indian',
  Chinese = 'Chinese',
  Japanese = 'Japanese',
  American = 'American',
  Mediterranean = 'Mediterranean',
  Thai = 'Thai',
  French = 'French'
}

export enum CookingMethod {
  Fire = 'Fire (Stove/Oven)',
  Fireless = 'Fireless (No Heat)'
}

export enum Language {
  English = 'English',
  Hindi = 'Hindi',
  Spanish = 'Spanish',
  French = 'French',
  German = 'German',
  Italian = 'Italian',
  Japanese = 'Japanese',
  Chinese = 'Chinese',
  Arabic = 'Arabic',
  Russian = 'Russian',
  Portuguese = 'Portuguese'
}

export interface UserPreferences {
  ingredients: string;
  cuisine: CuisineType;
  restrictions: string;
  timeAvailable: number; // in minutes
  cookingMethod: CookingMethod;
  servings: number;
  maxCost: number; // in INR
  language: Language;
  includeNutrition?: boolean;
}

export interface Ingredient {
  item: string;
  amount: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  ingredients: Ingredient[];
  instructions: string[];
  nutrition?: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  };
  cookingMethod: string;
  emoji: string;
  estimatedCost: string;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
}

export interface DishSuggestion {
  name: string;
  description: string;
  matchReason: string;
}