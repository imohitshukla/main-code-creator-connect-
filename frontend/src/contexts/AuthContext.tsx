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

  // 🔄 THE PERSISTENCE CHECK (Runs on every Refresh)
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // 🚨 CRITICAL FIX: 'credentials: include' allows the cookie to travel
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // <--- THIS PREVENTS THE LOGOUT ON REFRESH
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Session Restored:", data.user);
          setUser(data.user);
        } else {
          console.log("No active session found");
          setUser(null);
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false); // Stop loading regardless of success/fail
      }
    };

    checkUserLoggedIn();
  }, []);

  const login = (userData: User) => {
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
    setUser(null);
    window.location.href = '/auth';
  };

  const updateUserRole = async (role: 'BRAND' | 'CREATOR') => {
    if (!user) return;
    setUser({ ...user, role });
    // Send update to backend
    await fetch(`${import.meta.env.VITE_API_URL}/api/users/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
