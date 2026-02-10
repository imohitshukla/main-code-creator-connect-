import React, { createContext, useContext, useState, useEffect } from 'react';

// Define's User Shape
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
  const [isLoading, setIsLoading] = useState(true); // Start true to block UI until we check

  // 1. THE PERSISTENCE CHECK (Runs once on refresh)
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      try {
        // 🚨 CRITICAL: We ask to backend "Who am I?"
        // We MUST include credentials so cookie travels with request
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // <--- THIS FIXES THE REFRESH LOGOUT
        });

        if (res.ok) {
          const data = await res.json();
          console.log('🔍 DEBUG: Session check - User restored:', data.user);
          setUser(data.user); // Restore's user session
        } else {
          console.log('🔍 DEBUG: Session check - No valid session');
          setUser(null); // Valid logout (cookie expired or missing)
        }
      } catch (error) {
        console.error("Session check failed:", error);
        setUser(null);
      } finally {
        setIsLoading(false); // Stop's loading spinner
      }
    };

    checkUserLoggedIn();
  }, []);

  // 2. Manual Login Helper
  const login = (userData: User) => {
    console.log('🔍 DEBUG: Login - Setting user:', userData);
    setUser(userData);
    setIsLoading(false);
  };

  // 3. Manual Logout Helper
  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, { 
        method: 'POST',
        credentials: 'include' 
      });
    } catch(e) { console.error(e); }
    setUser(null);
    window.location.href = '/auth'; // Hard redirect to clear any stuck state
  };

  // 4. Role Updater (For your onboarding flow)
  const updateUserRole = async (role: 'BRAND' | 'CREATOR') => {
    if (!user) return;
    
    console.log('🔍 DEBUG: Updating role from', user.role, 'to', role);
    
    // Update Local State immediately for UI speed
    setUser({ ...user, role }); 

    // Update Backend
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
