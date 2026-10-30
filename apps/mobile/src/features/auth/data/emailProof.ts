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
          const errCode =
            error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
              ? error.code
              : '';
          if (errCode === 'otp_expired') {
            return {
              ok: false,
              message: 'This email link has expired. Request a new email to continue.',
            };
          }
          if (errCode === 'otp_disabled') {
            return {
              ok: false,
              message:
                'This email link has already been used or is disabled. Request a new email.',
            };
          }
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
      } catch (err) {
        tokenHash = '';
        await clear(operationClient);
        const isNetwork =
          err instanceof TypeError ||
          (err &&
            typeof err === 'object' &&
            'message' in err &&
            typeof (err as { message: unknown }).message === 'string' &&
            /network|fetch|connect|timeout/i.test((err as { message: string }).message));
        return {
          ok: false,
          message: isNetwork
            ? 'The link could not be checked. Check your connection and try again.'
            : 'The link could not be checked. Request a new email and try again.',
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
          const errCode =
            error && typeof error === 'object' && 'code' in error && typeof error.code === 'string'
              ? error.code
              : '';
          const errMsg =
            error && typeof error === 'object' && 'message' in error && typeof error.message === 'string'
              ? error.message
              : '';
          if (errCode === 'same_password' || /same_password|different from the old/i.test(errMsg)) {
            return {
              ok: false,
              message: 'Your new password must be different from your previous password.',
            };
          }
          if (errCode === 'weak_password') {
            return {
              ok: false,
              message: 'Choose a longer passphrase that meets the account password requirements.',
            };
          }
          if (errCode === 'over_request_rate_limit') {
            return {
              ok: false,
              message: 'Too many requests were made. Wait a few minutes before trying again.',
            };
          }
          const isNetwork =
            /network|fetch|timeout|connection/i.test(errMsg) || error instanceof TypeError;
          if (isNetwork) {
            return {
              ok: false,
              message: 'The password could not be changed. Check your connection and try again.',
            };
          }
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
