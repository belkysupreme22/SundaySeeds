import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../auth/hooks/useAuth';
import type { AccountIdentity, ValidatedAccountActor } from '../../auth/types';
import { getSupabaseClient } from '../../../shared/data/supabase';
import {
  startConnectedQuiz,
  loadConnectedQuizAttempt,
  checkConnectedQuizAnswer,
  finishConnectedQuiz,
  connectedQuizMessage,
  isUncertainQuizError,
  ConnectedQuizError,
} from '../data/connectedQuizApi';
import {
  quizRequestKey,
  readQuizRequest,
  writeQuizRequest,
  replaceQuizRequest,
  QuizRequestStorageError,
  type QuizRequest,
} from '../data/quizRequestStorage';
import type { ConnectedQuizAttempt, QuizFinish } from '../types/connectedQuiz';

type Ready = {
  status: 'ready';
  attempt: ConnectedQuizAttempt;
  index: number;
  selectedOptionId: string | null;
  busy: 'checking' | 'finishing' | null;
  message: string | null;
};
type Finished = {
  status: 'finished';
  attempt: ConnectedQuizAttempt | null;
  result: QuizFinish;
  busy: boolean;
  message: string | null;
};
type State =
  | { status: 'loading' | 'signed_out' | 'unverified' }
  | { status: 'error'; message: string; uncertain: boolean }
  | Ready
  | Finished;
