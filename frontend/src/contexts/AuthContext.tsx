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
        const localToken = localStorage.getItem('auth_token');

        // 🚨 CRITICAL FIX: 'credentials: include' allows cookie to travel
        // 🛡️ ASSAULT VECTOR: Send Token in Header manually as fail-safe
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': localToken ? `Bearer ${localToken}` : ''
          },
          credentials: 'include', // <--- THIS PREVENTS THE LOGOUT ON REFRESH
        });

        if (res.ok) {
          const data = await res.json();
          // console.log("Session Restored:", data.user);
          setUser(data.user);
        } else {
          // Only clear if server explicitly rejects us (401)
          // If network error, we keep intent to try again later (though typically we just stop loading)
          if (res.status === 401) {
            localStorage.removeItem('auth_token');
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Session check failed:", error);
        // Don't auto-logout on network error, but stopped loading
      } finally {
        setIsLoading(false); // Stop loading regardless of success/fail
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = (userData: User) => {
    // 💾 PERSISTENCE: Save to LocalStorage immediately
    if (userData.token) {
      localStorage.setItem('auth_token', userData.token);
    }
    setUser(userData);
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
