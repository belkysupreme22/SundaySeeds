# Staff course-draft foundation

28 October 2026. **Applied to development**, following 203 passing hosted rollback
assertions and 11 passing isolated concurrency groups (11 observed waits).
Installed grants/functions/advisors were inspected; no new security warning.
No staff identity, assignment, administrator bootstrap, draft import or publication
was activated. The dashboard remains a session-only prototype; staff sign-in and
editor integration follow separately. See the [verification/deployment record](staff-draft-verification.md).

Source migration: `migrations/20261024084826_staff_course_drafts.sql`, generated
with cached Supabase CLI2.121.0. Do not blanket-push local history: earlier manually
applied foundations and several source/hosted version differences remain documented
in the existing deployment records.

## Authority and storage

Use the existing verified live-session actor helper. Course enrollment, display
name, user-editable metadata and the dashboard workspace selector confer no staff
authority. A separate server-owned author assignment binds one Auth user to one
existing stable course. No organization/class data is invented for this slice.

Private `staff_authoring_private` storage holds assignments, one shared working
draft per course, request receipts and minimal successful-save audit records.
RLS and revoked direct table privileges deny clients, including service-role API
clients, direct access. Public invoker RPC wrappers call narrowly granted private
operations that check the current actor and assignment. Internal helpers have no
client execution grant; all functions use empty search paths.

There is no grant-management endpoint or seeded assignment. An initial trusted
provisioning/recovery process and actual staff identities still require owner
selection. The prototype directory and Access examples cannot provision anything.
An author assignment grants only assigned-draft read/save, not admin authority,
publication, review approval, learner records or quiz answer access outside the
author's own assigned teaching draft.

Assignment revocation is one-way in this foundation. Restoring authority requires
a separately reviewed lifecycle operation, not editing a role label. Shared drafts
are course-owned: deleting one Auth user removes their assignments, receipts and
save-event attribution records, and nulls their draft updater reference while
retaining shared draft content and other authors' records. This bounded behavior
is not a production audit-retention/deletion policy.

## Client operations

Three RPCs return JSON objects, not table rows. No operation accepts an
actor ID or a role assertion.

| RPC | Parameters | Result |
| --- | --- | --- |
| `list_my_authoring_courses()` | None | `{actor_id,courses:[{course_id,draft_id,revision,title}]}` for current active assignments only |
| `get_my_course_draft` | `p_course_id uuid` | `{actor_id,course_id,draft:null \| Draft}`; authorized absence is distinct from denied access |
| `save_my_course_draft` | `p_course_id uuid,p_expected_revision bigint,p_request_key uuid,p_content jsonb` | `{actor_id,course_id,request_key,saved_revision,draft:Draft}` |

`Draft` is `{draft_id,revision,content,updated_at}`. No existing draft is represented
by `draft:null` on Get and null `draft_id`/revision0 in the assignment list; Get/List
never insert a draft. A nonempty draft revision is a positive JavaScript-safe
integer. A blank title is legitimate incomplete authoring content, not a fabricated
public-course title.

Expected revision0 creates only when no draft exists. An update requires the exact
current revision. A new successful request increments the revision even when its
content equals the previous save; an exact retry of the same request does not.
A stale revision is a conflict, never a last-write-wins overwrite.

The request key is scoped to the initiating actor. A retry must retain its original
course, expected revision and content. A changed payload under the same key is
rejected. Replaying a committed request returns its original `saved_revision`
alongside the **current authorized draft**, which may be newer because another
author saved afterward. The client must not replace newer content with an old
receipt snapshot or call the newer draft the original saved content.

Every replay rechecks live session and current assignment. Revocation also denies
recovery of an old private draft. No automatic durable browser journal or editor
retry behavior is implemented by this database source; adapters must preserve a
pending request before sending, pin the initiating token, validate response scope
and fence account/resource changes when UI integration follows.

| SQLSTATE | Message | Client meaning |
| --- | --- | --- |
| `42501` | `authentication_required` / `email_verification_required` | Sign in with a current verified account |
| `42501` | `staff_access_required` | No active assignment; also used for unknown or guessed course IDs |
| `22023` | `invalid_draft_request` / `invalid_draft_content` | Malformed request or unsupported draft content |
| `22023` | `draft_request_mismatch` | Request key was already bound to a different save |
| `40001` | `draft_revision_conflict` | Reload/review the current draft before an explicit new save |

Raw database messages and private content do not belong in product error copy.
An uncertain transport outcome requires same-request reconciliation, not a new key.

## Draft format version1

All fields below are required; nullability is explicit. This is an authoring
aggregate, not a learner reading body or a publication payload. Empty strings and
arrays may be saved so teachers can resume unfinished work. IDs remain nonblank
stable slugs; a nullable correct answer allows an incomplete quiz.

