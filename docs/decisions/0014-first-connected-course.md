# 0014 — First connected development course and learner completion

Date: 21 October 2026. Status: accepted owner choices; connected implementation is incremental.

## Decision

The owner explicitly selected the three recommended answers after reviewing the course blueprint and connected-access draft:

- Use **Faith for everyday life** as the first connected development candidate. Production teaching and Scripture-rights review remain required.
- Preserve the edition a learner joined. Later editions require an explicit choice to move; curriculum changes must not silently change the learner’s completion denominator.
- For this first four-lesson course, completion means finishing all four knowledge checks, with retries and answer explanations, no minimum score, and optional private reflection.

## Consequences and limits

Keep stable course identity distinct from immutable edition content and current availability. Withdrawal can still remove access; this decision does not promise permanent access. Do not silently transfer guest history or credit shared lesson identities across course editions.

These answers confirm only the stated B1-07/08 subset. Correction/replacement behavior, in-flight submissions, score aggregation, retry frequency/limits, edition migration/progress transfer, class assignment pinning and teacher reporting privacy are not specified by these answers. They need decisions before those operations are enabled. The 24-hour auth-return proposal ID-07 and content/staff authority B1-04/06 remain separate.

The first implementation increment exposes public development metadata and outline only, with joins closed. It grants no teacher publication authority and includes no connected lesson bodies, answer keys, attempts or account learning history. Public metadata can be browsed without creating an enrollment. Enrollment/access/progress services follow as separate increments.

## Verification

Owner choices are recorded from explicit answers, not inferred from a general proceed instruction. Database application and runtime acceptance are recorded separately in the implementation plan and Supabase course-library guide. No behavioral check is established by this decision document.
