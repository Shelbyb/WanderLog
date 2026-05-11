/**
 * Simulated auth layer using localStorage.
 * In production: replace with NextAuth.js + a real database.
 * 
 * NextAuth setup is documented in README — all interfaces here
 * map 1:1 to NextAuth's Session / User types.
 */
import { User, AuthSession } from './types';
import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'wanderlog_users';
const SESSION_KEY = 'wanderlog_session';

// ─── User store ───────────────────────────────────────────────────────────────

function getUsers(): User[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
  catch { return []; }
}

function saveUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Passwords stored as a separate map (never expose in User object)
function getPasswords(): Record<string, string> {
  try { return JSON.parse(localStorage.getItem('wanderlog_passwords') || '{}'); }
  catch { return {}; }
}

function savePasswords(p: Record<string, string>) {
  localStorage.setItem('wanderlog_passwords', JSON.stringify(p));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getCurrentSession(): AuthSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function getCurrentUser(): User | null {
  return getCurrentSession()?.user ?? null;
}

export function signUp(name: string, email: string, password: string): { user: User } | { error: string } {
  const users = getUsers();
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { error: 'An account with this email already exists.' };
  }
  const user: User = {
    id: uuidv4(),
    email: email.toLowerCase(),
    name,
    avatar: name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  const passwords = getPasswords();
  passwords[user.id] = password; // In prod: bcrypt hash
  savePasswords(passwords);
  _createSession(user);
  return { user };
}

export function signInWithEmail(email: string, password: string): { user: User } | { error: string } {
  const users = getUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return { error: 'No account found with this email.' };
  const passwords = getPasswords();
  if (passwords[user.id] !== password) return { error: 'Incorrect password.' };
  _createSession(user);
  return { user };
}

/** Simulated Google sign-in — creates/finds account by email */
export function signInWithGoogle(googleProfile: { email: string; name: string; avatar?: string }): { user: User } {
  const users = getUsers();
  let user = users.find(u => u.email.toLowerCase() === googleProfile.email.toLowerCase());
  if (!user) {
    user = {
      id: uuidv4(),
      email: googleProfile.email.toLowerCase(),
      name: googleProfile.name,
      avatar: googleProfile.avatar || googleProfile.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2),
      createdAt: new Date().toISOString(),
    };
    saveUsers([...users, user]);
  }
  _createSession(user);
  return { user };
}

export function signOut() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

export function getUserByEmail(email: string): User | undefined {
  return getUsers().find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

function _createSession(user: User) {
  const session: AuthSession = { user, token: uuidv4() };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  localStorage.setItem(SESSION_KEY, JSON.stringify(session)); // persist across tabs
}
