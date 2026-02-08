import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get API base URL from environment variable or use fallback
export const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  console.log('🔍 DEBUG: Frontend API URL Configuration');
  console.log('🔍 DEBUG: VITE_API_URL:', apiUrl);
  console.log('🔍 DEBUG: import.meta.env.DEV:', import.meta.env.DEV);
  console.log('🔍 DEBUG: import.meta.env.PROD:', import.meta.env.PROD);
  console.log('🔍 DEBUG: All env vars:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
    BASE_URL: import.meta.env.BASE_URL,
  });
  
  // Fallback for development/production
  if (apiUrl) {
    console.log('🔍 DEBUG: Using VITE_API_URL:', apiUrl);
    return apiUrl;
  }
  
  // Development fallback
  if (import.meta.env.DEV) {
    console.log('🔍 DEBUG: Using development fallback: http://localhost:10000');
    return 'http://localhost:10000';
  }
  
  // Production fallback - Updated to custom domain
  const productionUrl = 'https://api.creatorconnect.tech';
  console.log('🔍 DEBUG: Using production fallback:', productionUrl);
  return productionUrl;
};
