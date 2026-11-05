import type { SupabaseClient } from '@supabase/supabase-js';
import { createIsolatedAuthClient } from '../../../shared/data/supabase';
import type { LocalizedAuthResult } from '../types';
import { authResult } from './authMessages';

export type ProofResult = LocalizedAuthResult & { email?: string; userId?: string };

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
      if (disposed || candidate) return authResult(false, 'requestNewLink');
      candidate = createIsolatedAuthClient();
      if (!candidate) return authResult(false, 'proofUnavailable');
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
            return authResult(false, 'expiredLink');
          }
          if (errCode === 'otp_disabled') {
            return authResult(false, 'disabledLink');
          }
          return authResult(false, 'unverifiedLink');
        }
        if (kind === 'confirmation') {
          const confirmed = !!data.user.email_confirmed_at;
          await clear();
          return authResult(
            confirmed,
            confirmed ? 'emailVerifiedReturn' : 'verificationIncomplete',
          );
        }
        subject = { id: data.user.id, email: data.user.email };
        return {
          ...authResult(true, 'chooseNewPassword'),
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
        return authResult(false, isNetwork ? 'linkConnectionFailed' : 'linkCheckFailed');
      } finally {
        inFlight = false;
        if (disposed) await clear(operationClient);
      }
    },
    async reset(password: string): Promise<ProofResult> {
      const current = candidate;
      const account = subject;
      if (disposed || !current || !account || password.length < 15) {
        return authResult(false, 'recoveryLinkAndPassword');
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
            return authResult(false, 'samePassword');
          }
          if (errCode === 'weak_password') {
            return authResult(false, 'weakPassword');
          }
          if (errCode === 'over_request_rate_limit') {
            return authResult(false, 'rateLimited');
          }
          const isNetwork =
            /network|fetch|timeout|connection/i.test(errMsg) || error instanceof TypeError;
          if (isNetwork) {
            return authResult(false, 'passwordChangeConnectionFailed');
          }
          return authResult(false, 'passwordChangeFailed');
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
          ...authResult(true, revoked ? 'passwordChanged' : 'passwordChangedRevocationUnconfirmed'),
          userId: account.id,
        };
      } catch {
        return authResult(false, 'passwordChangeConnectionFailed');
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
