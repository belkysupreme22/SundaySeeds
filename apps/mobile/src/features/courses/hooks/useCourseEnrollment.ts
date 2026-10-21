import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../auth/hooks/useAuth';
import type { AccountIdentity, ValidatedAccountActor } from '../../auth/types';
import { getSupabaseClient } from '../../../shared/data/supabase';
import {
  CourseEnrollmentError,
  enrollmentMessage,
  joinCourse,
  loadOwnEnrollment,
} from '../data/courseEnrollment';
import type { EnrollmentState } from '../types/enrollment';

type Result = {
  owner: AccountIdentity | null;
  courseId: string;
  actor?: ValidatedAccountActor;
  state: EnrollmentState;
};

export function useCourseEnrollment(courseId: string) {
  const auth = useAuth();
  const authRef = useRef(auth);
  authRef.current = auth;
  const [result, setResult] = useState<Result>({
    owner: null,
    courseId,
    state: { status: 'loading' },
  });
  const [request, setRequest] = useState(0);
  const sequence = useRef(0);
  const focused = useRef(false);
  const working = useRef(false);
  const owner = auth.user;
  const eligible = auth.hydrated && Boolean(owner?.verified);

  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      const attempt = ++sequence.current;
      working.current = false;
      setResult({ owner, courseId, state: { status: 'loading' } });
      if (eligible) {
        void (async () => {
          let actor: ValidatedAccountActor | null = null;
          try {
            const client = getSupabaseClient();
            actor = await authRef.current.getValidatedActor();
            if (!client || !actor || actor.userId !== owner?.id || !actor.isCurrent())
              throw new CourseEnrollmentError('authentication_required');
            const enrollment = await loadOwnEnrollment(client, actor, courseId);
            if (focused.current && attempt === sequence.current && actor.isCurrent()) {
              setResult({ owner, courseId, actor, state: { status: 'ready', enrollment } });
            }
          } catch (error) {
            if (focused.current && attempt === sequence.current && (!actor || actor.isCurrent())) {
              setResult({
                owner,
                courseId,
                actor: actor ?? undefined,
                state: { status: 'error', message: enrollmentMessage(error) },
              });
            }
          }
        })();
      }
      return () => {
        focused.current = false;
        ++sequence.current;
        working.current = false;
      };
    }, [owner, eligible, courseId, request]),
  );

  const reload = () => setRequest((current) => current + 1);
  const baseState: EnrollmentState = !auth.hydrated
    ? { status: 'loading' }
    : !owner
      ? { status: 'signed_out' }
      : !eligible
        ? { status: 'unverified' }
        : result.owner !== owner ||
            result.courseId !== courseId ||
            (result.actor && !result.actor.isCurrent())
          ? { status: 'loading' }
          : result.state;

  async function join(revision: number) {
    if (
      !eligible ||
      working.current ||
      baseState.status !== 'ready' ||
      baseState.enrollment ||
      !focused.current
    )
      return;
    working.current = true;
    const attempt = ++sequence.current;
    setResult({ owner, courseId, state: { status: 'joining' } });
    let actor: ValidatedAccountActor | null = null;
    let sent = false;
    try {
      const client = getSupabaseClient();
      actor = await authRef.current.getValidatedActor();
      if (!client || !actor || actor.userId !== owner?.id || !actor.isCurrent())
        throw new CourseEnrollmentError('authentication_required');
      // Reconcile first, including a previous request whose response was lost.
      const existing = await loadOwnEnrollment(client, actor, courseId);
      if (!focused.current || attempt !== sequence.current || !actor.isCurrent()) return;
      if (existing) {
        setResult({ owner, courseId, actor, state: { status: 'ready', enrollment: existing } });
        return;
      }
      sent = true;
      const enrollment = await joinCourse(client, actor, courseId, revision);
      if (focused.current && attempt === sequence.current && actor.isCurrent()) {
        setResult({ owner, courseId, actor, state: { status: 'ready', enrollment } });
      }
    } catch (error) {
      if (!focused.current || attempt !== sequence.current || (actor && !actor.isCurrent())) return;
      const changed = error instanceof CourseEnrollmentError && error.code === 'course_changed';
      const uncertain =
        sent &&
        (!(error instanceof CourseEnrollmentError) ||
          ['request', 'invalid_response'].includes(error.code));
      setResult({
        owner,
        courseId,
        actor: actor ?? undefined,
        state: {
          status: changed ? 'changed' : uncertain ? 'uncertain' : 'error',
          message: uncertain
            ? 'We could not confirm whether you joined. Check your enrollment before trying again.'
            : enrollmentMessage(error),
        },
      });
    } finally {
      if (attempt === sequence.current) working.current = false;
    }
  }
  return { state: baseState, reload, join };
}
