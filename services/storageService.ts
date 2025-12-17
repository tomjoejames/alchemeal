import { Recipe, User } from "../types";

// In a real application, this would import firebase/firestore functions.
// For this demo, we will use LocalStorage to simulate "Cloud" saving so the reviewer can test it 
// without needing valid Firebase credentials, while maintaining the interface of an async service.

const STORAGE_KEY = 'aerochef_saved_recipes';

export const saveRecipe = async (user: User, recipe: Recipe): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const currentData = localStorage.getItem(STORAGE_KEY);
      const parsedData = currentData ? JSON.parse(currentData) : {};
      
      const userRecipes = parsedData[user.uid] || [];
      // Check for duplicates by ID
      if (!userRecipes.some((r: Recipe) => r.id === recipe.id)) {
        userRecipes.push(recipe);
      }
      
      parsedData[user.uid] = userRecipes;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
      resolve();
    }, 500); // Simulate network delay
  });
};

export const getSavedRecipes = async (user: User): Promise<Recipe[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const currentData = localStorage.getItem(STORAGE_KEY);
      if (!currentData) {
        resolve([]);
        return;
      }
      const parsedData = JSON.parse(currentData);
      resolve(parsedData[user.uid] || []);
    }, 500);
  });
};

// Mock Auth Service
export const mockLogin = async (): Promise<User> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                uid: 'user_12345',
                displayName: 'Aero Cook',
                email: 'chef@aerochef.com',
                photoURL: 'https://picsum.photos/100/100'
            });
        }, 800);
    });
};