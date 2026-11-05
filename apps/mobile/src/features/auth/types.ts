import type { AuthMessage } from './data/authMessages';

export type AccountIdentity = {
  id: string;
  email: string;
  verified: boolean;
};

export type AccountProfile = {
  userId: string;
  displayName: string | null;
  revision: number;
  updatedAt: string;
};

export type AuthResult = { ok: boolean; message: string };
export type LocalizedAuthResult = AuthResult & AuthMessage;

// Feature hooks use a pinned, validated actor; screens never receive credentials.
export type ValidatedAccountActor = {
  userId: string;
  accessToken: string;
  isCurrent: () => boolean;
};

export type AuthContextValue = {
  user: AccountIdentity | null;
  profile: AccountProfile | null;
  pendingEmail: string | null;
  configured: boolean;
  hydrated: boolean;
  busy: boolean;
  error: string | null;
  profileError: string | null;
  signIn: (email: string, password: string) => Promise<LocalizedAuthResult>;
  signUp: (email: string, password: string, displayName: string) => Promise<LocalizedAuthResult>;
  requestRecovery: (email: string) => Promise<LocalizedAuthResult>;
  resendVerification: () => Promise<LocalizedAuthResult>;
  checkVerification: () => Promise<LocalizedAuthResult>;
  signOut: (expectedUserId?: string) => Promise<LocalizedAuthResult>;
  retryProfile: () => Promise<LocalizedAuthResult>;
  saveProfileName: (name: string) => Promise<LocalizedAuthResult>;
  getValidatedActor: () => Promise<ValidatedAccountActor | null>;
};
