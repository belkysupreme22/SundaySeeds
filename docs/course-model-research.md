# Real-world course structures and SundaySeeds scenarios

20 October 2026. Research and product proposal, not a final backend contract.

The owner reviewed onboarding, then asked for connected-course planning. When
asked to choose initial content and course-update behavior, they requested deeper
research into how real courses work. Latest direction: establish real learner,
teacher and Sunday-school scenarios before extending the design or database.
Neither first connected content nor the course-edition policy is selected yet.

## What was investigated

Official platform guidance and publicly described curricula were reviewed for
Udemy, Coursera, Moodle, BibleProject, Bible Engagement Project and Lifeway, plus
Carnegie Mellon's course-design guidance. These establish documented structures and
product behavior, not observed SundaySeeds users, live app testing or evidence that
one competitor's full workflow should be copied. No competitor content is licensed
for import by this research. Proposed scenarios below are our synthesis.

## Structures that exist in practice

| Example and primary source | Documented structure or behavior | Implication |
| --- | --- | --- |
| [Udemy course outlining](https://teach.udemy.com/course-creation/outline-your-course/) and [curriculum authoring](https://business-support.udemy.com/hc/en-us/articles/115005523368-How-to-add-sections-lectures-and-video-content-to-your-course) | Course → sections → curriculum items. Sections organize learning objectives; items include lectures, practice and assessments. Text lectures are supported as well as video | A course needs a learning purpose and progression. A lesson need not equal a video or a quiz |
| [Coursera: Learning How to Learn](https://www.coursera.org/learn/learning-how-to-learn) | This specific course has four modules combining videos, readings, assignments and some peer review. Optional activities affect time estimates | Distinguish course, module and activity. This is an example, not a universal Coursera template or a reason to add peer marking here |
| [Moodle course formats](https://docs.moodle.org/501/en/Standard_course_formats) | Sections can follow topics/objectives or a weekly schedule; other formats also exist | A topic-based course and a scheduled class can use the same learning material with different pacing |
| [BibleProject: Introduction to the Hebrew Bible](https://bibleproject.com/classroom/introduction-to-the-hebrew-bible/overview) | Five modules, 29 sessions, 14h44m of lecture time, stated objectives and a facilitator guide | Real Bible courses can use our course → module → lesson hierarchy and support both individual and group use |
| [Bible Engagement Project: Listen Adult](https://bibleengagementproject.com/Curriculum/Listen/Adults), [adult overview](https://bibleengagementproject.com/-/media/BibleEngagementProject/Launch/Listen-Overview.pdf) and [Learn scope](https://bibleengagementproject.com/-/media/BibleEngagementProject/Downloads/Learn/Learn%20Scope%20and%20Sequence.pdf) | Listen is a 40-week curriculum. Adult group sessions combine theme discussion/video, Scripture questions/commentary and reflection, with five supporting personal devotions. Learn groups four sessions into each of ten volumes | A weekly group meeting and short personal study are distinct experiences; devotions are supporting activities, not separate courses |
| [Lifeway: adult Bible Studies for Life, Fall 2026](https://www.lifeway.com/en/product/bible-studies-for-life-adult-personal-study-guide-niv-fall-2026-M00101781/005573494.2026-FAL) | The guide combines six- and seven-session topical studies. Scripture, discussion and application reinforce a main point, with personal study and separate leader resources | A short series can run directly through sessions without an extra visible module layer. Leader preparation differs from learner study |
| [Lifeway: Explore the Bible Adults](https://www.lifeway.com/en/shop/explore-the-bible/adults) | Book-by-book study emphasizes understanding context and applying Scripture | Topic, Bible-book study and foundational course are organizing approaches, rather than different kinds of account or enrollment |

Course length varies with the learning purpose; these sources do not establish a
universal number of modules, lessons or weeks. A compact course can have one module,
and a longer one several. Avoid padding a short study to match an arbitrary count.

### Teaching is more than arranging content

[Carnegie Mellon's Eberly Center](https://www.cmu.edu/teaching/designteach/design/learningobjectives.html)
recommends clear learning objectives and alignment with assessment and instruction.
For SundaySeeds, start with what an adult should understand or be able to do after
studying, then choose Scripture, explanation, practice and checks that support it.
A topic label such as Prayer is not itself an outcome.

Separate these concepts:

| Concept | Plain meaning | SundaySeeds example / proposed boundary |
| --- | --- | --- |
| Course | A coherent study with an audience and learning purpose | Faith for everyday life, currently a bundled sample |
| Module/unit | A meaningful grouping within that study | Put down roots; Live your faith, already present |
| Lesson | One focused learning experience | A moment with God, already present |
| Content/activity | What happens within a lesson | Scripture, explanation, reflection, practice and an authored knowledge check |
| Class/group | People studying together, with a teacher and access rules | An invited adult Sunday group, currently a prototype concept |
| Class meeting | A dated occurrence with a planned lesson or discussion | Sunday's discussion of prayer; not another copy of the course |
| Learning path | An optional sequence of several courses | A future foundations pathway, not required for the first connected course |
| Published edition | A released arrangement/content snapshot | The course curriculum against which an enrollment and progress can be understood |

A course is reusable content. A class is a group of people. A meeting is an event.
These must remain separate even if a class uses one course for several weeks.

### Reflection and knowledge checks have different jobs

BibleProject's [current feature update](https://help.bibleproject.com/hc/en-us/articles/38653122314775-Updates-to-Classroom-Notes-Reflections-and-Quizzes)
states that personal notes, saved reflection responses and quizzes were removed
in May 2026; reflection questions remain, with no new quiz content. Do not describe
its current model as a mandatory graded-quiz journey.

SundaySeeds already has owner-confirmed automatic answer/explanation feedback.
Keep that decision. Our inference is to score factual understanding where a check
exists, while treating personal reflection/application as ungraded. Never infer
spiritual maturity, belief or real-life behavior from a quiz result. Saving private
reflection text is a separate future feature requiring privacy/lifecycle decisions.

[Moodle activity completion](https://docs.moodle.org/503/en/Activity_completion)
allows different activity criteria, while [course completion](https://docs.moodle.org/503/en/Course_completion)
aggregates criteria and is separate from access restrictions. This demonstrates
why SundaySeeds must define reading position, checked understanding, completion,
score and permission separately. Our connected completion rule remains B1-08;
research does not silently accept a pass mark, mandatory teacher approval or locks.

## Real-world scenarios to design and enforce

These are proposed SundaySeeds operating scenarios grounded in the patterns above,
not claims that every referenced provider implements every step or exception.

### 1. An adult starts an individual study

A learner wants to understand prayer and has ten minutes available. They browse
without an account, inspect the course purpose, Scripture focus, audience, lesson
outline and estimates, then explicitly join after verified sign-in. Skipped profile
questions never block joining. A starting suggestion opens details, not an automatic
enrollment. The learner can follow the recommended order and revisit material.

Backend implication: public published summaries, private own enrollment and
protected content reads are separate. The trusted operation checks verification
and availability; a displayed course or remembered URL is not access authority.

### 2. A teacher leads a Sunday school group

A teacher chooses an approved study, plans a particular lesson for Sunday's
meeting and invites adult members. A member studies beforehand, participates in
discussion, then tries the practical activity during the week. Someone who misses
Sunday can catch up independently. Personal course progress and group pace may
differ; missing a meeting is not automatically a failed lesson. A late joiner needs
the upcoming group lesson plus a clear personal starting point; joining must not
invent earlier attendance or mark prior lessons complete.

The [Bible Engagement Project FAQ](https://bibleengagementproject.com/faq) separates
open library/account access from invited groups and says leaders cannot see others'
progress. Our existing reporting prototype is a different proposed product choice:
we must explicitly decide what a teacher may see. Membership must not imply access
to private reflection, all account activity, unrelated courses or other groups.

Backend implication: class membership, assigned content, meeting plans and permitted
reporting scope are distinct. Invitation and teacher-access implementation remain
later slices, not additional fields hidden inside public course enrollment.

### 3. An author prepares and publishes a study

An author identifies the audience and outcomes, creates an outline, writes lessons,
checks Scripture/translation and image rights, authors factual checks, and previews
the complete learning journey. An authorized publisher releases reviewed content.
Teachers choose released material; learner screens never read a changing draft.
Editing and publication are different actions, and an author is not automatically
a system administrator or allowed to publish for every organization.

Backend implication: drafts/releases, accountable content ownership, publisher
capabilities and a reviewed public projection. Existing teacher studio previews
and publication examples are session-only simulations, not that authority layer.

### 4. A course changes while someone is studying

Suppose two of four required lessons are finished: the learner sees 50%. An author
adds two required lessons. If the same course changes immediately, unchanged
completed work could now display as two of six, about 33%. If the learner retains
the edition they began, the original two-of-four remains understandable.

[Udemy's maintenance guidance](https://teach.udemy.com/publishing/maintain-your-course/)
explicitly describes updates changing progress and affecting access to completion
certificates in its interface until added material is completed. That is a real
policy choice; it does not establish the right choice for SundaySeeds.

| Update policy | What the learner experiences | Tradeoff |
| --- | --- | --- |
| Living course, immediate changes | New material appears in the existing curriculum; completion rules may change | Fresh content quickly, but progress can change and removed items need explicit handling |
| Stable course edition | Existing learners keep their starting curriculum; a new edition can be offered separately | Predictable progress, but older content needs maintenance and a later update path |

Recommendation for discussion: use stable published editions for major structural
changes, and a deliberate correction process for factual errors, unsafe material or
rights withdrawal. A stable edition is not a promise to keep withdrawn content
available. Minor typo correction, scored-answer correction and a new required
lesson must not be treated as the same update. The exact correction/migration rules
are unresolved. No learner-facing version-management feature is required now.

### 5. A save or join is interrupted

The learner taps Join, connectivity drops and no response arrives. They need a way
to discover whether enrollment succeeded without creating another enrollment.
Likewise, resubmitting a quiz after a timeout must reconcile the same attempt,
not manufacture new attempts or show unsaved success. Changing accounts while a
request is pending must not move the old account's result into the new account.

These are SundaySeeds reliability requirements derived from our existing contract,
not competitor guarantees. Full offline learning/synchronization remains deferred;
the app must state when a connected operation needs a connection.

### 6. A learner returns or studies on another device

After sign-in on another supported device, the learner expects acknowledged
account progress to resume. Bookmarks and reading position have different meaning
from a finished knowledge check. Guest sample progress is currently device-only
and must remain separate; it must not appear as trusted connected course history.
An approved future import of course content does not import old guest attempts.

Backend implication: actor/course/edition/lesson references, acknowledged server
records and explicit distinctions between zero, missing data and load failure.
Connected progress is a later slice; current preferences/names are not evidence
that learning progress already syncs. If one lesson is reused in two courses,
completion credit must follow an explicit course/edition policy, not a global
lesson-ID match that silently completes material in another course.

### 7. Content or access is withdrawn

Stopping new enrollment, hiding a catalog listing, withdrawing a particular release
and revoking one learner's access are different operations. An existing learner
should not lose access just because new joins close; a rights/safety withdrawal may
need to block even an old edition. A revoked enrollment cannot reactivate by
retrying Join. Preserve an honest explanation and appropriate historical records
according to the eventual retention policy, rather than silently deleting progress.

### 8. A class needs another teacher

A substitute may need the assigned lesson and leader guide for that class, without
becoming an administrator or seeing every learner's account. A teacher can also
study personally; participating as a learner grants no publishing rights. Admin
and staff bootstrap/delegation remain B1-06 decisions. Do not infer authority from
a dropdown selection, profile metadata or a prototype role label.

## Time estimates and pacing

Separate reading/video time, total lesson effort and suggested weekly cadence.
BibleProject's overview labels its 14h 44m as lecture time. Lifeway's session counts
refer to study meetings/series, while BEP's 40 weeks refer to a curriculum schedule.
None can be equated with the learner's five- or ten-minute onboarding preference.

Our course overview labels the sum of four lesson estimates as 26 minutes of
reading; other lesson displays use a generic minutes label. These are authored
estimates, not measured study time, and their full-effort basis needs review. They
do not establish how long reflection and quizzes take. Connected course metadata must
label the estimate basis and show unknown values honestly. Prefer a short next
activity for limited time rather than promising a whole course fits one session.

## What our current app supports and what is missing

| Area | Current evidence | Work required for real use |
| --- | --- | --- |
| Course structure | One sample course, two modules, four lessons; reading/reflection/automatic checks | Review a coherent audience/outcomes/sequence and approve real connected content |
| Discovery/onboarding | Account-owned optional preferences; sample topic/time lesson hints | Published course metadata, real availability and meaningful matching |
| Teacher preparation | Authoring, preview and release/class/report simulations | Durable drafts, reviewed publication, real identity/capability enforcement |
| Joining/access | Identity and verification work in development; no connected course service | Atomic enrollment, authorized content, clear closed/withdrawn/revoked behavior |
| Learning progress | Device sample positions/bookmarks/quiz results | Trusted account-owned attempts, completion and cross-device reconciliation |
| Weekly group study | Prototype classes and invitations; no connected membership | Invitations, scoped assignment, group pace and agreed teacher visibility |
| Content updates | Prototype publication versions; no connected edition policy | Release/correction/retention rules and explicit progress compatibility |
| Reliability | Source guards and local recovery; incomplete owner edge-case coverage | Recorded permission/concurrency/network/native acceptance before a pilot |

The hierarchy we designed is plausible. The main missing work is real educational
content and operational behavior, rather than another layer of visual polish.

## Recommended next deliverable

Prepare one **course blueprint**, before schema or import:

- Named adult audience, starting knowledge, learning purpose and observable outcomes.
- Topic/book/theme scope, Scripture/translation/source rights and accountable reviewer.
- Modules only where useful; a focused purpose for each lesson, Scripture, explanation,
  reflection/application and any authored factual knowledge check.
- Required versus optional items, estimate basis, recommended order and proposed
  completion meaning. Confirm current automatic-feedback policy separately from grading.
- How an individual uses it and, if relevant later, how a teacher uses it with a group.
- A simple published-edition/update proposal illustrated with a real content change.

Use the existing course as a candidate to review, not an automatically approved
production import. Research does not require creating a new fictional catalog.
After the blueprint is reviewed, finalize the focused catalog/enrollment contract,
then define additive database and mobile adapters. No design/app/schema/deployment,
credentials, tests/builds or runtime checks changed during this research.

A small pilot with an actual curriculum author/teacher and adult learners is still
needed to test these assumptions. Source research cannot substitute for that evidence.
