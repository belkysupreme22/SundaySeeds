import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import { useAuth } from '../../auth/hooks/useAuth';
import type { AuthResult } from '../../auth/types';
import { getSupabaseClient } from '../../../shared/data/supabase';
import {
  dismissLearningPreferences,
  LearningPreferencesError,
  loadLearningPreferences,
  saveLearningPreferences,
} from '../data/learningPreferencesApi';
import type { LearningPreferences, LearningPreferencesDraft } from '../types';

type LearningProfileContext = {
  preferences: LearningPreferences | null;
  loaded: boolean;
  busy: boolean;
  eligible: boolean;
  error: string | null;
  conflict: boolean;
  shouldPrompt: boolean;
  retry: () => Promise<void>;
  save: (draft: LearningPreferencesDraft) => Promise<AuthResult>;
  dismiss: () => Promise<AuthResult>;
  continueForNow: () => void;
};
const Context = createContext<LearningProfileContext | null>(null);
const changed = { ok: false, message: 'The account session changed. Please try again.' };

export function LearningProfileProvider({ children }: PropsWithChildren) {
  const auth = useAuth();
  const authRef = useRef(auth);
  authRef.current = auth;
  const eligible = Boolean(auth.hydrated && auth.user?.verified);
  const userId = auth.user?.id;
  const [stateOwner, setStateOwner] = useState(userId);
  const [client] = useState(getSupabaseClient);
  const [preferences, setPreferences] = useState<LearningPreferences | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState(false);
  const [dismissedFor, setDismissedFor] = useState<string | undefined>();
  const current = useRef<LearningPreferences | null>(null);
  const loadedRef = useRef(false);
  const loadedOwner = useRef<string | undefined>(undefined);
  const conflictRef = useRef(false);
  const mounted = useRef(false);
  const request = useRef(0);
  const working = useRef(false);

  const retry = useCallback(async () => {
    if (!eligible || !client || working.current) return;
    const attempt = ++request.current;
    working.current = true;
    setBusy(true);
    setError(null);
    try {
      const actor = await authRef.current.getValidatedActor();
      if (!actor || actor.userId !== userId) throw new LearningPreferencesError('session_changed');
      const result = await loadLearningPreferences(client, actor);
      if (!mounted.current || attempt !== request.current || !actor.isCurrent()) return;
      current.current = result;
      loadedRef.current = true;
      loadedOwner.current = userId;
      setStateOwner(userId);
      conflictRef.current = false;
      setPreferences(result);
      setLoaded(true);
      setConflict(false);
    } catch {
      if (!mounted.current || attempt !== request.current) return;
      // An unavailable load is never treated as a first-time/empty profile.
      loadedRef.current = false;
      setLoaded(false);
      setError(
        'Your learning preferences could not be loaded. Try again, or keep exploring and set them up later.',
      );
    } finally {
      if (mounted.current && attempt === request.current) {
        working.current = false;
        setBusy(false);
      }
    }
  }, [client, eligible, userId]);

  useEffect(() => {
    mounted.current = true;
    ++request.current;
    working.current = false;
    loadedRef.current = false;
    loadedOwner.current = undefined;
    current.current = null;
    conflictRef.current = false;
    setStateOwner(userId);
    setPreferences(null);
    setConflict(false);
    setLoaded(false);
    setBusy(false);
    setError(null);
    if (eligible) void retry();
    return () => {
      mounted.current = false;
      ++request.current;
      working.current = false;
    };
  }, [eligible, retry, auth.user]);

  function continueForNow() {
    setDismissedFor(userId);
  }

  async function mutate(draft: LearningPreferencesDraft | null): Promise<AuthResult> {
    if (!eligible || !client)
      return { ok: false, message: 'Sign in with a verified email to save learning preferences.' };
    if (working.current) return { ok: false, message: 'Please wait for the current request.' };
    if (!loadedRef.current || loadedOwner.current !== userId || conflictRef.current)
      return {
        ok: false,
        message: 'Reload your learning preferences before saving. Your draft is still here.',
      };
    const expectedRevision = current.current?.revision ?? 0;
    const attempt = ++request.current;
    working.current = true;
    setBusy(true);
    setError(null);
    try {
      const actor = await authRef.current.getValidatedActor();
      if (!actor || actor.userId !== userId) return changed;
      const result = draft
        ? await saveLearningPreferences(client, actor, draft, expectedRevision)
        : await dismissLearningPreferences(client, actor, expectedRevision);
      if (!mounted.current || attempt !== request.current || !actor.isCurrent()) return changed;
      current.current = result;
      setPreferences(result);
      setDismissedFor(userId);
      return {
        ok: true,
        message: draft
          ? 'Your learning preferences are saved.'
          : 'You can finish setup later in Settings.',
      };
    } catch (failure) {
      if (!mounted.current || attempt !== request.current) return changed;
      const stale = failure instanceof LearningPreferencesError && failure.code === '40001';
      const message = stale
        ? 'Your learning preferences changed elsewhere. Reload them before saving again; your draft is still here.'
        : 'Your learning preferences could not be saved. Your draft is still here. Try again, or continue without saving.';
      if (stale) {
        conflictRef.current = true;
        setConflict(true);
      }
      setError(message);
      return { ok: false, message };
    } finally {
      if (mounted.current && attempt === request.current) {
        working.current = false;
        setBusy(false);
      }
    }
  }

  async function dismiss(): Promise<AuthResult> {
    // Exit is always available, even without a loaded row or working persistence.
    setDismissedFor(userId);
    if (!loadedRef.current || loadedOwner.current !== userId || working.current)
      return {
        ok: false,
        message: 'Setup is skipped for this session. Saved preferences have not changed.',
      };
    return mutate(null);
  }

  return (
    <Context.Provider
      value={{
        preferences: eligible && stateOwner === userId ? preferences : null,
        loaded: eligible && stateOwner === userId && loaded,
        busy,
        eligible,
        error: stateOwner === userId ? error : null,
        conflict: stateOwner === userId && conflict,
        shouldPrompt:
          eligible &&
          stateOwner === userId &&
          loaded &&
          preferences === null &&
          dismissedFor !== userId,
        retry,
        save: (draft) => mutate(draft),
        dismiss,
        continueForNow,
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function useLearningProfile(): LearningProfileContext {
  const profile = useContext(Context);
  if (!profile) throw new Error('useLearningProfile must be used inside LearningProfileProvider.');
  return profile;
}
