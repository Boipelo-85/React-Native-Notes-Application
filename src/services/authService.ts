import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { getRandomBytesAsync } from 'expo-crypto';

import type { User } from '../types/user';
import { readStored, writeStored } from './storage';

//Assigning the user account section here
type Account = User & { salt: string; verifier: string };
const pendingRegistrations = new Set<string>();
const pendingUpdates = new Set<string>();

//Email to check the account key section 
function accountKey(email: string) {
  return `@notes/account/${encodeURIComponent(email.trim().toLowerCase())}`;
}


function deriveVerifier(password: string, salt: Uint8Array) {
  return pbkdf2Async(sha256, password, salt, { c: 600_000, dkLen: 32 });
}

//User creating account section here. providing a name,email and password and also verifying section
export async function registerAccount(name: string, email: string, password: string): Promise<User | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const key = accountKey(normalizedEmail);
  if (pendingRegistrations.has(key)) return null;

  pendingRegistrations.add(key);
  try {
    if (await readStored<Account>(key)) return null;

    const salt = await getRandomBytesAsync(16);
    const verifier = await deriveVerifier(password, salt);
    const user = { name: name.trim(), email: normalizedEmail };
    await writeStored<Account>(key, {
      ...user,
      salt: bytesToHex(salt),
      verifier: bytesToHex(verifier),
    });
    return user;
  } finally {
    pendingRegistrations.delete(key);
  }
}


//Check the Login credential section here
export async function checkLogin(email: string, password: string): Promise<User | null> {
  const account = await readStored<Account>(accountKey(email));
  if (!account) return null;

  return await matchesPassword(account, password) ? { name: account.name, email: account.email } : null;
}

export async function loadAccountProfile(email: string): Promise<User | null> {
  const account = await readStored<Account>(accountKey(email));
  return account ? { name: account.name, email: account.email } : null;
}

async function matchesPassword(account: Account, password: string) {
  const storedVerifier = hexToBytes(account.verifier);
  const candidate = await deriveVerifier(password, hexToBytes(account.salt));
  let difference = storedVerifier.length ^ candidate.length;
  for (let index = 0; index < candidate.length; index++) {
    difference |= storedVerifier[index] ^ candidate[index];
  }
  return difference === 0;
}

export async function updateAccount(
  email: string,
  name: string,
  passwordChange?: { current: string; next: string },
): Promise<User | null> {
  const key = accountKey(email);
  if (pendingUpdates.has(key)) throw new Error('A profile update is already in progress.');

  pendingUpdates.add(key);
  try {
    const account = await readStored<Account>(key);
    if (!account) throw new Error('Account could not be loaded.');

    const next = { ...account, name: name.trim() };
    if (passwordChange) {
      if (!(await matchesPassword(account, passwordChange.current))) return null;

      const salt = await getRandomBytesAsync(16);
      next.salt = bytesToHex(salt);
      next.verifier = bytesToHex(await deriveVerifier(passwordChange.next, salt));
    }

    await writeStored(key, next);
    return { name: next.name, email: next.email };
  } finally {
    pendingUpdates.delete(key);
  }
}
