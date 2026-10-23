import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../auth/hooks/useAuth';
import type { AccountIdentity, ValidatedAccountActor } from '../../auth/types';
import { getSupabaseClient } from '../../../shared/data/supabase';
import {
  CourseReadingStateError,
  loadCourseReadingState,
  saveCourseReadingPosition,
  setCourseLessonBookmark,
  courseReadingStateMessage,
  isUncertainReadingStateError,
} from '../data/courseReadingState';
import type { CourseReadingState } from '../types/readingState';
import type { ConnectedLesson } from '../types/enrollment';

type Intent =
  | { kind: 'position'; sectionId: string; revision: number }
  | { kind: 'bookmark'; desired: boolean; revision: number };
type Ready = {
  status: 'ready';
  data: CourseReadingState;
  busy: boolean;
  pending: Intent | null;
  problem: null | { message: string; uncertain: boolean; conflict: boolean };
};
type State = { status: 'hidden' | 'loading' } | { status: 'error'; message: string } | Ready;
type Result = {
  owner: AccountIdentity | null;
  scope: string;
  actor?: ValidatedAccountActor;
  state: State;
};

// Only acknowledged server state is rendered as saved. A failed write retains its
// exact target/revision for explicit retry; no offline or background write queue.
export function useCourseReadingState(lesson: ConnectedLesson | null) {
  const auth = useAuth();
  const authRef = useRef(auth);
  authRef.current = auth;
  const owner = auth.user;
  const scope = lesson ? `${lesson.enrollmentId}/${lesson.releaseId}/${lesson.lesson.id}` : '';
  const eligible = Boolean(lesson && auth.hydrated && owner?.verified);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<Result>({
    owner: null,
    scope,
    state: { status: 'loading' },
  });
  const focused = useRef(false);
  const sequence = useRef(0);
  const working = useRef(false);
  const state: State = !eligible
    ? { status: 'hidden' }
    : result.owner !== owner ||
        result.scope !== scope ||
        (result.actor && !result.actor.isCurrent())
      ? { status: 'loading' }
      : result.state;
  const stateRef = useRef(state);
  stateRef.current = state;
  useFocusEffect(
    useCallback(() => {
      focused.current = true;
      working.current = false;
      const request = ++sequence.current;
      const current = (actor?: ValidatedAccountActor) =>
        focused.current && request === sequence.current && (!actor || actor.isCurrent());
      setResult({ owner, scope, state: { status: 'loading' } });
      if (eligible && lesson)
        void (async () => {
          let actor: ValidatedAccountActor | null = null;
          try {
            const client = getSupabaseClient();
            actor = await authRef.current.getValidatedActor();
            if (!current()) return;
            if (!client || !actor || actor.userId !== owner?.id || !actor.isCurrent())
              throw new CourseReadingStateError('authentication_required');
            const data = await loadCourseReadingState(
              client,
              actor,
              lesson.courseId,
              lesson.lesson.id,
              lesson,
            );
            if (!current(actor)) return;
            setResult({
              owner,
              scope,
              actor,
              state: { status: 'ready', data, busy: false, pending: null, problem: null },
            });
          } catch (error) {
            if (current(actor ?? undefined))
              setResult({
                owner,
                scope,
                actor: actor ?? undefined,
                state: { status: 'error', message: courseReadingStateMessage(error) },
              });
          }
        })();
      return () => {
        focused.current = false;
        ++sequence.current;
        working.current = false;
      };
    }, [eligible, lesson, owner, scope, revision]),
  );

  async function save(intent: Intent, recovering = false) {
    const before = stateRef.current;
    if (
      !focused.current ||
      working.current ||
      !eligible ||
      !lesson ||
      !owner ||
      before.status !== 'ready' ||
      (before.pending && !recovering)
    )
      return;
    if (
      intent.kind === 'position' &&
      !lesson.lesson.sections.some((s) => s.id === intent.sectionId)
    )
      return;
    working.current = true;
    const request = ++sequence.current;
    const current = (actor?: ValidatedAccountActor) =>
      focused.current && request === sequence.current && (!actor || actor.isCurrent());
    setResult((previous) => ({
      ...previous,
      state: { ...before, busy: true, pending: intent, problem: null },
    }));
    let actor: ValidatedAccountActor | null = null;
    let sent = false;
    try {
      const client = getSupabaseClient();
      actor = await authRef.current.getValidatedActor();
      if (!current()) return;
      if (!client || !actor || actor.userId !== owner.id || !actor.isCurrent())
        throw new CourseReadingStateError('authentication_required');
      sent = true;
      const data =
        intent.kind === 'position'
          ? await saveCourseReadingPosition(
              client,
              actor,
              lesson.courseId,
              lesson.lesson.id,
              intent.sectionId,
              intent.revision,
              lesson,
            )
          : await setCourseLessonBookmark(
              client,
              actor,
              lesson.courseId,
              lesson.lesson.id,
              intent.desired,
              intent.revision,
              lesson,
            );
      if (!current(actor)) return;
      setResult({
        owner,
        scope,
        actor,
        state: { status: 'ready', data, busy: false, pending: null, problem: null },
      });
    } catch (error) {
      if (!current(actor ?? undefined)) return;
      setResult({
        owner,
        scope,
        actor: actor ?? undefined,
        state: {
          ...before,
          busy: false,
          pending: intent,
          problem: {
            message: courseReadingStateMessage(error),
            uncertain: sent && isUncertainReadingStateError(error),
            conflict:
              error instanceof CourseReadingStateError && error.code === 'reading_state_conflict',
          },
        },
      });
    } finally {
      if (request === sequence.current) working.current = false;
    }
  }
  return {
    state,
    reload: () => {
      if (!working.current) setRevision((n) => n + 1);
    },
    savePosition: (sectionId: string) => {
      const s = stateRef.current;
      if (s.status === 'ready')
        void save({ kind: 'position', sectionId, revision: s.data.positionRevision });
    },
    toggleBookmark: () => {
      const s = stateRef.current;
      if (s.status === 'ready')
        void save({
          kind: 'bookmark',
          desired: !s.data.isBookmarked,
          revision: s.data.bookmarkRevision,
        });
    },
    retry: () => {
      const s = stateRef.current;
      if (s.status === 'ready' && s.pending && !s.problem?.conflict) void save(s.pending, true);
    },
  };
}
