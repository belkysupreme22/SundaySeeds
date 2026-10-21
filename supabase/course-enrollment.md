# Verified enrollment and authorized course reading

Source: `migrations/20261021080323_verified_course_enrollment.sql`. Applied additively to `sundayseeds-dev` (`ypykbtwwyebsfqtdvodj`) through Supabase MCP on 21 October 2026; tool returned success. Migration history returned actual version `20261021080323`, which is mirrored locally. No invented migration filename, CLI/dependency installation, blanket push or replay of the profile foundation.

## Scope

Adds private actor/course enrollment and edition-bound reading content. There is no staff publishing/grant/class service, submitted knowledge check, score, completion record, saved reading progress or guest-history transfer. The owner accepted development use of Faith for everyday life, keeping joined editions and a first-course all-four-checks completion rule; these source operations do not implement trusted assessment or make production content reviewed.

Public catalog metadata remains separate. Authenticated clients receive no direct access or writes to either new private table. RLS is enabled on both. Narrow private `SECURITY DEFINER` operations are necessary to read trusted Auth verification/session facts and transact sealed enrollment/content tables; public RPC wrappers are `SECURITY INVOKER`. Private schema usage plus EXECUTE on exactly those three operations is granted to authenticated, with no table grants. Internal validator/actor/projection/trigger helpers receive no client EXECUTE. Default PUBLIC execution is explicitly revoked; no editable metadata or caller-supplied actor ID grants access.

## RPC contract

All three RPCs validate `auth.uid()` against an existing, nonanonymous, nonbanned Auth user and require `email_confirmed_at`. The request JWT's `session_id` must identify that actor's current `auth.sessions` row, with `not_after` absent or in the future. Missing/deleted/revoked/expired sessions fail closed; normal JWT validity is also enforced by the API. No anonymous client execute is granted.

| RPC | Result |
| --- | --- |
| `get_my_course_enrollment(p_course_id uuid)` | JSON null if no own enrollment; otherwise the projection below. A failed request must not become “not joined.” |
| `join_course(p_course_id uuid, p_offering_revision integer)` | `{outcome: 'joined' | 'already_joined', enrollment: projection}`. No enrollment on a stale/unavailable offering or incomplete content. |
| `get_enrolled_course_lesson(p_course_id uuid, p_lesson_id text)` | `{enrollment_id,user_id,course_id,release_id,lesson}` only after current enrollment, current availability and exact pinned-outline membership are enforced in the content query. |

Enrollment projection: `{enrollment_id,user_id,course_id,release_id,state,joined_at,edition_number,available,title,modules}`. `state` is `active` or `revoked`; `available` requires an active record and currently available pinned release. Title/modules come from that immutable release, which may differ from the currently offered edition. The projection contains metadata, not lesson bodies, answers or another learner's records. An unavailable/revoked record remains distinguishable from no enrollment.

`lesson` contains only `{id,title,subtitle,scripture,estimatedMinutes,intro,outcomes:[{title,description}],memoryVerse:{text,reference},sections:[{id,title,body}]}`. Reflections are authored prompts inside reading text, not submitted private responses. No quiz question, correct index, explanation/answer key or score is stored or returned by this slice.

## Enrollment and edition invariants

- Unique `(user_id,course_id)` is the concurrency backstop. A transaction advisory lock derived from actor/course serializes first joins/retries. Repeating Join returns the same enrollment and release, including after a lost acknowledgement.
- Existing records are reconciled before a new offering revision is considered. Revoked records return `access_revoked` and never reactivate; active records stay pinned and return `already_joined`. If their release is withdrawn, the returned metadata says `available:false`; no body can be read.
- A new Join locates the candidate release, locks release before offering, rechecks both and requires the exact reviewed offering revision. Changed release/revision returns `course_changed`; the UI must refresh details for another explicit action, not silently retry using the new revision.
- A new Join requires open admission, available release/offering, valid released outline and an actual immutable reading for every released lesson. Listing and new joining are independent; unlisted available offerings can still be explicitly joined if open.
- Enrollment pin, actor, identity and joined timestamp are immutable. The only supported update direction is active to revoked; no client revoke/grant API is introduced. Account deletion can cascade its private enrollment row; no broader retention/export policy is invented.
- Closing new joins does not remove an active learner's access to an available pinned edition. Body reads independently check active ownership and current pinned availability even if catalog/own-enrollment was read earlier. Locks linearize concurrent revocation/withdrawal with the read; already delivered content cannot be recalled.

