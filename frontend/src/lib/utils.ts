import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Get API base URL from environment variable or use relative path for production
export const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || '';
};
