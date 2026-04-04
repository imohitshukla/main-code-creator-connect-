import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiCall } from '../utils/apiHelper';

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
  token: string | null; // 🆕 Expose token
  isLoading: boolean;
  login: (data: any) => void;
  logout: () => void;
  updateUserRole: (role: 'BRAND' | 'CREATOR') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('auth_token')); // 🆕 State for token
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      // 🛡️ STOP GAP: If user explicitly logged out, don't auto-restore even if cookie exists
      if (localStorage.getItem('explicit_logout')) {
        setIsLoading(false);
        return;
      }

      const storedToken = localStorage.getItem('auth_token');

      // No token means user is logged out — skip the API call entirely to avoid 401 console errors
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        setToken(storedToken); // Sync state immediately

        const res = await apiCall('/api/auth/me');

        if (res.ok) {
          const data = await res.json();
          // Normalize role to Uppercase
          if (data.user && data.user.role) {
            data.user.role = data.user.role.toUpperCase();
          }
          setUser(data.user);
        } else if (res.status === 401) {
          // Only treat 401 as "logged out" — server explicitly rejected the token
          localStorage.removeItem('auth_token');
          setToken(null);
          setUser(null);
        } else {
          // 500 / network error / server down — DO NOT log the user out.
          // Fall back to the stored token so ProtectedRoute keeps them in.
          if (storedToken) {
            // Reconstruct a minimal user from localStorage if available
            const cachedUser = localStorage.getItem('cached_user');
            if (cachedUser) {
              try { setUser(JSON.parse(cachedUser)); } catch (_) { }
            }
            // User stays on protected page; the real /api/auth/me will succeed next load
          } else {
            setUser(null);
          }
        }
      } catch (error) {
        // Network completely down — do NOT kick user out if they have a token
        console.warn('Auth check failed (network/server error). Keeping session if token exists.', error);
        if (storedToken) {
          const cachedUser = localStorage.getItem('cached_user');
          if (cachedUser) {
            try { setUser(JSON.parse(cachedUser)); } catch (_) { }
          }
        } else {
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = (data: any) => {
    // CRITICAL DEBUGGING: Let's see what we're receiving
    console.log('🔍 LOGIN DEBUG: Login data received:', data);

    // 🛡️ CLEAR LOGOUT FLAG
    localStorage.removeItem('explicit_logout');

    // 🚨 EMERGENCY: Force save token if found anywhere
    const tokenToSave = data.user?.token || data.token;
    if (tokenToSave) {
      localStorage.setItem('auth_token', tokenToSave);
      setToken(tokenToSave); // Update state
      console.log('✅ LOGIN DEBUG: Token saved:', tokenToSave.substring(0, 20) + '...');
    } else {
      console.log('❌ LOGIN DEBUG: NO TOKEN FOUND IN LOGIN DATA!');
    }

    // 🚨 EMERGENCY: Force user state update
    const userObj = data.user || data;
    // Normalize role
    if (userObj && userObj.role) {
      userObj.role = userObj.role.toUpperCase();
    }
    setUser(userObj);
    setIsLoading(false);

    // Cache user object for fallback restoration during server errors
    try { localStorage.setItem('cached_user', JSON.stringify(userObj)); } catch (_) { }
  };

  const logout = async () => {
    // 🛡️ SET LOGOUT FLAG
    localStorage.setItem('explicit_logout', 'true');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('cached_user'); // Clear cached user on logout
    localStorage.removeItem('intended_role'); // Clean up partial states
    setUser(null);
    setToken(null);
    try {
      await apiCall('/api/auth/logout', {
        method: 'POST'
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
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, updateUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
