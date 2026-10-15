import * as Tabs from "@radix-ui/react-tabs";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Home,
  Layers,
  Plus,
  Sprout,
  Users,
} from "lucide-react";
import { useRef, useState } from "react";
import { ChartPreview } from "../../shared/ChartPreview";
import { DraftEditor, LessonPreview, type LessonDraft } from "./DraftEditor";
import { CoursesPanel } from "./courses/CoursesPanel";
import { useCourseOutlines } from "./courses/useCourseOutlines";
import { exampleCourseLessons } from "./courses/exampleCourse";
import { LessonDraftList } from "./lessons/LessonDraftList";
import { useLessonPublications } from "./publication/useLessonPublications";
import { PublicationDialog } from "./publication/PublicationDialog";
import "./teacher.css";

type TeacherTab = "overview" | "courses" | "lessons" | "classes";

const exampleLesson: LessonDraft = {
  id: "example-kindness",
  title: "Kindness in everyday life",
  scripture: "Luke 10:25–37",
  outcomes: [
    "Recognise opportunities for compassion",
    "Choose a practical act of kindness",
  ],
  sections: [
    {
      id: "kindness-notice",
      title: "Notice someone in need",
      body: "In the story of the Good Samaritan, care begins with noticing someone in need. Compassion becomes meaningful when it moves us to act.",
    },
    {
      id: "kindness-act",
      title: "Put kindness into practice",
      body: "Our opportunities to show kindness may look ordinary: listening without rushing, making space for someone or offering practical help.\n\nThis week, notice one person you might otherwise pass by. Choose one small, thoughtful action.",
    },
  ],
  reflection: "What might it mean to be a neighbour to someone this week?",
};

