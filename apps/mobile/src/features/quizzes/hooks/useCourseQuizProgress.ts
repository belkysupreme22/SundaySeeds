import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../auth/hooks/useAuth';
import type { AccountIdentity, ValidatedAccountActor } from '../../auth/types';
import { getSupabaseClient } from '../../../shared/data/supabase';
import {
  loadCourseQuizProgress,
  connectedQuizMessage,
  ConnectedQuizError,
} from '../data/connectedQuizApi';
import type { CourseQuizProgress } from '../types/connectedQuiz';

type State =
  | { status: 'hidden' | 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; data: CourseQuizProgress | null };
type Result = {
  owner: AccountIdentity | null;
  courseId: string;
  actor?: ValidatedAccountActor;
  state: State;
};
export function useCourseQuizProgress(courseId: string, enabled: boolean) {
  const auth = useAuth();
  const authRef = useRef(auth);
  authRef.current = auth;
  const owner = auth.user;
  const eligible = enabled && auth.hydrated && Boolean(owner?.verified);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<Result>({
    owner: null,
    courseId,
    state: { status: 'loading' },
  });
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setResult({ owner, courseId, state: { status: 'loading' } });
      if (eligible)
        void (async () => {
          let actor: ValidatedAccountActor | null = null;
          try {
            const client = getSupabaseClient();
            actor = await authRef.current.getValidatedActor();
            if (!active) return;
            if (!client || !actor || actor.userId !== owner?.id || !actor.isCurrent())
              throw new ConnectedQuizError('authentication_required');
            const data = await loadCourseQuizProgress(client, actor, courseId);
            if (active && actor.isCurrent())
              setResult({ owner, courseId, actor, state: { status: 'ready', data } });
          } catch (error) {
            if (active && (!actor || actor.isCurrent()))
              setResult({
                owner,
                courseId,
                actor: actor ?? undefined,
                state: { status: 'error', message: connectedQuizMessage(error) },
              });
          }
        })();
      return () => {
        active = false;
      };
    }, [owner, eligible, courseId, revision]),
  );
  const state: State = !eligible
    ? { status: 'hidden' }
    : result.owner !== owner ||
        result.courseId !== courseId ||
        (result.actor && !result.actor.isCurrent())
      ? { status: 'loading' }
      : result.state;
  return { state, reload: () => setRevision((n) => n + 1) };
}
