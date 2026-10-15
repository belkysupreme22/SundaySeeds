# Full-page teacher editorial studio

Accepted 15 October 2026 following the owner's request for a course creation studio instead of authoring dialogs.

TeacherDashboard retains course, lesson and simulated-publication state and composes EditorialStudio. Studio navigation is feature state rather than a new router or dependency. The global dashboard sidebar yields space to a persistent course/module/lesson outline; Dashboard restores the normal shell. Administration remains separate.

CourseBrief defines title, introduction, adult audience and learning outcomes. The outline supports module and lesson organization, reuse and confirmed removal while retaining independent drafts. LessonEditor presents Details, Reading, Reflection and Quiz sections in the page, retaining its unsaved buffer across sections and its own preview. CourseReview summarizes saved draft material and content gaps; it is not course-wide publication. Lesson publication/version review remains an explicit simulation using the existing publication hook.

Saving is explicit, in memory and validated; there is no autosave or durable draft service. Dirty lesson/brief buffers require discard confirmation before studio navigation or exit. Duplication copies saved lesson content into an independent draft without publication history. Refresh still clears all prototype state as stated in the shared notice. Backend storage, permissions, media ownership, course releases and progress migration remain separate decisions.

The owner authorized adapting the supplied reference styling beyond exact screenshot layouts. Reference-05's pastel hierarchy and existing approved dashboard styles inform this composition; writing surfaces use fine gray outlines, selected tools retain stronger outlines and offset shadows. No global border replacement is introduced.

Owner runtime/visual review and tests/build/typecheck remain pending. Source formatting and whitespace checks do not establish runtime acceptance.
