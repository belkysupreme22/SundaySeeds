import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../auth/hooks/useAuth';
import type { AccountIdentity, ValidatedAccountActor } from '../../auth/types';
import { getSupabaseClient } from '../../../shared/data/supabase';
import {
  CourseEnrollmentError,
  enrollmentMessage,
  loadConnectedLesson,
} from '../data/courseEnrollment';
import type { ConnectedLessonState } from '../types/enrollment';

type Result = {
  owner: AccountIdentity | null;
  key: string;
  actor?: ValidatedAccountActor;
  state: ConnectedLessonState;
};

export function useConnectedLesson(courseId: string, lessonId: string) {
  const auth = useAuth();
  const authRef = useRef(auth);
  authRef.current = auth;
  const key = `${courseId}/${lessonId}`;
  const owner = auth.user;
  const eligible = auth.hydrated && Boolean(owner?.verified);
  const [request, setRequest] = useState(0);
  const [result, setResult] = useState<Result>({ owner: null, key, state: { status: 'loading' } });
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setResult({ owner, key, state: { status: 'loading' } });
      if (eligible)
        void (async () => {
          let actor: ValidatedAccountActor | null = null;
          try {
            const client = getSupabaseClient();
            actor = await authRef.current.getValidatedActor();
            if (!client || !actor || actor.userId !== owner?.id || !actor.isCurrent())
              throw new CourseEnrollmentError('authentication_required');
            const data = await loadConnectedLesson(client, actor, courseId, lessonId);
            if (active && actor.isCurrent())
              setResult({ owner, key, actor, state: { status: 'ready', data } });
          } catch (error) {
            if (active && (!actor || actor.isCurrent()))
              setResult({
                owner,
                key,
                actor: actor ?? undefined,
                state: { status: 'error', message: enrollmentMessage(error) },
              });
          }
        })();
      return () => {
        active = false;
      };
    }, [courseId, lessonId, key, owner, eligible, request]),
  );
  const state: ConnectedLessonState = !auth.hydrated
    ? { status: 'loading' }
    : !owner
      ? { status: 'signed_out' }
      : !eligible
        ? { status: 'unverified' }
        : result.owner !== owner ||
            result.key !== key ||
            (result.actor && !result.actor.isCurrent())
          ? { status: 'loading' }
          : result.state;
  return { state, reload: () => setRequest((current) => current + 1) };
}
