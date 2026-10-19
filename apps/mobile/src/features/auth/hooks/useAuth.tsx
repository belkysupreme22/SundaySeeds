import type { AuthError, Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { AppState, Platform } from 'react-native';
import {
  createIsolatedAuthClient,
  getAuthRedirectUrl,
  getSupabaseClient,
} from '@/shared/data/supabase';
import { accountUnavailable, authFailureMessage, emailRequestAccepted } from '../data/authMessages';
import {
  ensureOwnProfile,
  normalizeAccountName,
  ProfileRequestError,
  updateOwnProfile,
  type ProfileActor,
} from '../data/profileApi';
import type { AccountIdentity, AccountProfile, AuthContextValue, AuthResult } from '../types';

const AuthContext = createContext<AuthContextValue | null>(null);
const sessionChanged = { ok: false, message: 'The account changed. Please try again.' };
const invalidEmail = 'Enter a valid email address.';

function identity(user: User): AccountIdentity {
  return { id: user.id, email: user.email ?? '', verified: Boolean(user.email_confirmed_at) };
}

function validEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email);
}

function invalidAuthResponse(failure: { status?: number; code?: string } | null): boolean {
  return (
    failure?.status === 401 ||
    failure?.status === 403 ||
    ['session_not_found', 'user_not_found', 'bad_jwt', 'jwt_expired'].includes(failure?.code ?? '')
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [client] = useState(getSupabaseClient);
  const [user, setUser] = useState<AccountIdentity | null>(null);
  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(!client);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const mounted = useRef(false);
  const actorId = useRef<string | null>(null);
  const generation = useRef(0);
  const profileRequest = useRef(0);
  const operationInFlight = useRef(false);
  const profileRef = useRef<AccountProfile | null>(null);
  const validatedActor = useRef<{ id: string; version: number } | null>(null);
  const invalidSession = useRef(false);
  const profileConflict = useRef(false);

  const isCurrent = useCallback(
    (actor: string | null, version: number) =>
      mounted.current && actorId.current === actor && generation.current === version,
    [],
  );

  const loadProfile = useCallback(
    async (actor: ProfileActor, version: number): Promise<AuthResult> => {
      if (!client || !isCurrent(actor.userId, version)) return sessionChanged;
      const request = ++profileRequest.current;
      setProfileError(null);
      try {
        const result = await ensureOwnProfile(client, actor);
        if (!isCurrent(actor.userId, version) || request !== profileRequest.current) {
          return sessionChanged;
        }
        profileRef.current = result;
        profileConflict.current = false;
        setProfile(result);
        return { ok: true, message: 'Account profile loaded.' };
      } catch {
        if (!isCurrent(actor.userId, version) || request !== profileRequest.current) {
          return sessionChanged;
        }
        const message =
          'Your account is signed in, but its profile could not be loaded. Try again.';
        setProfileError(message);
        return { ok: false, message };
      }
    },
    [client, isCurrent],
  );

  const rejectValidation = useCallback(
    async (actor: string, version: number, invalid: boolean) => {
      if (!client || !isCurrent(actor, version)) return;
      validatedActor.current = null;
      ++profileRequest.current;
      profileRef.current = null;
      setProfile(null);
      if (!invalid) {
        setUser((previous) => (previous ? { ...previous, verified: false } : null));
        setProfileError(
          'Your account session could not be checked. Check your connection and try again.',
        );
        setError(
          'Your account session could not be checked. Check your connection, then check verification to retry.',
        );
        return;
      }
      invalidSession.current = true;
      setUser(null);
      setError('Your account session has expired. Please sign in again.');
      try {
        await client.auth.signOut({ scope: 'local' });
      } catch {
        if (isCurrent(actor, version))
          setError('Your expired session could not be cleared. Try signing in again to retry.');
      }
    },
    [client, isCurrent],
  );

  useEffect(() => {
    mounted.current = true;
    if (!client)
      return () => {
        mounted.current = false;
      };

    function acceptSession(session: Session | null) {
      if (!mounted.current) return;
      const nextActor = session?.user.id ?? null;
      const changed = actorId.current !== nextActor;
      actorId.current = nextActor;
      const version = ++generation.current;
      ++profileRequest.current;
      validatedActor.current = null;
      profileRef.current = null;
      setProfile(null);
      setProfileError(null);
      if (changed) profileConflict.current = false;
      if (!session) {
        invalidSession.current = false;
        setUser(null);
        setError(null);
        setHydrated(true);
        return;
      }
      // Cached identity is presentation only. Verification is established by getUser below.
      setUser({ ...identity(session.user), verified: false });
      setPendingEmail(null);
      // Leave the auth callback before calling another SDK method.
      setTimeout(() => {
        void (async () => {
          if (!isCurrent(nextActor, version)) return;
          try {
            const { data, error: validationError } = await client!.auth.getUser(
              session.access_token,
            );
            if (!isCurrent(nextActor, version)) return;
            if (validationError || !data.user || data.user.id !== nextActor) {
              await rejectValidation(
                nextActor!,
                version,
                invalidAuthResponse(validationError) || !validationError,
              );
              return;
            }
            validatedActor.current = { id: data.user.id, version };
            setUser(identity(data.user));
            setError(null);
            await loadProfile({ userId: data.user.id, accessToken: session.access_token }, version);
          } catch {
            if (isCurrent(nextActor, version)) {
              setProfileError(
                'Your account session could not be checked. Check your connection and try again.',
              );
              setError(
                'Your account session could not be checked. Check your connection and retry.',
              );
            }
          } finally {
            if (isCurrent(nextActor, version)) setHydrated(true);
          }
        })();
      }, 0);
    }

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((event, session) => {
      if (event !== 'INITIAL_SESSION') acceptSession(session);
    });
    const initialGeneration = generation.current;
    void client.auth.getSession().then(
      ({ data, error: restoreError }) => {
        if (!mounted.current || initialGeneration !== generation.current) return;
        if (restoreError) {
          setError('Your saved account session could not be restored. Please sign in again.');
          setHydrated(true);
          return;
        }
        acceptSession(data.session);
      },
      () => {
        if (mounted.current && initialGeneration === generation.current) {
          setError('Your saved account session could not be restored. Please try again.');
          setHydrated(true);
        }
      },
    );
    return () => {
      mounted.current = false;
      ++generation.current;
      subscription.unsubscribe();
    };
  }, [client, isCurrent, loadProfile, rejectValidation]);

  useEffect(() => {
    if (!client || Platform.OS === 'web') return;
    function updateRefresh(state: string) {
      const action =
        state === 'active' ? client!.auth.startAutoRefresh() : client!.auth.stopAutoRefresh();
      void action.catch(() => {
        if (mounted.current)
          setError('Account session refresh is unavailable. Please try again later.');
      });
    }
    updateRefresh(AppState.currentState);
    const subscription = AppState.addEventListener('change', updateRefresh);
    return () => {
      subscription.remove();
      void client.auth.stopAutoRefresh().catch(() => undefined);
    };
  }, [client]);

  async function run(
    operation: () => Promise<AuthResult>,
    kind: 'sign-in' | 'email' | 'account' = 'account',
  ): Promise<AuthResult> {
    if (!client) return { ok: false, message: accountUnavailable };
    if (!hydrated) return { ok: false, message: 'Your account session is still loading.' };
    if (operationInFlight.current)
      return { ok: false, message: 'Please wait for the current request.' };
    operationInFlight.current = true;
    setBusy(true);
    setError(null);
    const initialActor = actorId.current;
    try {
      const result = await operation();
      if (mounted.current && !result.ok && initialActor === actorId.current)
        setError(result.message);
      return result;
    } catch (failure) {
      const message = authFailureMessage(failure, kind);
      if (mounted.current && initialActor === actorId.current) setError(message);
      return { ok: false, message };
    } finally {
      operationInFlight.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  async function currentActor(
    requireValidated = true,
  ): Promise<{ actor: ProfileActor; version: number } | null> {
    if (!client || !actorId.current) return null;
    const expected = actorId.current;
    const version = generation.current;
    const { data, error: sessionError } = await client.auth.getSession();
    if (
      sessionError ||
      !data.session ||
      data.session.user.id !== expected ||
      !isCurrent(expected, version) ||
      (requireValidated &&
        (validatedActor.current?.id !== expected || validatedActor.current.version !== version))
    ) {
      return null;
    }
    return { actor: { userId: expected, accessToken: data.session.access_token }, version };
  }

  async function clearInvalidSession(): Promise<boolean> {
    if (!invalidSession.current) return true;
    try {
      const { error: clearError } = await client!.auth.signOut({ scope: 'local' });
      if (clearError && actorId.current) return false;
      invalidSession.current = false;
      return true;
    } catch {
      return false;
    }
  }

  function signIn(emailValue: string, password: string) {
    return run(async () => {
      if (!(await clearInvalidSession()))
        return {
          ok: false,
          message: 'Your expired session could not be cleared. Check device storage and try again.',
        };
      if (actorId.current)
        return {
          ok: false,
          message: 'Sign out of the current account before signing in to another.',
        };
      const email = emailValue.trim();
      if (!validEmail(email)) return { ok: false, message: invalidEmail };
      if (!password) return { ok: false, message: 'Enter your password.' };
      const { data, error: signInError } = await client!.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        if (signInError.code === 'email_not_confirmed' && !actorId.current) setPendingEmail(email);
        throw signInError;
      }
      if (!data.session || !data.user)
        return { ok: false, message: 'Sign-in did not create a session. Please try again.' };
      return {
        ok: true,
        message: data.user.email_confirmed_at
          ? 'You are signed in.'
          : 'Confirm your email before starting a course.',
      };
    }, 'sign-in');
  }

  function signUp(emailValue: string, password: string, displayName: string) {
    return run(async () => {
      if (!(await clearInvalidSession()))
        return {
          ok: false,
          message: 'Your expired session could not be cleared. Check device storage and try again.',
        };
      if (actorId.current)
        return { ok: false, message: 'Sign out of the current account before creating another.' };
      const email = emailValue.trim();
      const name = normalizeAccountName(displayName);
      if (!validEmail(email)) return { ok: false, message: invalidEmail };
      if (password.length < 15)
        return { ok: false, message: 'Use a passphrase with at least 15 characters.' };
      if (name && [...name].length > 40)
        return { ok: false, message: 'Use a name with 40 characters or fewer.' };
      const redirect = getAuthRedirectUrl('confirmation');
      if (!redirect)
        return {
          ok: false,
          message: 'Email confirmation is not configured yet. Please try again later.',
        };
      const candidate = createIsolatedAuthClient();
      if (!candidate) return { ok: false, message: accountUnavailable };
      try {
        const { data, error: signupError } = await candidate.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirect, data: { display_name: name } },
        });
        if (signupError && signupError.code !== 'user_already_exists') throw signupError;
        if (data.session) {
          await candidate.auth.signOut({ scope: 'local' });
          return {
            ok: false,
            message:
              'Email confirmation must be enabled for this environment before creating accounts.',
          };
        }
      } finally {
        await candidate.auth.dispose();
      }
      if (mounted.current && !actorId.current) setPendingEmail(email);
      return { ok: true, message: emailRequestAccepted };
    }, 'email');
  }

  function requestRecovery(emailValue: string) {
    return run(async () => {
      const email = emailValue.trim();
      if (!validEmail(email)) return { ok: false, message: invalidEmail };
      const redirect = getAuthRedirectUrl('recovery');
      if (!redirect)
        return {
          ok: false,
          message: 'Password recovery is not configured yet. Please try again later.',
        };
      const { error: requestError } = await client!.auth.resetPasswordForEmail(email, {
        redirectTo: redirect,
      });
      if (requestError) throw requestError;
      return { ok: true, message: emailRequestAccepted };
    }, 'email');
  }

  function resendVerification() {
    return run(async () => {
      const email = user?.email || pendingEmail;
      if (!email) return { ok: false, message: 'Enter your email on the sign-in screen first.' };
      const redirect = getAuthRedirectUrl('confirmation');
      if (!redirect)
        return {
          ok: false,
          message: 'Email confirmation is not configured yet. Please try again later.',
        };
      const { error: resendError } = await client!.auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: redirect },
      });
      if (resendError) throw resendError;
      return { ok: true, message: emailRequestAccepted };
    }, 'email');
  }

  function checkVerification() {
    return run(async () => {
      const context = await currentActor(false);
      if (!context)
        return {
          ok: false,
          message: 'After opening the confirmation email, sign in to check your account.',
        };
      validatedActor.current = null;
      profileRef.current = null;
      setProfile(null);
      ++profileRequest.current;
      let response: { data: { user: User | null }; error: AuthError | null };
      try {
        response = await client!.auth.getUser(context.actor.accessToken);
      } catch {
        await rejectValidation(context.actor.userId, context.version, false);
        return {
          ok: false,
          message: 'Your account session could not be checked. Please try again.',
        };
      }
      const { data, error: checkError } = response;
      if (!isCurrent(context.actor.userId, context.version)) return sessionChanged;
      if (checkError || !data.user || data.user.id !== context.actor.userId) {
        await rejectValidation(
          context.actor.userId,
          context.version,
          invalidAuthResponse(checkError) || !checkError,
        );
        return {
          ok: false,
          message: invalidAuthResponse(checkError)
            ? 'Your account session has expired. Please sign in again.'
            : 'Your account session could not be checked. Please try again.',
        };
      }
      validatedActor.current = { id: data.user.id, version: context.version };
      setUser(identity(data.user));
      await loadProfile(context.actor, context.version);
      if (!isCurrent(context.actor.userId, context.version)) return sessionChanged;
      return {
        ok: Boolean(data.user.email_confirmed_at),
        message: data.user.email_confirmed_at
          ? 'Your email is confirmed.'
          : 'Your email is still awaiting confirmation. Open the latest confirmation email and try again.',
      };
    });
  }

  function signOut(expectedUserId?: string) {
    return run(async () => {
      if (expectedUserId && actorId.current !== expectedUserId) return sessionChanged;
      const { error: signOutError } = await client!.auth.signOut({ scope: 'local' });
      if (signOutError && actorId.current === null) {
        setPendingEmail(null);
        return {
          ok: true,
          message:
            'Signed out on this device. Server session revocation could not be confirmed; reconnect and sign in again if needed.',
        };
      }
      if (signOutError)
        return {
          ok: false,
          message: 'Sign-out could not be confirmed. Check your connection and try again.',
        };
      setPendingEmail(null);
      return {
        ok: true,
        message: 'You are signed out on this device. Your sample learning is still here.',
      };
    });
  }

  function retryProfile() {
    return run(async () => {
      const context = await currentActor();
      if (!context) return { ok: false, message: 'Sign in before loading your account profile.' };
      return loadProfile(context.actor, context.version);
    });
  }

  function saveProfileName(value: string) {
    return run(async () => {
      const name = normalizeAccountName(value);
      if (name && [...name].length > 40)
        return { ok: false, message: 'Use a name with 40 characters or fewer.' };
      const context = await currentActor();
      const previous = profileRef.current;
      if (profileConflict.current)
        return {
          ok: false,
          message: 'Reload your account profile before saving again; your draft is still here.',
        };
      if (!context || !previous || previous.userId !== context.actor.userId) {
        return { ok: false, message: 'Load your account profile before editing it.' };
      }
      const request = ++profileRequest.current;
      try {
        const result = await updateOwnProfile(client!, context.actor, name, previous.revision);
        if (!isCurrent(context.actor.userId, context.version) || request !== profileRequest.current)
          return sessionChanged;
        profileRef.current = result;
        setProfile(result);
        setProfileError(null);
        return { ok: true, message: 'Your account name is saved.' };
      } catch (failure) {
        if (!isCurrent(context.actor.userId, context.version) || request !== profileRequest.current)
          return sessionChanged;
        const message =
          failure instanceof ProfileRequestError && failure.code === '40001'
            ? 'Your profile changed elsewhere. Reload it before saving again; your draft is still here.'
            : 'Your account name could not be saved. Your draft is still here; please try again.';
        if (failure instanceof ProfileRequestError && failure.code === '40001')
          profileConflict.current = true;
        setProfileError(message);
        return { ok: false, message };
      }
    });
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        pendingEmail,
        configured: Boolean(client),
        hydrated,
        busy,
        error,
        profileError,
        signIn,
        signUp,
        requestRecovery,
        resendVerification,
        checkVerification,
        signOut,
        retryProfile,
        saveProfileName,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const auth = useContext(AuthContext);
  if (!auth) throw new Error('useAuth must be used inside AuthProvider.');
  return auth;
}
