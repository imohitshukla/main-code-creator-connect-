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
      // 🛡️ STOP GAP: If user explicitly logged out, don't auto-restore even if cookie exists
      if (localStorage.getItem('explicit_logout')) {
        setIsLoading(false);
        return;
      }

      try {
        const storedToken = localStorage.getItem('auth_token');

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (storedToken) {
          headers['Authorization'] = `Bearer ${storedToken}`;
        }

        const res = await fetch('http://localhost:5000/api/auth/me', {
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
    console.log('🔍 LOGIN DEBUG: Login data received:', data);
    console.log('🔍 LOGIN DEBUG: data.token:', data.token);
    console.log('🔍 LOGIN DEBUG: data.user?.token:', data.user?.token);

    // 🛡️ CLEAR LOGOUT FLAG
    localStorage.removeItem('explicit_logout');

    // 🚨 EMERGENCY: Force save token if found anywhere
    const tokenToSave = data.user?.token || data.token;
    if (tokenToSave) {
      localStorage.setItem('auth_token', tokenToSave);
      console.log('✅ LOGIN DEBUG: Token saved:', tokenToSave.substring(0, 20) + '...');
    } else {
      console.log('❌ LOGIN DEBUG: NO TOKEN FOUND IN LOGIN DATA!');
      console.log('❌ LOGIN DEBUG: Full data object:', JSON.stringify(data, null, 2));
    }

    // 🚨 EMERGENCY: Verify it was saved
    const savedToken = localStorage.getItem('auth_token');
    console.log('🔍 LOGIN DEBUG: Token verification - savedToken:', savedToken ? savedToken.substring(0, 20) + '...' : 'NULL');

    // 🚨 EMERGENCY: Force user state update
    setUser(data.user || data);
    setIsLoading(false);

    // 🚨 EMERGENCY: Immediate verification
    console.log('🔍 LOGIN DEBUG: User state set to:', data.user || data);
    console.log('🔍 LOGIN DEBUG: isLoading set to: false');
  };

  const logout = async () => {
    // 🛡️ SET LOGOUT FLAG
    localStorage.setItem('explicit_logout', 'true');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('intended_role'); // Clean up partial states
    setUser(null);
    try {
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include' // 🛡️ CRITICAL: Allow verifying/modifying cookies
      });
    } catch (e) {
      console.error("Logout API call failed", e);
    }
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