## Reading import and admission

`course_library_private.course_lesson_readings` columns are `release_id`, `course_id`, `lesson_id`, `body`. Composite foreign keys bind course/release; `(release_id,lesson_id)` is unique. Import must use the already selected development release, not generate a replacement curriculum or infer account history from guest IDs.

The top-level and nested JSON allowlists reject questions, answers, arbitrary extra keys, empty required text, duplicate section IDs and invalid time estimates. Body identity, title, Scripture and any known outline estimate must agree with the release. Update/delete always fail. Inserts are permitted only while joins are closed and no enrollment pins that release.

An admission trigger blocks `joins_open=true` until every exact outline lesson has its real reading row. Once full, fixed outline IDs and the primary key prevent further appends even if admission later closes before the first enrollment. Imported data therefore cannot turn an already enrollable edition into a different body set. New content changes require a new edition; urgent correction/replacement and edition migration are still separate policy work.

`seeds/development_course_readings.sql` was executed once on that intended development project after the schema. It imports all four approved existing readings while admission is closed, then opens only the development offering in the same transaction. UUIDs are resolved from the existing development offering, never hardcoded. Content was extracted from TypeScript source literals with the compiler AST; no app was run. Questions/answer keys and sample progress were excluded. Re-running intentionally fails instead of changing an enrolled edition. The SQL tool acknowledged execution without error; this is import evidence, not learner/permission acceptance. Production teaching/Scripture-rights review remains pending.

## Safe failures

| SQLSTATE / message | Intended client treatment |
| --- | --- |
| `42501` / `authentication_required` | Session no longer valid; require ordinary sign-in/recheck, discard actor-owned UI |
| `42501` / `email_verification_required` | Explain verification requirement; do not enroll |
| `42501` / `access_revoked` | Explain unavailable access; Join cannot restore it |
| `40001` / `course_changed` | Refresh public details and require explicit Join on acknowledged revision |
| `P0002` / `course_unavailable` | New enrollment unavailable/closed/incomplete; no fabricated success |
| `P0002` / `lesson_unavailable` | No authorized body for the exact current context; no sample fallback |
| `22023` / `invalid_course_request` | Invalid input; show safe request failure |
| Constraint/immutability errors | Import/admin failure, not raw learner-facing provider text |

Network/unknown mutation outcomes reconcile through the same actor/course lookup and idempotent Join, never a replacement identity or automatic new-edition enrollment. Mobile requests must pin initiating JWT and discard results after actor/session changes. This slice does not persist ID-07 navigation intent or auto-enroll on sign-in, confirmation or recovery.

## Lock order and pending owner checks

New Join and reading import use release-before-offering locks where both are needed. The older catalog offering-update trigger can still lock offering before release, while withdrawal synchronization does the reverse. No staff mutation API is enabled here. Future publishing/withdrawal operations must acquire release before offering and retry aborted whole transactions; owner concurrency acceptance remains pending. Do not call the existing direct administrative write paths proven under contention.

Lead performed schema preflight (project identity/health and referenced Auth column definitions), migration application and development import only. Independent source review found no blocking SQL/permission/API issue. No tests, behavioral SQL/advisors, builds, typecheck/lint, runtime or native verification were run. Source review does not establish permission correctness. Required owner checks after deployment: verified versus unverified/anonymous/deleted/banned/revoked sessions; actor-isolated own reads; direct-table/function denial; repeated/concurrent/lost-response Join; stale offering; missing body coverage; malformed/extra-key import; fixed pin through new editions/closed joins; revoked enrollment/withdrawn release; guessed/cross-course lesson IDs; account switch during pending requests; revoked access while reading; public catalog still omits bodies and answers. No fixture user or enrollment was created.
