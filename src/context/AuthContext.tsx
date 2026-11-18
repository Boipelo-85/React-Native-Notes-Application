import { createContext, useContext, useState, type ReactNode } from 'react';

import { checkLogin, updateAccount } from '../services/authService';
import type { User } from '../types/user';

type Auth = {
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  updateProfile: (name: string, passwordChange?: { current: string; next: string }) => Promise<boolean>;
  signOut: () => void;
};

const AuthContext = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  async function signIn(email: string, password: string) {
    const account = await checkLogin(email, password);
    if (!account) return false;

    setUser(account);
    return true;
  }

  async function updateProfile(name: string, passwordChange?: { current: string; next: string }) {
    if (!user) return false;

    const updated = await updateAccount(user.email, name, passwordChange);
    if (!updated) return false;

    setUser((activeUser) => activeUser === user ? updated : activeUser);
    return true;
  }

  return (
    <AuthContext.Provider value={{ user, signIn, updateProfile, signOut: () => setUser(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth requires an AuthProvider.');
  return auth;
}
