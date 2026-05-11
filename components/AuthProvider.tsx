'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { getCurrentUser, signOut as authSignOut } from '@/lib/auth';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  refresh: () => void;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  refresh: () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setUser(getCurrentUser());
    setLoading(false);
  }

  useEffect(() => {
    refresh();
  }, []);

  function signOut() {
    authSignOut();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
