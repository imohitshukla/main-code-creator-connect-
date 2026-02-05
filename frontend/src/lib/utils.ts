import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get API base URL from environment variable or use fallback
export const getApiUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  // Fallback for development/production
  if (apiUrl) {
    return apiUrl;
  }
  
  // Development fallback
  if (import.meta.env.DEV) {
    return 'http://localhost:10000';
  }
  
  // Production fallback
  return 'https://main-code-creator-connect-.onrender.com';
};
