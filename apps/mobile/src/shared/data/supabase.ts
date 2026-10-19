import 'react-native-url-polyfill/auto';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const CHUNK_LENGTH = 400;
const MAX_CHUNKS = 128;
const secureOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};
const storageOperations = new Map<string, Promise<void>>();

type Bank = '0' | '1';
type Manifest = Bank | 'signed-out' | null;

// Serialize reads and writes per SDK storage key, including its PKCE verifier key.
function withStorage<T>(key: string, operation: () => Promise<T>): Promise<T> {
  const result = (storageOperations.get(key) ?? Promise.resolve()).then(operation).catch(() => {
    // Do not include native errors: they may contain credential payloads.
    throw new Error('Account session storage is unavailable. Please try again.');
  });
  const settled = result.then(
    () => undefined,
    () => undefined,
  );
  storageOperations.set(key, settled);
  void settled.then(() => {
    if (storageOperations.get(key) === settled) storageOperations.delete(key);
  });
  return result;
}

async function readManifest(key: string): Promise<Manifest> {
  const value = await SecureStore.getItemAsync(`${key}.active`, secureOptions);
  if (value === null || value === '0' || value === '1' || value === 'signed-out') {
    return value;
  }
  throw new Error('Invalid storage manifest.');
}

async function readCount(key: string, bank: Bank): Promise<number | null> {
  const value = await SecureStore.getItemAsync(`${key}.${bank}.count`, secureOptions);
  if (value === null) return null;
  const count = Number(value);
  if (!Number.isInteger(count) || count < 1 || count > MAX_CHUNKS) {
    throw new Error('Invalid storage chunk count.');
  }
  return count;
}

async function clearBank(key: string, bank: Bank): Promise<void> {
  const count = await readCount(key, bank);
  if (count === null) return;
  for (let index = 0; index < count; index += 1) {
    await SecureStore.deleteItemAsync(`${key}.${bank}.${index}`, secureOptions);
  }
  await SecureStore.deleteItemAsync(`${key}.${bank}.count`, secureOptions);
}

function splitValue(value: string): string[] {
  const chunks: string[] = [];
  let chunk = '';
  for (const character of value) {
    if (chunk.length + character.length > CHUNK_LENGTH) {
      chunks.push(chunk);
      chunk = '';
    }
    chunk += character;
  }
  chunks.push(chunk);
  if (chunks.length > MAX_CHUNKS) throw new Error('Session exceeds storage capacity.');
  return chunks;
}

// Each native value stays below historical ~2KB Keychain payload limits, even
// with non-ASCII metadata. The active bank changes only after every part is saved.
const nativeStorage = {
  getItem(key: string): Promise<string | null> {
    return withStorage(key, async () => {
      const active = await readManifest(key);
      if (active === null || active === 'signed-out') return null;
      const count = await readCount(key, active);
      if (count === null) throw new Error('Missing storage chunk count.');
      const parts: string[] = [];
      for (let index = 0; index < count; index += 1) {
        const part = await SecureStore.getItemAsync(`${key}.${active}.${index}`, secureOptions);
        if (part === null) throw new Error('Incomplete stored session.');
        parts.push(part);
      }
      return parts.join('');
    });
  },
  setItem(key: string, value: string): Promise<void> {
    return withStorage(key, async () => {
      const chunks = splitValue(value);
      const active = await readManifest(key);
      const next: Bank = active === '0' ? '1' : '0';
      await clearBank(key, next);
      // Record the planned count first so an interrupted write can be removed.
      await SecureStore.setItemAsync(`${key}.${next}.count`, String(chunks.length), secureOptions);
      for (let index = 0; index < chunks.length; index += 1) {
        await SecureStore.setItemAsync(`${key}.${next}.${index}`, chunks[index], secureOptions);
      }
      await SecureStore.setItemAsync(`${key}.active`, next, secureOptions);
      // The new session is already durable. Garbage-collection failure must not
      // make auth-js report failure without publishing its successful sign-in.
      // A later write reclaims that inactive bank before reusing it.
      if (active === '0' || active === '1') await clearBank(key, active).catch(() => undefined);
    });
  },
  removeItem(key: string): Promise<void> {
    return withStorage(key, async () => {
      // A failed cleanup must not restore an older session on the next read.
      await SecureStore.setItemAsync(`${key}.active`, 'signed-out', secureOptions);
      // Durable invalidation succeeded. Failed physical cleanup can leave
      // unreachable encrypted parts; retain the tombstone and retry on reuse.
      const cleanup = await Promise.allSettled([clearBank(key, '0'), clearBank(key, '1')]);
      if (cleanup.every((result) => result.status === 'fulfilled')) {
        await SecureStore.deleteItemAsync(`${key}.active`, secureOptions).catch(() => undefined);
      }
    });
  },
};

