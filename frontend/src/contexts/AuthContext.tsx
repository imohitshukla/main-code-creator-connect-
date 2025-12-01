import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl } from '@/lib/utils';

export interface User {
  id: number;
  email: string;
  role: 'brand' | 'creator';
  username?: string;
  avatar?: string;
  name?: string;
  company_name?: string;
  phone_number?: string;
  portfolio_link?: string;
}

export interface UserProfile {
  name: string;
  phoneNumber: string;
  email: string;
  followers: string;
  instagram: string;
  youtube: string;
  tiktok: string;
  portfolio: string;
  niche: string;
  bio: string;
  audience: string;
  budgetRange: string;
  location: string;
  campaignGoals: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  login: (email: string, password: string) => Promise<{ requiresOtp: boolean; userId?: number; message?: string }>;
  signup: (email: string, password: string) => Promise<void>;
  verifyOtp: (userId: number, otp: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setSession: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const getProfileStorageKey = (userId: number) => `cc_profile_${userId}`;

  const buildDefaultProfile = (userData: User): UserProfile => {
    const fallbackName =
      userData.name ||
      userData.company_name ||
      userData.username ||
      userData.email?.split('@')[0] ||
      'Creator';

    return {
      name: fallbackName,
      phoneNumber: userData.phone_number || '',
      email: userData.email,
      followers: '',
      instagram: '',
      youtube: '',
      tiktok: '',
      portfolio: userData.portfolio_link || '',
      niche: '',
      bio: '',
      audience: '',
      budgetRange: '',
      location: '',
      campaignGoals: '',
    };
  };

  const hydrateProfile = (userData: User) => {
    const storageKey = getProfileStorageKey(userData.id);
    const storedProfile = localStorage.getItem(storageKey);

    if (storedProfile) {
      try {
        return JSON.parse(storedProfile) as UserProfile;
      } catch {
        // ignore parsing errors and rebuild
      }
    }

    const defaultProfile = buildDefaultProfile(userData);
    localStorage.setItem(storageKey, JSON.stringify(defaultProfile));
    return defaultProfile;
  };

  const persistProfile = (userId: number, profileData: UserProfile) => {
    localStorage.setItem(getProfileStorageKey(userId), JSON.stringify(profileData));
  };

  useEffect(() => {
    // Check for existing token and validate
    const token = localStorage.getItem('token');
    if (!token) return;

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setProfile(hydrateProfile(parsedUser));
    }
  }, []);

  const setSession = (userData: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    const hydratedProfile = hydrateProfile(userData);
    setProfile(hydratedProfile);
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      if (data.requiresOtp) {
        return {
          requiresOtp: true,
          userId: data.userId,
          message: data.message
        };
      } else {
        setSession(data.user, data.token);
        return { requiresOtp: false };
      }
    } catch (error) {
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const data = await response.json();
      setSession(data.user, data.token);
    } catch (error) {
      throw error;
    }
  };

  const verifyOtp = async (userId: number, otp: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/verify-login-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, otp })
      });

      if (!response.ok) {
        throw new Error('OTP verification failed');
      }

      const data = await response.json();
      setSession(data.user, data.token);
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;

    setProfile((prev) => {
      const nextProfile = {
        ...(prev ?? buildDefaultProfile(user)),
        ...updates,
      };
      persistProfile(user.id, nextProfile);
      return nextProfile;
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (user && profile) {
      persistProfile(user.id, profile);
    }
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    profile,
    login,
    signup,
    verifyOtp,
    updateProfile,
    setSession,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
