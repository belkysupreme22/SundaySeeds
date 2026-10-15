import type { LessonDraft } from "../lessons/types";
import { getQuizIssues } from "../quizzes/types";

export interface PublicationVersion {
  number: number;
  lesson: LessonDraft;
  status: "published" | "superseded" | "withdrawn";
}
export interface LessonPublication {
  versions: PublicationVersion[];
  hasDraft: boolean;
  archived: boolean;
}
export const emptyPublication: LessonPublication = {
  versions: [],
  hasDraft: true,
  archived: false,
};
export interface PublicationCheck {
  id: string;
  title: string;
  detail: string;
  issues: string[];
}

export function getPublicationChecks(draft: LessonDraft): PublicationCheck[] {
  const readingIssues =
    draft.sections.length < 1 || draft.sections.length > 12
      ? ["Use one to twelve reading sections."]
      : draft.sections.flatMap((section, index) =>
          !section.title.trim() || !section.body.trim()
            ? [`Complete the heading and reading in section ${index + 1}.`]
            : [],
        );
  const outcomes = draft.outcomes.map((item) => item.trim()).filter(Boolean);
  return [
    {
      id: "title",
      title: "Lesson title",
      detail: draft.title.trim() || "Required",
      issues: draft.title.trim() ? [] : ["Add a lesson title."],
    },
    {
      id: "reading",
      title: "Reading sections",
      detail: `${draft.sections.length} sections`,
      issues: readingIssues,
    },
    {
      id: "outcomes",
      title: "Learning outcomes",
      detail: outcomes.length
        ? `${outcomes.length} outcomes`
        : "Optional · not added",
      issues:
        outcomes.length > 6 || outcomes.some((item) => item.length > 200)
          ? ["Use up to six outcomes of 200 characters each."]
          : [],
    },
    {
      id: "scripture",
      title: "Scripture reference",
      detail: draft.scripture.trim() || "Optional · not added",
      issues: [],
    },
    {
      id: "reflection",
      title: "Reflection",
      detail: draft.reflection.trim()
        ? "Question added"
        : "Optional · not added",
      issues: [],
    },
    {
      id: "quiz",
      title: "Knowledge check",
      detail: draft.quiz?.length
        ? `${draft.quiz.length} questions with automatic feedback`
        : "Optional · reading-only lesson",
      issues: getQuizIssues(draft.quiz ?? []),
    },
    {
      id: "image",
      title: "Cover image",
      detail: draft.image
        ? "Temporary image with description"
        : "Optional · not added",
      issues:
        draft.image && !draft.image.alt.trim()
          ? ["Add a description for the cover image."]
          : [],
    },
  ];
}

export function cloneLesson(draft: LessonDraft): LessonDraft {
  return {
    ...draft,
    outcomes: [...draft.outcomes],
    sections: draft.sections.map((section) => ({ ...section })),
    image: draft.image ? { ...draft.image } : undefined,
    quiz: draft.quiz?.map((question) => ({
      ...question,
      options: question.options.map((option) => ({ ...option })),
    })),
  };
}

export function publicationLabel(record: LessonPublication): string {
  if (record.archived) return "Archived";
  const current = record.versions.find(
    (version) => version.status === "published",
  );
  if (current)
    return record.hasDraft
      ? `Draft changes · simulated v${current.number}`
      : `v${current.number} · Simulated published`;
  return record.versions.length ? "Withdrawn · Draft available" : "Draft";
}