// Browser sessions last for this tab only. Blocked/quota storage errors propagate;
// there is no fallback that silently claims durable or encrypted persistence.
function createWebStorage(namespace: string) {
  // auth-js broadcasts by storageKey even with a sessionStorage adapter. Give
  // this page its own channel so another tab cannot replace its displayed actor.
  // Map back to a stable key in this tab's storage to support ordinary reloads.
  const storageKey = `${namespace}.${Date.now()}.${Math.random().toString(36).slice(2)}`;
  function tabKey(key: string): string {
    if (!key.startsWith(storageKey)) throw new Error('Unexpected account storage key.');
    return namespace + key.slice(storageKey.length);
  }
  return {
    storageKey,
    storage: {
      getItem(key: string): Promise<string | null> {
        return withStorage(key, async () => window.sessionStorage.getItem(tabKey(key)));
      },
      setItem(key: string, value: string): Promise<void> {
        return withStorage(key, async () => window.sessionStorage.setItem(tabKey(key), value));
      },
      removeItem(key: string): Promise<void> {
        return withStorage(key, async () => window.sessionStorage.removeItem(tabKey(key)));
      },
    },
  };
}

function configuredUrl(value: string | undefined): URL | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
    if (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) return null;
    if (url.username || url.password || url.search || url.hash) return null;
    return url;
  } catch {
    return null;
  }
}

let client: SupabaseClient | null = null;
let isolatedClientCount = 0;

function getConfiguration(): { url: string; key: string } | null {
  const url = configuredUrl(process.env.EXPO_PUBLIC_SUPABASE_URL);
  const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  if (!url || url.pathname !== '/' || !key?.startsWith('sb_publishable_')) return null;
  return { url: url.origin, key };
}

export function getSupabaseClient(): SupabaseClient | null {
  if (client) return client;
  const configuration = getConfiguration();
  if (!configuration) return null;
  const storage =
    Platform.OS === 'web'
      ? createWebStorage(`sundayseeds.account.${new URL(configuration.url).host}`)
      : { storage: nativeStorage };
  client = createClient(configuration.url, configuration.key, {
    auth: {
      ...storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });
  return client;
}

// Candidate identities from signup/email proofs must never replace the primary
// account. Callers retain this client only for the current operation, then clear it.
export function createIsolatedAuthClient(): SupabaseClient | null {
  const configuration = getConfiguration();
  if (!configuration) return null;
  isolatedClientCount += 1;
  return createClient(configuration.url, configuration.key, {
    auth: {
      storageKey: `sundayseeds.email-proof.${isolatedClientCount}`,
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
      flowType: 'pkce',
    },
  });
}

export function getAuthRedirectUrl(kind: 'confirmation' | 'recovery'): string | null {
  const value =
    kind === 'confirmation'
      ? process.env.EXPO_PUBLIC_AUTH_CONFIRMATION_URL
      : process.env.EXPO_PUBLIC_AUTH_RECOVERY_URL;
  return configuredUrl(value)?.toString() ?? null;
}
