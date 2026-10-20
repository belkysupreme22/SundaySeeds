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
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName: string) => Promise<AuthResult>;
  requestRecovery: (email: string) => Promise<AuthResult>;
  resendVerification: () => Promise<AuthResult>;
  checkVerification: () => Promise<AuthResult>;
  signOut: (expectedUserId?: string) => Promise<AuthResult>;
  retryProfile: () => Promise<AuthResult>;
  saveProfileName: (name: string) => Promise<AuthResult>;
  getValidatedActor: () => Promise<ValidatedAccountActor | null>;
};
