import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProfileActor } from '../../auth/data/profileApi';
import type {
  BibleFamiliarity,
  LearningIntention,
  LearningInterest,
  LearningPreferences,
  LearningPreferencesDraft,
  SessionMinutes,
} from '../types';

export class LearningPreferencesError extends Error {
  constructor(readonly code: string) {
    super('Learning preferences request failed.');
  }
}

const intentions: readonly LearningIntention[] = [
  'explore_faith',
  'understand_bible',
  'prayer_habit',
  'daily_practice',
  'deeper_study',
  'browsing',
];
const interests: readonly LearningInterest[] = ['Faith', 'Prayer', 'Kindness', 'Courage'];
const familiarities: readonly BibleFamiliarity[] = ['new', 'some', 'regular', 'unsure'];
const durations: readonly SessionMinutes[] = [5, 10, 15, 20];

function optionalMember<T>(value: unknown, options: readonly T[]): value is T | null {
  return value === null || options.some((option) => option === value);
}

export function validLearningDraft(value: LearningPreferencesDraft): boolean {
  return (
    optionalMember(value.intention, intentions) &&
    optionalMember(value.familiarity, familiarities) &&
    optionalMember(value.sessionMinutes, durations) &&
    Array.isArray(value.interests) &&
    value.interests.length <= 3 &&
    new Set(value.interests).size === value.interests.length &&
    value.interests.every((interest) => interests.includes(interest))
  );
}

function parsePreferences(value: unknown, userId: string): LearningPreferences {
  if (!value || typeof value !== 'object') throw new LearningPreferencesError('invalid_response');
  const row = value as Record<string, unknown>;
  if (
    row.user_id !== userId ||
    !optionalMember(row.intention, intentions) ||
    !optionalMember(row.familiarity, familiarities) ||
    !optionalMember(row.session_minutes, durations) ||
    !Array.isArray(row.interests) ||
    row.interests.length > 3 ||
    new Set(row.interests).size !== row.interests.length ||
    !row.interests.every((item): item is LearningInterest =>
      interests.some((option) => option === item),
    ) ||
    !['completed', 'dismissed'].includes(String(row.setup_status)) ||
    typeof row.revision !== 'number' ||
    !Number.isSafeInteger(row.revision) ||
    row.revision < 1 ||
    typeof row.updated_at !== 'string' ||
    !Number.isFinite(Date.parse(row.updated_at))
  )
    throw new LearningPreferencesError('invalid_response');
  return {
    userId,
    intention: row.intention,
    interests: row.interests,
    familiarity: row.familiarity,
    sessionMinutes: row.session_minutes,
    setupStatus: row.setup_status as LearningPreferences['setupStatus'],
    revision: row.revision,
    updatedAt: row.updated_at,
  };
}

export async function loadLearningPreferences(client: SupabaseClient, actor: ProfileActor) {
  const { data, error } = await client
    .from('learner_learning_preferences')
    .select(
      'user_id,intention,interests,familiarity,session_minutes,setup_status,revision,updated_at',
    )
    .eq('user_id', actor.userId)
    .setHeader('Authorization', `Bearer ${actor.accessToken}`)
    .maybeSingle();
  if (error) throw new LearningPreferencesError(error.code);
  return data === null ? null : parsePreferences(data, actor.userId);
}

export async function saveLearningPreferences(
  client: SupabaseClient,
  actor: ProfileActor,
  draft: LearningPreferencesDraft,
  expectedRevision: number,
) {
  if (!validLearningDraft(draft)) throw new LearningPreferencesError('invalid_draft');
  const { data, error } = await client
    .rpc('save_learner_learning_preferences', {
      p_intention: draft.intention,
      p_interests: draft.interests,
      p_familiarity: draft.familiarity,
      p_session_minutes: draft.sessionMinutes,
      p_expected_revision: expectedRevision,
    })
    .setHeader('Authorization', `Bearer ${actor.accessToken}`)
    .single();
  if (error) throw new LearningPreferencesError(error.code);
  return parsePreferences(data, actor.userId);
}

export async function dismissLearningPreferences(
  client: SupabaseClient,
  actor: ProfileActor,
  expectedRevision: number,
) {
  const { data, error } = await client
    .rpc('dismiss_learner_learning_preferences', {
      p_expected_revision: expectedRevision,
    })
    .setHeader('Authorization', `Bearer ${actor.accessToken}`)
    .single();
  if (error) throw new LearningPreferencesError(error.code);
  return parsePreferences(data, actor.userId);
}
