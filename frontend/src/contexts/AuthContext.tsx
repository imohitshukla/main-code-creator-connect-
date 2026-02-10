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
      // 1. 🔍 Try to find the backup key in LocalStorage
      const backupToken = localStorage.getItem('auth_token');

      // 2. 🛡️ Attach it manually to the header
      const headers: any = { 'Content-Type': 'application/json' };
      if (backupToken) {
        headers['Authorization'] = `Bearer ${backupToken}`;
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        method: 'GET',
        headers: headers,
        credentials: 'include', // Still try cookies as well
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // If server explicitly says "Unauth", clear the backup key
        if (res.status === 401) {
          localStorage.removeItem('auth_token');
          setUser(null);
        }
      }
    } catch (error) {
      console.error("Persistence check failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  checkUserLoggedIn();
}, []);

  const login = (data: any) => {
    // If the backend sends { user: {...}, token: "..." }
    if (data.token) {
      localStorage.setItem('auth_token', data.token);
    }
    // If the backend sends { user: { ..., token: "..." } }
    else if (data.user?.token) {
      localStorage.setItem('auth_token', data.user.token);
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
