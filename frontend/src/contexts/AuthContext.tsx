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
  token?: string; // 🚨 CRITICAL: Add token field for fallback storage
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
        // 🍪 DEEP DEBUG: Log all available cookies before request
        console.log('🍪 DEEP DEBUG: Available cookies:', document.cookie);
        console.log('🍪 DEEP DEBUG: localStorage token:', localStorage.getItem('auth_token'));
        
        // 🚨 CRITICAL FIX: 'credentials: include' allows cookie to travel
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // <--- THIS PREVENTS THE LOGOUT ON REFRESH
        });

        console.log('🍪 DEEP DEBUG: /me response status:', res.status);
        console.log('🍪 DEEP DEBUG: /me response headers:', {
          'set-cookie': res.headers.get('set-cookie'),
          'content-type': res.headers.get('content-type')
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Session Restored:", data.user);
          setUser(data.user);
        } else {
          console.log("No active session found");
          
          // 🍪 DEEP FIX: Try token from response body (if cookies failed)
          try {
            const errorData = await res.json();
            if (errorData.token) {
              console.log('🍪 DEEP DEBUG: Found token in error response, using as fallback');
              setUser({
                id: errorData.user?.id || 0,
                email: errorData.user?.email || '',
                role: errorData.user?.role || 'PENDING',
                token: errorData.token
              });
              localStorage.setItem('auth_token', errorData.token);
              return; // Don't set to null
            }
          } catch (jsonError) {
            console.log('🍪 DEEP DEBUG: No token in error response');
          }
          
          // 🍪 DEEP FIX: Try localStorage token as last resort
          const fallbackToken = localStorage.getItem('auth_token');
          if (fallbackToken) {
            console.log('🍪 DEEP DEBUG: Using localStorage token fallback');
            try {
              const tokenParts = fallbackToken.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                setUser({
                  id: payload.id,
                  email: payload.email,
                  role: payload.role,
                  token: fallbackToken
                });
                console.log('🍪 DEEP DEBUG: User restored from localStorage');
                return; // Don't set to null
              }
            } catch (tokenError) {
              console.error('❌ localStorage token decode failed:', tokenError);
              localStorage.removeItem('auth_token');
            }
          }
          
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
    console.log('🍪 DEEP DEBUG: Login - Setting user:', userData);
    
    // 🚨 CRITICAL: Store token in localStorage as fallback if cookies fail
    if (userData.token) {
      localStorage.setItem('auth_token', userData.token);
      console.log('🍪 DEEP DEBUG: Login - Token stored in localStorage as fallback');
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
    localStorage.removeItem('auth_token'); // Clear fallback token
    console.log('🍪 DEEP DEBUG: Logout - Cleared user and localStorage token');
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
