import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  role: 'BRAND' | 'CREATOR' | 'PENDING';
  name?: string;
  token?: string;
  avatar?: string;
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

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedToken = localStorage.getItem('auth_token');
        
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (storedToken) {
            headers['Authorization'] = `Bearer ${storedToken}`;
        }

        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          method: 'GET',
          headers: headers, 
          credentials: 'include', 
        });

        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        } else {
          if (res.status === 401) localStorage.removeItem('auth_token');
          setUser(null);
        }
      } catch (error) {
        console.error("Auth check failed", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (data: any) => {
    // CRITICAL DEBUGGING: Let's see what we're receiving
    console.log(' LOGIN DEBUG: Login data received:', data);
    console.log(' LOGIN DEBUG: data.token:', data.token);
    console.log(' LOGIN DEBUG: data.user?.token:', data.user?.token);
    
    // SAVE TOKEN TO LOCALSTORAGE
    if (data.user?.token) {
        localStorage.setItem('auth_token', data.user.token);
        console.log(' LOGIN DEBUG: Token saved from data.user.token:', data.user.token.substring(0, 20) + '...');
    } else if (data.token) {
        localStorage.setItem('auth_token', data.token);
        console.log(' LOGIN DEBUG: Token saved from data.token:', data.token.substring(0, 20) + '...');
    } else {
        console.log(' LOGIN DEBUG: NO TOKEN FOUND IN LOGIN DATA!');
    }
    
    // CRITICAL DEBUGGING: Verify it was saved
    const savedToken = localStorage.getItem('auth_token');
    console.log(' LOGIN DEBUG: Token verification - savedToken:', savedToken ? savedToken.substring(0, 20) + '...' : 'NULL');
    
    setUser(data.user || data);
    setIsLoading(false);
  };

  const logout = async () => {
    localStorage.removeItem('auth_token'); 
    setUser(null);
    try {
        await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, { method: 'POST' });
    } catch(e) {}
    window.location.href = '/auth';
  };

  const updateUserRole = async (role: 'BRAND' | 'CREATOR') => {
    if (!user) return;
    const token = localStorage.getItem('auth_token');
    
    setUser({ ...user, role });
    
    await fetch(`${import.meta.env.VITE_API_URL}/api/users/role`, {
      method: 'PUT',
      headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
      },
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
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
