import { useState } from "react";
import type { LessonDraft } from "../lessons/types";
import {
  cloneLesson,
  emptyPublication,
  getPublicationChecks,
  type LessonPublication,
} from "./publicationModel";

export function useLessonPublications() {
  const [records, setRecords] = useState<Record<string, LessonPublication>>({});
  function get(id: string) {
    return records[id] ?? emptyPublication;
  }
  function edit(id: string) {
    setRecords((current) => {
      const record = current[id] ?? emptyPublication;
      return record.archived
        ? current
        : { ...current, [id]: { ...record, hasDraft: true } };
    });
  }
  function publish(draft: LessonDraft) {
    if (getPublicationChecks(draft).some((check) => check.issues.length))
      return;
    setRecords((current) => {
      const record = current[draft.id] ?? emptyPublication;
      if (record.archived || !record.hasDraft) return current;
      const number = record.versions.length + 1;
      return {
        ...current,
        [draft.id]: {
          archived: false,
          hasDraft: false,
          versions: [
            ...record.versions.map((version) =>
              version.status === "published"
                ? { ...version, status: "superseded" as const }
                : version,
            ),
            { number, lesson: cloneLesson(draft), status: "published" },
          ],
        },
      };
    });
  }
  function withdraw(id: string) {
    setRecords((current) => {
      const record = current[id];
      if (
        !record ||
        record.archived ||
        !record.versions.some((version) => version.status === "published")
      )
        return current;
      return {
        ...current,
        [id]: {
          ...record,
          hasDraft: true,
          versions: record.versions.map((version) =>
            version.status === "published"
              ? { ...version, status: "withdrawn" as const }
              : version,
          ),
        },
      };
    });
  }
  function archive(id: string) {
    setRecords((current) => {
      const record = current[id] ?? emptyPublication;
      return {
        ...current,
        [id]: {
          ...record,
          archived: true,
          hasDraft: true,
          versions: record.versions.map((version) =>
            version.status === "published"
              ? { ...version, status: "withdrawn" as const }
              : version,
          ),
        },
      };
    });
  }
  function restore(id: string) {
    setRecords((current) => {
      const record = current[id];
      return record
        ? { ...current, [id]: { ...record, archived: false, hasDraft: true } }
        : current;
    });
  }
  return { get, edit, publish, withdraw, archive, restore };
}
