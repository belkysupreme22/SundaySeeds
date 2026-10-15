import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowRight,
  BookOpen,
  Home,
  Layers,
  Plus,
  Sprout,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useCourseOutlines } from "./courses/useCourseOutlines";
import { exampleCourseLessons } from "./courses/exampleCourse";
import { LessonDraftList } from "./lessons/LessonDraftList";
import type { LessonContent, LessonDraft } from "./lessons/types";
import { useLessonPublications } from "./publication/useLessonPublications";
import { EditorialStudio } from "./studio/EditorialStudio";
import { CourseLibrary } from "./studio/CourseLibrary";
import type { StudioEntry } from "./studio/types";
import { ClassesPanel } from "./classes/ClassesPanel";
import "./teacher.css";

type TeacherTab = "overview" | "courses" | "lessons" | "classes";
export default function TeacherDashboard({
  onStudioChange,
}: {
  onStudioChange?: (active: boolean) => void;
}) {
  const [tab, setTab] = useState<TeacherTab>("overview");
  const [drafts, setDrafts] = useState<LessonDraft[]>([]);
  const [studio, setStudio] = useState<StudioEntry | null>(null);
  const courses = useCourseOutlines();
  const publications = useLessonPublications();
  const nextId = useRef(1);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const active = studio !== null;
  useEffect(() => {
    onStudioChange?.(active);
  }, [active, onStudioChange]);
  function tryExample() {
    setDrafts((current) => [
      ...current,
      ...exampleCourseLessons.filter(
        (example) => !current.some((draft) => draft.id === example.id),
      ),
    ]);
    courses.openExample();
  }
  function openExample() {
    tryExample();
    setStudio({ mode: "course", courseId: "sample-faith-course" });
  }
  function saveDraft(
    content: LessonContent,
    id?: string,
    example?: boolean,
  ): LessonDraft {
    const saved = {
      ...content,
      id: id ?? `draft-${nextId.current++}`,
      example,
    };
    setDrafts((current) =>
      id
        ? current.map((item) => (item.id === id ? saved : item))
        : [saved, ...current],
    );
    publications.edit(saved.id);
    return saved;
  }
  function openCourse(id: string) {
    setStudio({ mode: "course", courseId: id });
  }
  function createCourse() {
    setStudio({ mode: "new-course" });
  }
  const listActions = {
    onCreate: () => setStudio({ mode: "edit" }),
    onEdit: (draft: LessonDraft) =>
      setStudio({
        mode: publications.get(draft.id).archived ? "publish" : "edit",
        lessonId: draft.id,
      }),
    onPreview: (draft: LessonDraft) =>
      setStudio({ mode: "preview", lessonId: draft.id }),
    onReview: (draft: LessonDraft) =>
      setStudio({ mode: "publish", lessonId: draft.id }),
    getPublication: publications.get,
  };
  const studioCanvas = studio ? (
    <EditorialStudio
      entry={studio}
      model={courses}
      drafts={drafts}
      publications={publications}
      onSave={saveDraft}
      onTryExample={tryExample}
      onClose={() => {
        setStudio(null);
        requestAnimationFrame(() => headingRef.current?.focus());
      }}
    />
  ) : null;
  const library = (
    <CourseLibrary
      courses={courses.courses}
      onOpen={openCourse}
      onCreate={createCourse}
      onExample={openExample}
    />
  );
  return (
    <>
      {studioCanvas}
      <div hidden={studio !== null} className="page-stack teacher-dashboard">
        <header className="page-heading">
          <div>
            <p className="eyebrow">Teacher space · Editorial desk</p>
            <h1 ref={headingRef} tabIndex={-1}>
              {tab === "overview"
                ? "Make room for meaningful learning."
                : tab === "courses"
                  ? "Your courses"
                  : tab === "lessons"
                    ? "Your lesson library"
                    : "Your classes"}
            </h1>
            <p className="muted">
              Shape a course from its first idea to its final knowledge check.
            </p>
          </div>
          <button
            className="button button-primary"
            onClick={() =>
              setStudio({
                mode: "course",
                courseId: courses.selectedId ?? courses.courses[0]?.id,
              })
            }
          >
            <BookOpen size={19} aria-hidden="true" />
            Open editorial studio
          </button>
        </header>
        <Tabs.Root
          className="section-tabs"
          value={tab}
          onValueChange={(value) => setTab(value as TeacherTab)}
        >
          <Tabs.List className="tab-list" aria-label="Teacher sections">
            {(
              [
                { id: "overview", label: "Editorial desk", Icon: Home },
                { id: "courses", label: "Courses", Icon: Layers },
                { id: "lessons", label: "Lesson library", Icon: BookOpen },
                { id: "classes", label: "Classes", Icon: Users },
              ] as const
            ).map(({ id, label, Icon }) => (
              <Tabs.Trigger className="tab-trigger" value={id} key={id}>
                <Icon size={17} aria-hidden="true" />
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Tabs.Content
            value="overview"
            className="page-stack teacher-tab-content"
          >
            <section className="panel tone-lavender teacher-hero">
              <div>
                <p className="eyebrow">Plan · Write · Refine</p>
                <h2>From a thoughtful idea to a complete course.</h2>
                <p>
                  Set the direction, organize your modules and give each lesson
                  the space it deserves.
                </p>
                <div className="studio-toolbar">
                  <button
                    className="button button-primary"
                    onClick={createCourse}
                  >
                    <Plus size={18} aria-hidden="true" />
                    Start a course
                  </button>
                  <button
                    className="button button-outline"
                    onClick={openExample}
                  >
                    Explore example course
                    <ArrowRight size={18} aria-hidden="true" />
                  </button>
                </div>
              </div>
              <div className="teacher-book-art" aria-hidden="true">
                <Sprout size={25} />
                <BookOpen size={62} strokeWidth={1.25} />
                <span>GROW TOGETHER</span>
              </div>
            </section>
            <section aria-labelledby="editorial-glance">
              <h2 id="editorial-glance" className="teacher-section-title">
                On your editorial desk
              </h2>
              <div className="three-col">
                {[
                  {
                    label: "Course drafts",
                    value: courses.courses.length,
                    tone: "mint",
                  },
                  {
                    label: "Lesson drafts",
                    value: drafts.length,
                    tone: "yellow",
                  },
                  {
                    label: "Knowledge-check questions",
                    value: drafts.reduce(
                      (sum, draft) => sum + (draft.quiz?.length ?? 0),
                      0,
                    ),
                    tone: "peach",
                  },
                ].map((item) => (
                  <article
                    className={`stat-tile tone-${item.tone}`}
                    key={item.label}
                  >
                    <h3>{item.label}</h3>
                    <strong className="teacher-stat-value">{item.value}</strong>
                    <p className="muted">In your current workspace</p>
                  </article>
                ))}
              </div>
            </section>
            {library}
            <section>
              <div className="panel-heading">
                <h2>Recent lesson drafts</h2>
                <button
                  className="button button-outline"
                  onClick={() => setTab("lessons")}
                >
                  View library
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
              <LessonDraftList drafts={drafts.slice(0, 3)} {...listActions} />
            </section>
          </Tabs.Content>
          <Tabs.Content
            value="courses"
            className="page-stack teacher-tab-content"
          >
            {library}
          </Tabs.Content>
          <Tabs.Content
            value="lessons"
            className="page-stack teacher-tab-content"
          >
            <LessonDraftList drafts={drafts} {...listActions} />
            <button className="button button-outline" onClick={openExample}>
              Explore the sample course
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </Tabs.Content>
          <Tabs.Content
            value="classes"
            forceMount
            hidden={tab !== "classes"}
            className="page-stack teacher-tab-content"
          >
            <ClassesPanel courses={courses.courses} onOpenCourse={openCourse} />
          </Tabs.Content>
        </Tabs.Root>
      </div>
    </>
  );
}
