
import initialDb from '../db.json';
import { STORAGE_KEYS } from '../constants';

const DB_STORAGE_KEY = STORAGE_KEYS.DB;

/** Iterations for PBKDF2 key derivation — high enough to slow brute-force. */
const PBKDF2_ITERATIONS = 100_000;

export interface DbUser {
  patientName: string;
  patientCode: string;
  /** Stored as "<saltHex>:<hashHex>" produced by PBKDF2-HMAC-SHA-256. */
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
    try {
      const parsed = JSON.parse(stored) as unknown;
      if (
        parsed !== null &&
        typeof parsed === 'object' &&
        'version' in parsed &&
        'users' in parsed &&
        Array.isArray((parsed as Database).users)
      ) {
        return parsed as Database;
      }
    } catch {
      // Corrupted data — fall through to re-seed
    }
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

/** Encode a Uint8Array as a lowercase hex string. */
function toHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Hash a plain-text password using PBKDF2-HMAC-SHA-256 with a random salt.
 * Returns the result as "<saltHex>:<hashHex>" for storage.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return `${toHex(salt)}:${toHex(new Uint8Array(hashBuffer))}`;
}

/**
 * Verify a plain-text password against a stored PBKDF2 hash.
 * The stored value must be in "<saltHex>:<hashHex>" format.
 */
export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [saltHex, expectedHex] = parts;
  const salt = new Uint8Array(
    (saltHex.match(/.{2}/g) ?? []).map(b => parseInt(b, 16)),
  );
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  );
  const hashBuffer = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    256,
  );
  return toHex(new Uint8Array(hashBuffer)) === expectedHex;
}
