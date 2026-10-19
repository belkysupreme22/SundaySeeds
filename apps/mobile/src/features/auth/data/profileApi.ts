import type { SupabaseClient } from '@supabase/supabase-js';
import type { AccountProfile } from '../types';

export type ProfileActor = { userId: string; accessToken: string };

export class ProfileRequestError extends Error {
  constructor(readonly code: string) {
    super('Account profile request failed.');
  }
}

export function normalizeAccountName(value: string): string | null {
  const name = value.replace(/\s+/gu, ' ').trim();
  return name || null;
}

function parseProfile(value: unknown, userId: string): AccountProfile {
  if (!value || typeof value !== 'object') throw new ProfileRequestError('invalid_response');
  const row = value as Record<string, unknown>;
  if (
    row.user_id !== userId ||
    !(row.display_name === null || typeof row.display_name === 'string') ||
    typeof row.revision !== 'number' ||
    !Number.isSafeInteger(row.revision) ||
    row.revision < 1 ||
    typeof row.updated_at !== 'string' ||
    !Number.isFinite(Date.parse(row.updated_at))
  ) {
    throw new ProfileRequestError('invalid_response');
  }
  return {
    userId,
    displayName: row.display_name,
    revision: row.revision,
    updatedAt: row.updated_at,
  };
}

export async function ensureOwnProfile(
  client: SupabaseClient,
  actor: ProfileActor,
): Promise<AccountProfile> {
  // Pin the initiating actor's JWT. A later account switch must not retarget this request.
  const { data, error } = await client
    .rpc('ensure_learner_profile')
    .setHeader('Authorization', `Bearer ${actor.accessToken}`)
    .single();
  if (error) throw new ProfileRequestError(error.code);
  return parseProfile(data, actor.userId);
}

export async function updateOwnProfile(
  client: SupabaseClient,
  actor: ProfileActor,
  displayName: string | null,
  expectedRevision: number,
): Promise<AccountProfile> {
  const { data, error } = await client
    .rpc('update_learner_profile', {
      p_display_name: displayName,
      p_expected_revision: expectedRevision,
    })
    .setHeader('Authorization', `Bearer ${actor.accessToken}`)
    .single();
  if (error) throw new ProfileRequestError(error.code);
  return parseProfile(data, actor.userId);
}
