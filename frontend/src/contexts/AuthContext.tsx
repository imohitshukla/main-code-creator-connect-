import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the User Shape
interface User {
  id: number;
  email: string;
  role: 'BRAND' | 'CREATOR' | 'PENDING';
  name?: string;
  brand_details?: any;
  username?: string;
  avatar?: string;
  company_name?: string;
  phone_number?: string;
  portfolio_link?: string;
  token?: string; // We store this in localStorage, but keeping it in type doesn't hurt
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (data: any) => void;
  logout: () => void;
  updateUserRole: (role: 'BRAND' | 'CREATOR') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // THE PERSISTENCE CHECK (Runs on every Refresh)
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // 🔍 RETRIEVE: Get backup token
        const token = localStorage.getItem('auth_token'); // 🟢 Read from memory
        console.log("🔍 Checking Auth with Token:", token ? "YES" : "NO");

        // 🚨 CRITICAL DEBUG: Log token state
        console.log('🔍 FRONTEND DEBUG: localStorage token:', token);
        console.log('🔍 FRONTEND DEBUG: localStorage contents:', JSON.stringify(localStorage));
        console.log('🔍 FRONTEND DEBUG: All cookies:', document.cookie);

        // 🚨 CRITICAL FIX: 'credentials: include' allows cookie to travel
        // 🛡️ ASSAULT VECTOR: Send Token in Header manually as fail-safe
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '' // 🟢 Manually attach
          },
          credentials: 'include', // <--- THIS PREVENTS THE LOGOUT ON REFRESH
        });

        // 🚨 CRITICAL DEBUG: Log request details
        console.log('🔍 FRONTEND DEBUG: Request headers:', {
          'Authorization': token ? `Bearer ${token}` : 'NOT_SET',
          'credentials': 'include'
        });
        console.log('🔍 FRONTEND DEBUG: Response status:', res.status);
        console.log('🔍 FRONTEND DEBUG: Response headers:', {
          'set-cookie': res.headers.get('set-cookie'),
          'access-control-allow-credentials': res.headers.get('access-control-allow-credentials'),
          'access-control-allow-origin': res.headers.get('access-control-allow-origin')
        });

        if (res.ok) {
          const data = await res.json();
          console.log("✅ FRONTEND DEBUG: Session Restored:", data.user);
          setUser(data.user);
        } else {
          // Only clear if server explicitly rejects us (401)
          // If network error, we keep intent to try again later (though typically we just stop loading)
          if (res.status === 401) {
            console.log('❌ FRONTEND DEBUG: 401 - Clearing localStorage and user');
            localStorage.removeItem('auth_token');
            setUser(null);
          }
        }
      } catch (error) {
        console.error("❌ FRONTEND DEBUG: Session check failed:", error);
        // Don't auto-logout on network error, but stopped loading
      } finally {
        setIsLoading(false); // Stop loading regardless of success/fail
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = (data: any) => {
    console.log("LOGIN SUCCESS, DATA RECEIVED:", data);

    // 🚨 CRITICAL: Manually save the token
    if (data.user && data.user.token) {
      console.log("💾 Saving token to LocalStorage:", data.user.token.substring(0, 10) + "...");
      localStorage.setItem('auth_token', data.user.token);
    } else if (data.token) {
      // Handle case where token is at root level
      console.log("� Saving root-level token to LocalStorage:", data.token.substring(0, 10) + "...");
      localStorage.setItem('auth_token', data.token);
    } else {
      console.error("❌ NO TOKEN FOUND IN LOGIN RESPONSE");
    }

    setUser(data.user || data);
    setIsLoading(false);
  };

  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
    } catch (e) { console.error(e); }

    // 🚨 CRITICAL: Clear all authentication data
    setUser(null);
    localStorage.removeItem('auth_token');
    window.location.href = '/auth';
  };

  const updateUserRole = async (role: 'BRAND' | 'CREATOR') => {
    if (!user) return;
    setUser({ ...user, role });

    const localToken = localStorage.getItem('auth_token');

    // Send update to backend
    await fetch(`${import.meta.env.VITE_API_URL}/api/users/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': localToken ? `Bearer ${localToken}` : ''
      },
      credentials: 'include',
      body: JSON.stringify({ role })
    });
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
