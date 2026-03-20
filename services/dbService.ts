
import initialDb from '../db.json';
import { STORAGE_KEYS } from '../constants';

const DB_STORAGE_KEY = STORAGE_KEYS.DB;

export interface DbUser {
  patientName: string;
  patientCode: string;
  passwordHash: string;
  createdAt: string;
}

export interface Database {
  version: string;
  users: DbUser[];
}

/** Load the database from localStorage, seeding from db.json on first run. */
export function getDb(): Database {
  const stored = localStorage.getItem(DB_STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored) as Database;
  }
  const seed: Database = { version: initialDb.version, users: [] };
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(seed));
  return seed;
}

/** Persist the database to localStorage. */
export function saveDb(db: Database): void {
  localStorage.setItem(DB_STORAGE_KEY, JSON.stringify(db));
}

/** Return all registered users. */
export function getUsers(): DbUser[] {
  return getDb().users;
}

/** Find a user by patient name (case-insensitive). */
export function findUserByName(name: string): DbUser | undefined {
  return getUsers().find(
    u => u.patientName.toLowerCase() === name.toLowerCase()
  );
}

/** Append a new user to the database. */
export function addUser(user: DbUser): void {
  const db = getDb();
  db.users.push(user);
  saveDb(db);
}

/** Hash a plain-text password using SHA-256 via the Web Crypto API. */
export async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
