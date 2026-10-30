import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchCourseDraft,
  saveCourseDraft,
  type CourseDraftAggregate,
  type DraftLesson,
} from "../data/staffDraftApi";
import type { CourseOutline } from "../courses/useCourseOutlines";
import type { LessonDraft } from "../DraftEditor";

export function outlineToDraftAggregate(
  outline: CourseOutline,
  lessons: LessonDraft[],
): CourseDraftAggregate {
  const draftLessons: DraftLesson[] = lessons.map((l) => ({
    id: l.id,
    title: l.title || "Untitled Lesson",
    subtitle: "",
    scripture: l.scripture || "",
    estimatedMinutes: 8,
    intro: "",
    outcomes: (l.outcomes || []).map((o) => ({
      title: o,
      description: "",
    })),
    memoryVerse: { text: "", reference: "" },
    sections: (l.sections || []).map((s) => ({
      id: s.id,
      title: s.title || "Section",
      body: s.body || "",
    })),
    reflection: l.reflection || "",
    quiz: (l.quiz || []).map((q) => ({
      id: q.id,
      prompt: q.prompt,
      options: q.options.map((opt) => ({ id: opt.id, text: opt.text })),
      correctOptionId: q.correctOptionId,
      explanation: q.explanation || "",
    })),
  }));

  return {
    schemaVersion: "1",
    course: {
      title: outline.title || "Untitled Course",
      summary: outline.summary || "",
      audience: outline.audience || "Adult learners",
      topics: ["Faith"],
      learningGoals: [],
      outcomes: outline.outcomes || [],
      language: "en",
      level: null,
      estimatedMinutes: null,
      estimateBasis: null,
    },
    modules: outline.modules.map((m) => ({
      id: m.id,
      title: m.title || "Module",
      lessonIds: m.lessonIds,
    })),
    lessons: draftLessons,
  };
}

export function useDurableCourseDraft(courseId: string | null) {
  const [draft, setDraft] = useState<CourseDraftAggregate | null>(null);
  const [revision, setRevision] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConflict, setIsConflict] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    if (!courseId || courseId.startsWith("sample-")) {
      setDraft(null);
      setRevision(0);
      return;
    }

    setLoading(true);
    setError(null);
    setIsConflict(false);

    try {
      const serverDraft = await fetchCourseDraft(courseId);
      if (!mounted.current) return;

      if (serverDraft) {
        setDraft(serverDraft.content);
        setRevision(serverDraft.revision);
        setLastSavedAt(serverDraft.updated_at);
      } else {
        // No draft created yet on server (revision 0)
        setDraft(null);
        setRevision(0);
      }
    } catch (err: unknown) {
      if (!mounted.current) return;
      const msg = err instanceof Error ? err.message : "Failed to load course draft.";
      setError(msg);
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    mounted.current = true;
    void load();
    return () => {
      mounted.current = false;
    };
  }, [load]);

  const save = async (content: CourseDraftAggregate) => {
    if (!courseId) {
      return { ok: false, message: "No course selected for saving." };
    }

    setSaving(true);
    setError(null);
    setIsConflict(false);

    try {
      const result = await saveCourseDraft(courseId, revision, content);
      if (!mounted.current) return { ok: true };

      setDraft(result.draft.content);
      setRevision(result.saved_revision);
      setLastSavedAt(result.draft.updated_at);
      return { ok: true };
    } catch (err: unknown) {
      if (!mounted.current) return { ok: false };
      const errObj = err as Error & { code?: string };
      const isRevisionConflict = errObj.code === "40001" || (errObj.message && errObj.message.includes("draft_revision_conflict"));
      
      if (isRevisionConflict) {
        setIsConflict(true);
        const conflictMsg = "Draft conflict: Another author saved a newer version of this course. Please reload to see their changes.";
        setError(conflictMsg);
        return { ok: false, message: conflictMsg };
      }

      const msg = errObj.message || "Failed to save draft to database.";
      setError(msg);
      return { ok: false, message: msg };
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  return {
    draft,
    revision,
    loading,
    saving,
    error,
    isConflict,
    lastSavedAt,
    save,
    reload: load,
  };
}