```text
{
  schemaVersion: 1,
  course: {
    title, summary, audience, topics: string[], learningGoals: string[],
    outcomes: string[], language, level: string | null,
    estimatedMinutes: positive integer | null,
    estimateBasis: "reading" | "full_study" | null
  },
  modules: [{ id, title, lessonIds: string[] }],
  lessons: [{
    id, title, subtitle, scripture, estimatedMinutes: positive integer | null,
    intro, outcomes: [{ title, description }],
    memoryVerse: { text, reference }, sections: [{ id, title, body }],
    reflection,
    quiz: [{ id, prompt, options: [{ id, text }],
             correctOptionId: string | null, explanation }]
  }]
}
```

Unknown keys, embedded image fields and temporary image objects are rejected;
there is no connected media upload. Reflection is retained as draft content, but
requires an agreed learner representation before publication. Required reading
fields are explicitly authored, never manufactured from prototype fixtures.

Aggregate limits: at most1MiB of UTF-8 canonical JSON text, 100 modules, 1000 draft
lessons, 12 sections and six outcomes per lesson, ten questions per lesson and four
options per question. Course topic/goal/outcome arrays have at most20 entries.
Empty modules, quizzes, options and unlinked draft lessons are allowed. Linked
lesson IDs must exist and appear at most once in the outline. Module/lesson IDs
are unique across their respective arrays; section, question and option IDs are
unique within their own parent. A nonnull correct answer must name an existing
option. Course estimate and basis must both be null or both be set.

String bounds: titles/topics200 characters, summary/outcome descriptions/course
goals/course outcomes2000, audience/Scripture/verse reference300, subtitle500,
language50 and level100. Introduction, section body, reflection, verse text,
question prompt/explanation and option text permit up to10000 characters each.
Minute values are null or positive JavaScript-safe integers. IDs are lowercase
hyphenated slugs up to120 characters. Inline data URLs are rejected in text too.

These are draft storage bounds enforced by the migration's validator;
publication readiness is a separate later check. In particular, the connected
learner contract still requires one complete nonempty knowledge check per lesson.
Saving a reading-only draft does not approve reading-only course publication.

## Serialization, audit and owner verification

Save serializes the actor's request key, locks the Auth-user parent for key share,
rechecks the live verified actor, locks the active assignment for share, then
serializes/locks the course draft. Get follows the same parent/assignment order
before reading a draft. The Auth-parent lock precedes assignment and updater/
receipt foreign-key work to avoid an inversion against Auth deletion cascades.
Session rows are not locked; this is not an in-flight session-cancellation claim.
The same course cannot receive competing
first inserts or lose a concurrent update. A trusted assignment update waits for
the held assignment lock: a write that already holds authority may commit before
revocation, while requests after committed revocation are denied. This does not
promise instantaneous cancellation of an in-flight Auth/session operation.

List uses the current query snapshot and filters active assignments; it does not
hold assignment row locks. A list response is navigation information, never proof
of continuing draft access. Get/Save always perform the current locked check.

The new slice does not lock or mutate releases, offerings, enrollment or attempts,
so it adds no inverse lock order to learner learning operations. Future grant APIs,
review and publication must extend this lock contract deliberately.

Successful saves append a receipt and a minimal event in the same transaction.
Exact retries do not create additional successful-save events; rejected calls and
rolled-back saves create none. Receipts bind the original payload privately for
reconciliation; their retention/storage policy must be resolved before production.
Audit events contain identifiers/revision/time, never draft text, passwords,
tokens or learner reflections. There is no client audit-reader API in this slice.

The executed checks in `tests/staff_course_drafts.test.sql` cover live
session/assignment denial, cross-scope isolation, read-without-creation, CAS and
same-key reconciliation, malformed content/privileges, revocation and isolated
Auth-deletion behavior. The separate local concurrency runner covers competing
first saves, concurrent updates, duplicate keys, both revocation orders and
Get/Save against both Auth-deletion orders. See the verification record for actual
counts and limits. Unexpected transaction failures still require retry of
the whole original request, never a new request key or partial-write assumption.

Source review, permission/behavior and isolated concurrency checks, development
application and installed-schema inspection are complete for this foundation.
Hosted migration version is `20261028081455`; source version remains
`20261024084826`. Only the reviewed additive migration was applied, without
replaying historical foundations. Provision only owner-selected assignments via
a reviewed trusted process and integrate the staff UI separately. Do not use real
learner accounts as fixtures or infer authority from a deadline. App/provider/
network/native acceptance and existing mobile acceptance remain pending.

References: [staff workflow plan](../docs/staff-workflow-plan.md),
[Supabase database function security](https://supabase.com/docs/guides/database/functions),
[Supabase sessions](https://supabase.com/docs/guides/auth/sessions) and
[PostgreSQL locks](https://www.postgresql.org/docs/17/explicit-locking.html).