type Result = {
  owner: AccountIdentity | null;
  scope: string;
  actor?: ValidatedAccountActor;
  state: State;
};
function ready(attempt: ConnectedQuizAttempt): Ready {
  const firstUnchecked = attempt.questions.findIndex((q) => q.checkedAnswer === null);
  const index = firstUnchecked < 0 ? attempt.questions.length - 1 : firstUnchecked;
  return {
    status: 'ready',
    attempt,
    index,
    selectedOptionId: attempt.questions[index].checkedAnswer?.optionId ?? null,
    busy: null,
    message: null,
  };
}
function validateAttempt(attempt: ConnectedQuizAttempt, courseId: string, lessonId: string) {
  if (attempt.courseId !== courseId.toLowerCase() || attempt.lessonId !== lessonId)
    throw new ConnectedQuizError('invalid_response');
}
function validateFinish(
  result: QuizFinish,
  courseId: string,
  lessonId: string,
  attempt?: ConnectedQuizAttempt,
) {
  const receipt = result.receipt;
  if (
    receipt.courseId !== courseId.toLowerCase() ||
    receipt.lessonId !== lessonId ||
    (attempt &&
      (receipt.attemptId !== attempt.attemptId ||
        receipt.releaseId !== attempt.releaseId ||
        receipt.questionCount !== attempt.questions.length ||
        receipt.correctCount !==
          attempt.questions.filter((q) => q.checkedAnswer?.isCorrect).length))
  )
    throw new ConnectedQuizError('invalid_response');
}
export function useConnectedQuiz(courseId: string, lessonId: string) {
  const auth = useAuth();
  const authRef = useRef(auth);
  authRef.current = auth;
  const owner = auth.user;
  const scope = `${courseId}/${lessonId}`;
  const eligible = auth.hydrated && Boolean(owner?.verified);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<Result>({
    owner: null,
    scope,
    state: { status: 'loading' },
  });
  const sequence = useRef(0),
    focused = useRef(false),
    working = useRef(false);
  const journal = useRef<QuizRequest | null>(null);
  const state: State = !auth.hydrated
    ? { status: 'loading' }
    : !owner
      ? { status: 'signed_out' }
      : !eligible
        ? { status: 'unverified' }
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
      journal.current = null;
      const request = ++sequence.current;
      const current = (actor?: ValidatedAccountActor) =>
        focused.current && request === sequence.current && (!actor || actor.isCurrent());
      setResult({ owner, scope, state: { status: 'loading' } });
      if (eligible)
        void (async () => {
          let actor: ValidatedAccountActor | null = null;
          let sent = false;
          try {
            const client = getSupabaseClient();
            actor = await authRef.current.getValidatedActor();
            if (!current()) return;
            if (!client || !actor || actor.userId !== owner?.id || !actor.isCurrent())
              throw new ConnectedQuizError('authentication_required');
            const key = quizRequestKey(actor.userId, courseId, lessonId);
            let entry = await readQuizRequest(key);
            if (!current(actor)) return;
            journal.current = entry;
            sent = true;
            // Finish reconciliation can return a content-free receipt after withdrawal.
            // Do this before Start/Get, which correctly require current content access.
            if (entry.pending?.kind === 'finish' && entry.attemptId) {
              const finish = await finishConnectedQuiz(client, actor, entry.attemptId);
              validateFinish(finish, courseId, lessonId);
              if (!current(actor)) return;
              await writeQuizRequest(key, { ...entry, pending: null });
              if (!current(actor)) return;
              journal.current = { ...entry, pending: null };
              setResult({
                owner,
                scope,
                actor,
                state: {
                  status: 'finished',
                  attempt: null,
                  result: finish,
                  busy: false,
                  message: null,
                },
              });
              return;
            }
            let attempt = await startConnectedQuiz(
              client,
              actor,
              courseId,
              lessonId,
              entry.startKey,
            );
            if (!current(actor)) return;
            validateAttempt(attempt, courseId, lessonId);
            if (entry.attemptId && entry.attemptId !== attempt.attemptId)
              throw new ConnectedQuizError('invalid_response');
            entry = { ...entry, attemptId: attempt.attemptId };
            await writeQuizRequest(key, entry);
            if (!current(actor)) return;
            journal.current = entry;
            if (attempt.receipt || entry.pending?.kind === 'finish') {
              const finish = await finishConnectedQuiz(client, actor, attempt.attemptId);
              validateFinish(finish, courseId, lessonId, attempt);
              if (!current(actor)) return;
              await writeQuizRequest(key, { ...entry, pending: null });
              if (!current(actor)) return;
              journal.current = { ...entry, pending: null };
              setResult({
                owner,
                scope,
                actor,
                state: { status: 'finished', attempt, result: finish, busy: false, message: null },
              });
              return;
            }
            if (entry.pending?.kind === 'check') {
              // A concurrent request may already have checked this question.
              const recovery = entry.pending;
              const question = attempt.questions.find((q) => q.id === recovery.questionId);
              if (!question) throw new ConnectedQuizError('quiz_selection_invalid');
              if (!question.checkedAnswer)
                await checkConnectedQuizAnswer(
                  client,
                  actor,
                  attempt.attemptId,
                  recovery.questionId,
                  recovery.optionId,
                );
              if (!current(actor)) return;
              attempt = await loadConnectedQuizAttempt(client, actor, attempt.attemptId);
              validateAttempt(attempt, courseId, lessonId);
              if (!current(actor)) return;
              const recoveredIndex = attempt.questions.findIndex(
                (q) => q.id === recovery.questionId,
              );
              if (recoveredIndex < 0 || !attempt.questions[recoveredIndex].checkedAnswer)
                throw new ConnectedQuizError('invalid_response');
              await writeQuizRequest(key, { ...entry, pending: null });
              if (!current(actor)) return;
              journal.current = { ...entry, pending: null };
              setResult({
                owner,
                scope,
                actor,
                state: {
                  ...ready(attempt),
                  index: recoveredIndex,
                  selectedOptionId:
                    attempt.questions[recoveredIndex].checkedAnswer?.optionId ?? null,
                },
              });
              return;
            }
            setResult({ owner, scope, actor, state: ready(attempt) });
          } catch (error) {
            if (current(actor ?? undefined))
              setResult({
                owner,
                scope,
                actor: actor ?? undefined,
                state: {
                  status: 'error',
                  uncertain: sent && isUncertainQuizError(error),
                  message:
                    error instanceof QuizRequestStorageError
                      ? 'We couldn’t access quiz recovery on this device. Try again to continue safely.'
                      : connectedQuizMessage(error),
                },
              });
          }
        })();
      return () => {
        focused.current = false;
        ++sequence.current;
        working.current = false;
      };
    }, [owner, eligible, courseId, lessonId, scope, revision]),
  );

  const reload = () => setRevision((n) => n + 1);
  function update(next: State) {
    setResult((previous) => ({ ...previous, state: next }));
  }
  function select(optionId: string) {
    const s = stateRef.current;
    if (
      !focused.current ||
      working.current ||
      s.status !== 'ready' ||
      s.attempt.questions[s.index].checkedAnswer ||
      !s.attempt.questions[s.index].options.some((o) => o.id === optionId)
    )
      return;
    update({ ...s, selectedOptionId: optionId, message: null });
  }
  function next() {
    const s = stateRef.current;
    if (
      !focused.current ||
      working.current ||
      s.status !== 'ready' ||
      !s.attempt.questions[s.index].checkedAnswer ||
      s.index + 1 >= s.attempt.questions.length
    )
      return;
    const index = s.index + 1;
    update({
      ...s,
      index,
      selectedOptionId: s.attempt.questions[index].checkedAnswer?.optionId ?? null,
      message: null,
    });
  }
  async function mutate(kind: 'check' | 'finish' | 'retry') {
    const s = stateRef.current;
    if (!focused.current || working.current || !journal.current || !owner || !eligible) return;
    if (kind === 'retry' ? s.status !== 'finished' : s.status !== 'ready') return;
    if (s.status !== 'ready' && s.status !== 'finished') return;
    if (
      s.status === 'ready' &&
      (kind === 'check'
        ? !s.selectedOptionId || Boolean(s.attempt.questions[s.index].checkedAnswer)
        : !s.attempt.questions.every((q) => q.checkedAnswer !== null))
    )
      return;
    working.current = true;
    const request = ++sequence.current;
    const current = (actor?: ValidatedAccountActor) =>
      focused.current && request === sequence.current && (!actor || actor.isCurrent());
    update(
      s.status === 'finished'
        ? { ...s, busy: true, message: null }
        : { ...s, busy: kind === 'check' ? 'checking' : 'finishing', message: null },
    );
    let actor: ValidatedAccountActor | null = null;
    let sent = false;
    try {
      const client = getSupabaseClient();
      actor = await authRef.current.getValidatedActor();
      if (!current()) return;
      if (!client || !actor || actor.userId !== owner.id || !actor.isCurrent())
        throw new ConnectedQuizError('authentication_required');
      const key = quizRequestKey(actor.userId, courseId, lessonId);
      const entry = journal.current;
      if (!entry) return;
      if (kind === 'retry') {
        const replacement = await replaceQuizRequest(key);
        if (!current(actor)) return;
        journal.current = replacement;
        reload();
        return;
      }
      if (s.status !== 'ready') return;
      const pending: QuizRequest = {
        ...entry,
        pending:
          kind === 'finish'
            ? { kind: 'finish' }
            : {
                kind: 'check',
                questionId: s.attempt.questions[s.index].id,
                optionId: s.selectedOptionId!,
              },
      };
      await writeQuizRequest(key, pending);
      if (!current(actor)) return;
      journal.current = pending;
      sent = true;
      if (kind === 'finish') {
        const finish = await finishConnectedQuiz(client, actor, s.attempt.attemptId);
        validateFinish(finish, courseId, lessonId, s.attempt);
        if (!current(actor)) return;
        await writeQuizRequest(key, { ...entry, pending: null });
        if (!current(actor)) return;
        journal.current = { ...entry, pending: null };
        setResult({
          owner,
          scope,
          actor,
          state: {
            status: 'finished',
            attempt: s.attempt,
            result: finish,
            busy: false,
            message: null,
          },
        });
      } else {
        const question = s.attempt.questions[s.index];
        const feedback = await checkConnectedQuizAnswer(
          client,
          actor,
          s.attempt.attemptId,
          question.id,
          s.selectedOptionId!,
        );
        if (!current(actor)) return;
        if (!question.options.some((o) => o.id === feedback.correctOptionId))
          throw new ConnectedQuizError('invalid_response');
        await writeQuizRequest(key, { ...entry, pending: null });
        if (!current(actor)) return;
        journal.current = { ...entry, pending: null };
        const attempt = {
          ...s.attempt,
          questions: s.attempt.questions.map((q) =>
            q.id === question.id ? { ...q, checkedAnswer: feedback } : q,
          ),
        };
        setResult({
          owner,
          scope,
          actor,
          state: { ...s, attempt, selectedOptionId: feedback.optionId, busy: null, message: null },
        });
      }
    } catch (error) {
      if (!current(actor ?? undefined)) return;
      // Never offer a fresh attempt when a write's response is uncertain.
      if (kind === 'retry' && s.status === 'finished')
        update({
          ...s,
          busy: false,
          message: 'We could not prepare another attempt. Please try again.',
        });
      else
        setResult({
          owner,
          scope,
          actor: actor ?? undefined,
          state: {
            status: 'error',
            uncertain: sent && isUncertainQuizError(error),
            message:
              error instanceof QuizRequestStorageError
                ? 'We couldn’t access quiz recovery on this device. Try again to continue safely.'
                : connectedQuizMessage(error),
          },
        });
    } finally {
      if (request === sequence.current) working.current = false;
    }
  }
  return {
    state,
    select,
    next,
    check: () => {
      void mutate('check');
    },
    finish: () => {
      void mutate('finish');
    },
    retry: () => {
      void mutate('retry');
    },
    reload,
  };
}
