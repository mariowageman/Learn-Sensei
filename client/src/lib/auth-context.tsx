import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { RBACUser, UserRole, hasPermission } from './rbac';

interface AuthContextType {
  user: RBACUser | null;
  isLoading: boolean;
  login: (user: RBACUser) => void;
  logout: () => void;
  hasPermission: (action: string, subject: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<RBACUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/user', {
          credentials: 'include'
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData: RBACUser) => {
    setUser(userData);
    toast({
      title: "Success!",
      description: "You have successfully logged in.",
    });
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });

      if (response.ok) {
        setUser(null);
        toast({
          title: "Success",
          description: "You have been logged out.",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to logout. Please try again.",
      });
    }
  };

  const checkPermission = (action: string, subject: string): boolean => {
    if (!user) return false;
    return hasPermission(user.role, action, subject);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout,
      hasPermission: checkPermission
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}