export default function TeacherDashboard() {
  const [tab, setTab] = useState<TeacherTab>("overview");
  const [drafts, setDrafts] = useState<LessonDraft[]>([]);
  const courseOutlines = useCourseOutlines();
  const publications = useLessonPublications();
  const [publicationId, setPublicationId] = useState<string | null>(null);
  const publicationDraft = drafts.find((draft) => draft.id === publicationId);
  const [editor, setEditor] = useState<{
    draft: LessonDraft | null;
    courseId?: string;
    moduleId?: string;
  } | null>(null);
  const [preview, setPreview] = useState<{
    draft: LessonDraft;
    example: boolean;
  } | null>(null);
  const [status, setStatus] = useState("");
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const openingPublicationEditor = useRef(false);
  const nextId = useRef(1);

  function createDraft(trigger: HTMLButtonElement) {
    openerRef.current = trigger;
    setStatus("");
    setEditor({ draft: null });
  }
  function editDraft(draft: LessonDraft, trigger: HTMLButtonElement) {
    if (publications.get(draft.id).archived) {
      setStatus(
        "Restore this lesson from its Publication screen before editing.",
      );
      return;
    }
    openerRef.current = trigger;
    setStatus("");
    setEditor({ draft });
  }
  function createModuleLesson(
    courseId: string,
    moduleId: string,
    trigger: HTMLButtonElement,
  ) {
    openerRef.current = trigger;
    setStatus("");
    setEditor({ draft: null, courseId, moduleId });
  }
  function tryExampleCourse() {
    setDrafts((current) => [
      ...current,
      ...exampleCourseLessons.filter(
        (example) => !current.some((draft) => draft.id === example.id),
      ),
    ]);
    courseOutlines.openExample();
  }
  function previewDraft(
    draft: LessonDraft,
    trigger: HTMLButtonElement,
    example = draft.example ?? false,
  ) {
    openerRef.current = trigger;
    setPreview({ draft, example });
  }
  function restoreFocus() {
    openerRef.current?.focus();
  }
  function reviewPublication(draft: LessonDraft, trigger: HTMLButtonElement) {
    openingPublicationEditor.current = false;
    openerRef.current = trigger;
    setPublicationId(draft.id);
  }
  function saveDraft(content: Omit<LessonDraft, "id">) {
    const existingId = editor?.draft?.id;
    const draft = {
      ...content,
      example: editor?.draft?.example,
      id: existingId ?? `draft-${nextId.current++}`,
    };
    setDrafts((current) =>
      existingId
        ? current.map((item) => (item.id === existingId ? draft : item))
        : [draft, ...current],
    );
    publications.edit(draft.id);
    if (editor?.courseId && editor.moduleId) {
      courseOutlines.attachLesson(editor.courseId, editor.moduleId, draft.id);
    }
    setStatus(
      editor?.moduleId
        ? "Lesson created and added to the module."
        : "Preview draft saved. Open it to see the learner view.",
    );
    setEditor(null);
  }
  function changeTab(value: string) {
    if (
      value === "overview" ||
      value === "courses" ||
      value === "lessons" ||
      value === "classes"
    ) {
      setTab(value);
      setStatus("");
    }
  }
  const listActions = {
    onCreate: createDraft,
    onEdit: editDraft,
    onPreview: previewDraft,
    onReview: reviewPublication,
    getPublication: publications.get,
  };

  return (
    <div className="page-stack teacher-dashboard">
      <header className="page-heading">
        <div>
          <p className="eyebrow">Teacher space</p>
          <h1>
            {tab === "overview"
              ? "Space to help others grow."
              : tab === "courses"
                ? "Your courses"
                : tab === "lessons"
                  ? "Your lessons"
                  : "Your classes"}
          </h1>
          <p className="muted">
            {tab === "overview"
              ? "Prepare meaningful lessons for adult learners."
              : tab === "courses"
                ? "Give each learning journey a thoughtful structure."
                : tab === "lessons"
                  ? "A space to shape your next teaching moment."
                  : "Support learning, one group at a time."}
          </p>
        </div>
        <button
          className="button button-primary"
          onClick={(event) => createDraft(event.currentTarget)}
        >
          <Plus size={19} aria-hidden="true" />
          Create a lesson
        </button>
      </header>
      <Tabs.Root className="section-tabs" value={tab} onValueChange={changeTab}>
        <Tabs.List className="tab-list" aria-label="Teacher sections">
          <Tabs.Trigger className="tab-trigger" value="overview">
            <Home size={17} aria-hidden="true" />
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="courses">
            <Layers size={17} aria-hidden="true" />
            Courses
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="lessons">
            <BookOpen size={17} aria-hidden="true" />
            Lessons
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="classes">
            <Users size={17} aria-hidden="true" />
            Classes
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          value="overview"
          className="page-stack teacher-tab-content"
        >
          <section className="panel tone-lavender teacher-hero">
            <div>
              <p className="eyebrow">One lesson at a time</p>
              <h2>Bring scripture into everyday life.</h2>
              <p>
                Start with a passage. Add a thoughtful reading and a question
                that invites reflection.
              </p>
              <button
                className="button button-outline"
                onClick={(event) => createDraft(event.currentTarget)}
              >
                Start a draft
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="teacher-book-art" aria-hidden="true">
              <Sprout size={25} />
              <BookOpen size={62} strokeWidth={1.25} />
              <span>GROW TOGETHER</span>
            </div>
          </section>
          <section aria-labelledby="teaching-glance">
            <h2 id="teaching-glance" className="teacher-section-title">
              Teaching at a glance
            </h2>
            <div className="three-col">
              <article className="stat-tile tone-mint">
                <div className="teacher-stat-heading">
                  <h3>Lesson drafts</h3>
                  <BookOpen size={21} aria-hidden="true" />
                </div>
                <strong className="teacher-stat-value">{drafts.length}</strong>
                <p className="muted">Created in this preview</p>
              </article>
              <article className="stat-tile tone-yellow">
                <div className="teacher-stat-heading">
                  <h3>Classes</h3>
                  <Users size={21} aria-hidden="true" />
                </div>
                <strong
                  className="teacher-stat-value"
                  aria-label="Not available"
                >
                  —
                </strong>
                <p className="muted">Awaiting class data</p>
              </article>
              <article className="stat-tile tone-peach">
                <div className="teacher-stat-heading">
                  <h3>Lesson completion</h3>
                  <CheckCircle2 size={21} aria-hidden="true" />
                </div>
                <strong
                  className="teacher-stat-value"
                  aria-label="Not available"
                >
                  —
                </strong>
                <p className="muted">Awaiting learner activity</p>
              </article>
            </div>
          </section>
          <div className="two-col">
            <section>
              <div className="panel-heading">
                <h2>Your lesson drafts</h2>
                <button
                  className="button button-outline"
                  onClick={() => changeTab("lessons")}
                >
                  View all
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
              <LessonDraftList drafts={drafts.slice(0, 3)} {...listActions} />
            </section>
            <section className="panel teacher-preparation">
              <h2>From an idea to a lesson</h2>
              <ol>
                <li>
                  <span className="teacher-step tone-lavender">01</span>
                  <div>
                    <h3>Choose a passage</h3>
                    <p className="muted">Give the lesson a clear focus.</p>
                  </div>
                </li>
                <li>
                  <span className="teacher-step tone-yellow">02</span>
                  <div>
                    <h3>Invite reflection</h3>
                    <p className="muted">
                      Offer a reading and a thoughtful question.
                    </p>
                  </div>
                </li>
                <li>
                  <span className="teacher-step tone-mint">03</span>
                  <div>
                    <h3>Preview the experience</h3>
                    <p className="muted">
                      Read it from a learner’s perspective.
                    </p>
                  </div>
                </li>
              </ol>
            </section>
          </div>
          <ChartPreview kind="completion" />
        </Tabs.Content>
        <Tabs.Content
          value="courses"
          className="page-stack teacher-tab-content"
        >
          <CoursesPanel
            model={courseOutlines}
            drafts={drafts}
            onPreview={previewDraft}
            onEdit={editDraft}
            onOpenLessons={() => changeTab("lessons")}
            onCreateLesson={createModuleLesson}
            onTryExample={tryExampleCourse}
          />
        </Tabs.Content>
        <Tabs.Content
          value="lessons"
          className="page-stack teacher-tab-content"
        >
          <section>
            <div className="panel-heading">
              <h2>
                Drafts <span className="muted">{drafts.length}</span>
              </h2>
              <span className="muted">Publication is simulated</span>
            </div>
            <LessonDraftList drafts={drafts} {...listActions} />
          </section>
          <section className="panel teacher-example">
            <span className="teacher-icon-tile tone-yellow">
              <BookOpen size={24} aria-hidden="true" />
            </span>
            <div className="teacher-draft-copy">
              <p className="eyebrow">Example content</p>
              <h3>{exampleLesson.title}</h3>
              <p className="muted">
                See how a reading and reflection could come together.
              </p>
            </div>
            <button
              className="button button-outline"
              onClick={(event) =>
                previewDraft(exampleLesson, event.currentTarget, true)
              }
            >
              Preview example
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </section>
        </Tabs.Content>
        <Tabs.Content
          value="classes"
          className="page-stack teacher-tab-content"
        >
          <section className="panel empty-state teacher-empty teacher-classes-empty">
            <span className="teacher-icon-tile tone-yellow">
              <Users size={27} aria-hidden="true" />
            </span>
            <h2>Your classes will appear here</h2>
            <p className="muted">
              Class access, lesson assignments and completion will appear once
              the teaching service is connected.
            </p>
            <button
              className="button button-primary"
              onClick={() => changeTab("lessons")}
            >
              Prepare a lesson
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </section>
          <section className="panel teacher-planned">
            <h2>Planned class view</h2>
            <p className="muted">
              A class roster, assigned lessons and recorded completion. Access
              will follow administrator permissions; this preview does not
              create classes or invite learners.
            </p>
          </section>
        </Tabs.Content>
      </Tabs.Root>
      <p className="teacher-status" role="status" aria-live="polite">
        {status}
      </p>
      {editor && (
        <DraftEditor
          draft={editor.draft}
          destination={
            courseOutlines.courses
              .find((course) => course.id === editor.courseId)
              ?.modules.find((module) => module.id === editor.moduleId)?.title
          }
          onSave={saveDraft}
          onClose={() => setEditor(null)}
          restoreFocus={restoreFocus}
        />
      )}
      {preview && (
        <LessonPreview
          draft={preview.draft}
          example={preview.example}
          onClose={() => setPreview(null)}
          restoreFocus={restoreFocus}
        />
      )}
      {publicationDraft && (
        <PublicationDialog
          draft={publicationDraft}
          record={publications.get(publicationDraft.id)}
          onPublish={() => publications.publish(publicationDraft)}
          onWithdraw={() => publications.withdraw(publicationDraft.id)}
          onArchive={() => publications.archive(publicationDraft.id)}
          onRestore={() => publications.restore(publicationDraft.id)}
          onEdit={() => {
            openingPublicationEditor.current = true;
            setPublicationId(null);
            setEditor({ draft: publicationDraft });
          }}
          onClose={() => setPublicationId(null)}
          restoreFocus={() => {
            if (!openingPublicationEditor.current) restoreFocus();
          }}
        />
      )}
    </div>
  );
}
