import type { SupabaseClient } from '@supabase/supabase-js';
import { createIsolatedAuthClient } from '../../../shared/data/supabase';

export type ProofResult = { ok: boolean; message: string; email?: string; userId?: string };

// Proofs and candidate sessions exist only in this object, never primary storage.
export function createEmailProof(kind: 'confirmation' | 'recovery', tokenHash: string) {
  let candidate: SupabaseClient | null = null;
  let disposed = false;
  let inFlight = false;
  let subject: { email: string; id: string } | null = null;
  async function clear(previous = candidate) {
    if (candidate === previous) {
      candidate = null;
      subject = null;
    }
    if (previous) {
      try {
        await previous.auth.signOut({ scope: 'local' });
      } catch {
        /* Ephemeral only. */
      } finally {
        try {
          await previous.auth.dispose();
        } catch {
          /* No background session is retained. */
        }
      }
    }
  }
  return {
    async begin(): Promise<ProofResult> {
      if (disposed || candidate)
        return { ok: false, message: 'Request a new email link to continue.' };
      candidate = createIsolatedAuthClient();
      if (!candidate) return { ok: false, message: 'Account setup is not configured yet.' };
      const operationClient = candidate;
      inFlight = true;
      try {
        const { data, error } = await operationClient.auth.verifyOtp({
          token_hash: tokenHash,
          type: kind === 'confirmation' ? 'email' : 'recovery',
        });
        tokenHash = '';
        if (disposed || error || !data.session || !data.user?.email) {
          await clear(operationClient);
          return {
            ok: false,
            message:
              'This link could not be verified. It may have expired or already been used. Request a new email.',
          };
        }
        if (kind === 'confirmation') {
          const confirmed = !!data.user.email_confirmed_at;
          await clear();
          return {
            ok: confirmed,
            message: confirmed
              ? 'Email verified. Return to SundaySeeds and sign in to continue.'
              : 'Verification is incomplete. Request a new email.',
          };
        }
        subject = { id: data.user.id, email: data.user.email };
        return {
          ok: true,
          message: 'Choose a new password for this account.',
          email: subject.email,
        };
      } catch {
        tokenHash = '';
        await clear(operationClient);
        return {
          ok: false,
          message: 'The link could not be checked. Request a new email and try again.',
        };
      } finally {
        inFlight = false;
        if (disposed) await clear(operationClient);
      }
    },
    async reset(password: string): Promise<ProofResult> {
      const current = candidate;
      const account = subject;
      if (disposed || !current || !account || password.length < 15) {
        return {
          ok: false,
          message: 'Use a valid recovery link and a password of at least 15 characters.',
        };
      }
      inFlight = true;
      try {
        const { data, error } = await current.auth.updateUser({ password });
        if (error || data.user?.id !== account.id) {
          return {
            ok: false,
            message:
              'The password could not be changed. Try again or request a new recovery email.',
          };
        }
        // Report password success separately from provider session revocation.
        let revoked = false;
        try {
          revoked = !(await current.auth.signOut({ scope: 'global' })).error;
        } catch {
          /* Report below. */
        }
        await clear(current);
        return {
          ok: true,
          userId: account.id,
          message: revoked
            ? 'Password changed. Sign in again with your new password. Existing access tokens may remain valid until they expire.'
            : 'Password changed. Sign in again with your new password. Other sessions could not be confirmed signed out.',
        };
      } catch {
        return {
          ok: false,
          message: 'The password could not be changed. Check your connection and try again.',
        };
      } finally {
        inFlight = false;
        if (disposed) await clear(current);
      }
    },
    dispose() {
      disposed = true;
      tokenHash = '';
      if (!inFlight) void clear();
    },
  };
}
