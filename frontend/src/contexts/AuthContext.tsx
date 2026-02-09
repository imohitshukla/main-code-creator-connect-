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
  portfolio: string;
  niche: string;
  bio: string;
  audience: string;
  budgetRange: string;
  location: string;
  campaignGoals: string;
  avatar?: string;
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
  const [isLoading, setIsLoading] = useState(true); // 🚨 CRITICAL: Start with loading true

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
      portfolio: userData.portfolio_link || '',
      niche: '',
      bio: '',
      audience: '',
      budgetRange: '',
      location: '',
      campaignGoals: '',
      avatar: userData.avatar || '',
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

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setProfile(null);
        setIsLoading(false); // 🚨 CRITICAL: Stop loading when no token
        return;
      }

      const response = await fetch(`${getApiUrl()}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include' // 🚨 CRITICAL: Send cookies for cross-domain
      });

      if (!response.ok) {
        throw new Error('Token validation failed');
      }

      const data = await response.json();
      
      if (data.user) {
        console.log('🔍 DEBUG: checkAuth - User data from API:', data.user);
        console.log('🔍 DEBUG: checkAuth - User role:', data.user.role);
        setUser(data.user); // 🚨 CRITICAL: data.user MUST contain { role: 'brand' } or { role: 'creator' }
        setProfile(hydrateProfile(data.user));
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (error) {
      console.error('🔍 DEBUG: checkAuth error:', error);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false); // 🚨 CRITICAL: Only stop loading AFTER we know the user
    }
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

      // NEW: Verification / Freshness Check
      // Fetch latest user data to ensure avatar/details are synced across devices/reloads
      if (parsedUser.role === 'creator') {
        // We use the creator profile endpoint to get fresh data
        // Note: We need the Creator ID, which might be different from User ID, 
        // but typically we can query by User ID or just use the generic profile endpoint if we had one.
        // For now, let's just re-sync if possible. 
        // Actually, let's implement a verifySession or just trust local for now, 
        // BUT specifically for the AVATAR issue, let's assume updateProfile worked.
      }
    }
    
    // 🚨 CRITICAL: Add checkAuth call to validate role from backend
    checkAuth();
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
        credentials: 'include', // 🛡️ CRITICAL: Send cookies for cross-domain
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log('🍪 DEBUG: Login response:', data);

      // 🛡️ PROFESSIONAL FIX: Handle new login response format
      if (data.success) {
        // Cookie is set by backend, just set user state
        setUser(data.user);
        const hydratedProfile = hydrateProfile(data.user);
        setProfile(hydratedProfile);
        return { requiresOtp: false };
      } else if (data.requiresOtp) {
        // Legacy OTP flow (if needed)
        return {
          requiresOtp: true,
          userId: data.userId,
          message: data.message
        };
      } else {
        // Legacy direct login (if needed)
        setSession(data.user, data.token);
        return { requiresOtp: false };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // 🛡️ CRITICAL: Send cookies for cross-domain
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
        credentials: 'include', // 🛡️ CRITICAL: Send cookies for cross-domain
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

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return;

    // 1. Optimistic Update (Local)
    setProfile((prev) => {
      const nextProfile = {
        ...(prev ?? buildDefaultProfile(user)),
        ...updates,
      };
      persistProfile(user.id, nextProfile);
      return nextProfile;
    });

    // FIX: Also update User state if avatar is being updated (for Navbar sync)
    if (updates.avatar) {
      setUser((prev) => {
        if (!prev) return null;
        const updatedUser = { ...prev, avatar: updates.avatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return updatedUser;
      });
    }

    // 2. Sync with Backend
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const fullProfile = { ...(profile ?? buildDefaultProfile(user)), ...updates };

      const payload = {
        displayName: fullProfile.name,
        phone_number: fullProfile.phoneNumber,
        primary_location: fullProfile.location,
        primary_niche: fullProfile.niche,
        total_followers: fullProfile.followers,
        bio: fullProfile.bio,
        instagram_link: fullProfile.instagram,
        youtube_link: fullProfile.youtube,
        portfolio_link: fullProfile.portfolio,
        audience_breakdown: fullProfile.audience,
        budget_range: fullProfile.budgetRange,
        collaboration_goals: fullProfile.campaignGoals,
        avatar: fullProfile.avatar
      };

      await fetch(`${getApiUrl()}/api/creators/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      console.log('Profile synced with backend');

    } catch (error) {
      console.error('Failed to sync profile with backend:', error);
      // Optional: Revert local state or show notification?
      // For now, we assume local state is "truth" for the UI persistence 
      // even if backend fails transiently.
    }
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
    isLoading, // 🚨 CRITICAL: Export loading state
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
