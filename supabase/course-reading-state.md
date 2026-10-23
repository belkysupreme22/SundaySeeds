# Connected course reading state

Applied additively to **sundayseeds-dev** (`ypykbtwwyebsfqtdvodj`) on
23 October 2026 through Supabase MCP, which returned success. Source migration
`20261023130307_connected_course_reading_state.sql` corresponds to hosted migration
`20261023130755` (`connected_course_reading_state`). Do not replay via blanket push;
reconcile hosted/source migration history explicitly before CLI deployment.

Read-only metadata inspection confirmed RLS enabled, zero initial rows, no direct
anon/authenticated/service_role table privileges, public invoker wrappers, private
actor-checked definer entrypoints, owner-only helpers and empty search paths.
No learner state or sample history was inserted. DDL acknowledgement and catalog
inspection do not establish behavior, permissions under real requests or concurrency.
Tests, typecheck, runtime and native acceptance remain pending.

This slice records an acknowledged reading section and a lesson bookmark for an
adult learner's own active course enrollment. It never creates a completion fact,
quiz result, reading duration, history, class membership or sample-data transfer.
The enrollment's immutable joined edition supplies the lesson and section IDs.

## RPC contract

All three public functions are `SECURITY INVOKER` wrappers. Their private definer
entrypoints validate the live verified actor through `verified_course_actor()`;
the caller cannot supply a user, enrollment or release ID.

| Function | Parameters | Behavior |
| --- | --- | --- |
| `get_my_course_reading_state` | `p_course_id uuid`, `p_lesson_id text` | Returns authorized own state. An absent row is known empty after access and exact released-lesson checks. |
| `save_course_reading_position` | Above, nonnull `p_section_id text`, `p_expected_revision bigint` | Sets a real immutable section ID. Only `position_revision` advances on change. |
| `set_course_lesson_bookmark` | Course/lesson, `p_is_bookmarked boolean`, `p_expected_revision bigint` | Sets the explicit desired value. Only `bookmark_revision` advances on change. |

Every success returns the same flat, explicit acknowledgment:

```json
{
  "enrollment_id": "uuid",
  "user_id": "uuid",
  "course_id": "uuid",
  "release_id": "uuid",
  "lesson_id": "exact-released-lesson-id",
  "section_id": null,
  "position_revision": 0,
  "is_bookmarked": false,
  "bookmark_revision": 0
}
```

Revisions are nonnegative integers no greater than JavaScript's maximum safe
integer, `9007199254740991`. A null section always has position revision zero;
writing a null section is rejected. Zero means known empty or an unchanged initial field;
an unavailable request is an error and must never become an empty acknowledgment.
Lesson and section IDs use exact membership, including existing nonblank IDs
that are not slugs. Sections from another lesson or edition are rejected.

Writes require the last acknowledged revision of the field being changed. A
stale request for a different value raises `reading_state_conflict` and retains
the newer server value. A request whose desired value already equals the server
value returns current state without advancing either revision, including a
stale retry after a lost response. A future expected revision always conflicts.
This is acknowledgment of the current value; it does not prove which device
originally wrote it. At maximum revision, a changed value conflicts rather than
overflowing the client-safe range. A bookmark write never conflicts solely
because another device advanced the position, and vice versa.

## Integrity and access

`course_library_private.lesson_reading_state` has an enrollment/lesson primary
key, an exact composite actor/course/release enrollment foreign key with deletion
cascade, and an immutable-reading foreign key. Its trigger prevents scope moves,
unknown sections and revision changes unrelated to the corresponding field.
Rows start empty before their first field mutation. The released outline and
reading body both need the exact lesson; current public offering closure does
not revoke a pinned enrollment. Revoked enrollment or unavailable pinned release
blocks reads, mutations and unchanged-value retries alike.

Every operation takes one actor/enrollment/lesson advisory transaction lock,
then an enrollment `SHARE` lock, a release `SHARE` lock and finally the state row
lock. Writes establish missing rows with `ON CONFLICT DO NOTHING` and select
`FOR UPDATE` before compare-and-set. This serializes competing first writes and
gives enrollment revocation/release withdrawal a transaction boundary. The
functions do not promise in-flight Auth revocation serialization beyond the
existing live-session check at function entry.

RLS is enabled with no direct client policy; table privileges are revoked from
`PUBLIC`, `anon`, `authenticated` and `service_role`. Only authenticated callers
receive execute on the three wrappers and their actor-checked private
entrypoints. Internal helpers/trigger functions remain revoked. Every function
has an empty search path. Auth deletion cascades through the enrollment; no
delete-blocking trigger prevents it. No privileged client key is introduced.

| SQLSTATE | Message | Meaning |
| --- | --- | --- |
| `42501` | `authentication_required` | Missing, expired, banned, anonymous or mismatched live session. |
| `42501` | `email_verification_required` | The current live actor is unverified. |
| `42501` | `access_revoked` | The own enrollment has been revoked. |
| `P0002` | `reading_unavailable` | No own enrollment, unavailable pinned release or missing exact reading membership. |
| `22023` | `invalid_reading_request` | Missing/invalid argument, unknown section or invalid internal state transition. |
| `40001` | `reading_state_conflict` | Stale changed value, future revision or exhausted revision range. |

## Delivery and verification

The mobile adapter must bind the acknowledgment to the current actor,
enrollment, course, release and lesson before displaying a saved status. Keep
positions and bookmarks separate from quiz completion. No offline queue,
timestamp ordering or automatic conflict overwrite belongs to this increment.
An uncertain request may be retried with its exact original desired value and
expected field revision. Other changes wait for reloading and explicit choice.

Source-only rollback coverage is in `tests/course_reading_state.test.sql`.
Owner execution is pending. Before claiming synchronization verified, cover
two sessions racing first writes to the same field, independent-field writes,
revocation/withdrawal on both sides of a save, account deletion isolation, and
real Auth/network/mobile acceptance. No test, build or native check was run
while preparing this source.

Official references used: [database functions](https://supabase.com/docs/guides/database/functions),
[row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security),
and [PostgreSQL explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html).


## Installed-schema advisor review

After deployment, security advisors reported no new security WARN for this slice.
The new private table adds an informational
[RLS with no policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy)
finding, consistent with intentional direct-access denial. The project totals nine
such INFO findings; authenticated clients use only the actor-checked RPCs.

Performance advisors add an informational
[composite foreign-key index](https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys)
finding for the enrollment binding and an
[unused index](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)
finding for the new reading index. The primary key already starts with enrollment_id;
review query plans/workload before adding full redundant composite coverage.
Existing public profile/preferences SECURITY DEFINER warnings (four) and disabled
leaked-password protection warning remain as recorded in
[assessment activation](assessment-development-activation.md#advisor-review).
This deployment does not resolve broader Auth/release readiness.
