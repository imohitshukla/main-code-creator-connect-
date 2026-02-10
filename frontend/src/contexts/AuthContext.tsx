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
          console.log('🔍 DEBUG: Session check - No valid session, trying localStorage fallback');
          
          // 🚨 FALLBACK: Try localStorage token
          const fallbackToken = localStorage.getItem('auth_token');
          if (fallbackToken) {
            console.log('🔍 DEBUG: Found fallback token in localStorage');
            
            // Try to validate token with a simple decode (not secure, just for UI)
            try {
              const tokenParts = fallbackToken.split('.');
              if (tokenParts.length === 3) {
                const payload = JSON.parse(atob(tokenParts[1]));
                console.log('🔍 DEBUG: Fallback token payload:', payload);
                
                // Set user from token payload (temporary until backend validates)
                setUser({
                  id: payload.id,
                  email: payload.email,
                  role: payload.role,
                  token: fallbackToken
                });
                console.log('🔍 DEBUG: User restored from localStorage fallback');
              }
            } catch (tokenError) {
              console.error('❌ Fallback token decode failed:', tokenError);
              localStorage.removeItem('auth_token');
              setUser(null);
            }
          } else {
            console.log('🔍 DEBUG: No fallback token found');
            setUser(null); // Valid logout (cookie expired or missing)
          }
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

  // 2. Manual Login Helper with Cookie Fallback
  const login = (userData: User) => {
    console.log('🔍 DEBUG: Login - Setting user:', userData);
    
    // 🚨 CRITICAL: Store token in localStorage as fallback if cookies fail
    if (userData.token) {
      localStorage.setItem('auth_token', userData.token);
      console.log('🔍 DEBUG: Login - Token stored in localStorage as fallback');
    }
    
    setUser(userData);
    setIsLoading(false);
  };

  // 3. Manual Logout Helper with Cleanup
  const logout = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, { 
        method: 'POST',
        credentials: 'include' 
      });
    } catch(e) { console.error(e); }
    
    // 🚨 CRITICAL: Clear all authentication data
    setUser(null);
    localStorage.removeItem('auth_token'); // Clear fallback token
    console.log('🔍 DEBUG: Logout - Cleared user and localStorage token');
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
