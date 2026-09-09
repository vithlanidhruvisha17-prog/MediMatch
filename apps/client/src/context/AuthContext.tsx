import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface AuthUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'PATIENT' | string;
  fullName?: string;
  phone?: string;
  age?: number | null;
  gender?: string | null;
  city?: string;
  budgetCap?: number;
  createdAt?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAdmin: boolean;
  isPatient: boolean;
  adminUser: { id: string; email: string } | null;
  isLoading: boolean;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
  updateUser: (updatedData: Partial<AuthUser>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('medimatch_token') || localStorage.getItem('medimatch_admin_token');
      const storedUser = localStorage.getItem('medimatch_user') || localStorage.getItem('medimatch_admin_user');

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(parsedUser);

          // Verify session validity against server
          const res = await apiClient.get('/auth/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          if (res.data?.user) {
            setUser(res.data.user);
            localStorage.setItem('medimatch_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Session verification failed, resetting auth state');
          localStorage.removeItem('medimatch_token');
          localStorage.removeItem('medimatch_user');
          localStorage.removeItem('medimatch_admin_token');
          localStorage.removeItem('medimatch_admin_user');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newUser: AuthUser) => {
    localStorage.setItem('medimatch_token', newToken);
    localStorage.setItem('medimatch_user', JSON.stringify(newUser));
    if (newUser.role === 'ADMIN') {
      localStorage.setItem('medimatch_admin_token', newToken);
      localStorage.setItem('medimatch_admin_user', JSON.stringify(newUser));
    }
    setToken(newToken);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('medimatch_token');
    localStorage.removeItem('medimatch_user');
    localStorage.removeItem('medimatch_admin_token');
    localStorage.removeItem('medimatch_admin_user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updatedData: Partial<AuthUser>) => {
    setUser((prev) => {
      if (!prev) return null;
      const updated = { ...prev, ...updatedData };
      localStorage.setItem('medimatch_user', JSON.stringify(updated));
      return updated;
    });
  };

  const isAdmin = user?.role === 'ADMIN';
  const isPatient = user?.role === 'PATIENT';
  const adminUser = isAdmin && user ? { id: user.id, email: user.email } : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAdmin,
        isPatient,
        adminUser,
        isLoading,
        login,
        logout,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

