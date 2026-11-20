import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { checkLogin, loadAccountProfile, registerAccount, updateAccount } from '../services/authService';
import { readStored, removeStored, writeStored } from '../services/storage';
import type { User } from '../types/user';

type Auth = {
  user: User | null;
  restoring: boolean;
  signUp: (name: string, email: string, password: string) => Promise<'signed-in' | 'duplicate' | 'created'>;
  signIn: (email: string, password: string) => Promise<boolean>;
  updateProfile: (name: string, passwordChange?: { current: string; next: string }) => Promise<boolean>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<Auth | null>(null);
const sessionKey = '@notes/session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(true);

  useEffect(() => {
    let active = true;
    readStored<string>(sessionKey)
      .then((email) => typeof email === 'string' ? loadAccountProfile(email) : null)
      .then(
        (account) => { if (active) setUser(account); },
        () => { if (active) setUser(null); },
      )
      .finally(() => { if (active) setRestoring(false); });
    return () => { active = false; };
  }, []);

  async function startSession(account: User) {
    await writeStored(sessionKey, account.email);
    setUser(account);
  }

  async function signIn(email: string, password: string) {
    const account = await checkLogin(email, password);
    if (!account) return false;

    await startSession(account);
    return true;
  }

  async function signUp(name: string, email: string, password: string) {
    const account = await registerAccount(name, email, password);
    if (!account) return 'duplicate';

    try {
      await startSession(account);
      return 'signed-in';
    } catch {
      return 'created';
    }
  }

  async function signOut() {
    await removeStored(sessionKey);
    setUser(null);
  }

  async function updateProfile(name: string, passwordChange?: { current: string; next: string }) {
    if (!user) return false;

    const updated = await updateAccount(user.email, name, passwordChange);
    if (!updated) return false;

    setUser((activeUser) => activeUser === user ? updated : activeUser);
    return true;
  }

  return (
    <AuthContext.Provider value={{ user, restoring, signUp, signIn, updateProfile, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth requires an AuthProvider.');
  return auth;
}
