import {
  ArrowRight,
  BookOpen,
  CircleAlert,
  LoaderCircle,
  Plus,
  Users,
} from "lucide-react";
import { useId, useRef, useState } from "react";
import { InputField } from "../../../shared/ui/InputField";
import type { CourseOutline } from "../courses/useCourseOutlines";
import { ClassEditor } from "./ClassEditor";
import { ClassWorkspace } from "./ClassWorkspace";
import { useTeachingClasses } from "./useTeachingClasses";
import "./classes.css";

export function ClassesPanel({
  courses,
  onOpenCourse,
}: {
  courses: CourseOutline[];
  onOpenCourse: (id: string) => void;
}) {
  const model = useTeachingClasses();
  const prefix = useId();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("open");
  const [designState, setDesignState] = useState("ready");
  const [status, setStatus] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  const selected = model.classes.find((item) => item.id === selectedId);
  const visible = model.classes.filter(
    (item) =>
      (filter === "all" ||
        (filter === "archived" ? item.archived : !item.archived)) &&
      `${item.name} ${item.description}`
        .toLowerCase()
        .includes(search.trim().toLowerCase()),
  );

  function back() {
    setSelectedId(null);
    setEditing(false);
    requestAnimationFrame(() => heading.current?.focus());
  }

  if (editing)
    return (
      <ClassEditor
        key={selectedId ?? "new"}
        item={selected}
        onClose={() => (selected ? setEditing(false) : back())}
        onSave={(details) => {
          const id = model.save(details, selectedId ?? undefined);
          setSelectedId(id);
          setEditing(false);
          setStatus("Simulated class saved for this session.");
        }}
      />
    );
  if (selected)
    return (
      <ClassWorkspace
        key={selected.id}
        item={selected}
        courses={courses}
        model={model}
        onBack={back}
        onEdit={() => setEditing(true)}
        onOpenCourse={onOpenCourse}
      />
    );

  return (
    <div className="page-stack classes-panel">
      <header className="class-directory-heading">
        <div>
          <p className="eyebrow">Gather · organize · learn</p>
          <h2 ref={heading} tabIndex={-1}>
            A place for every study group
          </h2>
          <p className="muted">
            Shape an adult class around a purposeful course and a welcoming
            learner journey.
          </p>
        </div>
        <button
          className="button button-primary"
          type="button"
          onClick={() => {
            setSelectedId(null);
            setEditing(true);
          }}
        >
          <Plus size={16} />
          Create simulated class
        </button>
      </header>
      <section className="class-directory-intro class-surface">
        <span className="class-intro-icon tone-mint">
          <Users size={31} />
        </span>
        <div>
          <h3>From course outline to shared learning</h3>
          <p>
            Create a class brief, link course outlines, then explore the roster
            and invitation flow. Everything here is a class workspace
            simulation; no invitations are sent and no learner access is
            granted.
          </p>
        </div>
      </section>
      <div className="class-filters">
        <label className="field" htmlFor={`${prefix}-search`}>
          Find a class
          <InputField
            id={`${prefix}-search`}
            type="search"
            value={search}
            placeholder="Search class names and purpose"
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <label className="field" htmlFor={`${prefix}-filter`}>
          Class status
          <select
            className="input"
            id={`${prefix}-filter`}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="open">Open classes</option>
            <option value="archived">Archived classes</option>
            <option value="all">All classes</option>
          </select>
        </label>
      </div>
      {designState === "loading" ? (
        <section
          className="class-surface empty-state"
          aria-label="Loading state design example"
        >
          <LoaderCircle size={30} aria-hidden="true" />
          <span className="badge tone-yellow">Design example</span>
          <h3>Loading your class directory</h3>
          <p className="muted">
            This demonstrates the waiting screen. No request is running.
          </p>
          <button
            type="button"
            className="button button-outline"
            onClick={() => setDesignState("ready")}
          >
            Back to directory
          </button>
        </section>
      ) : designState === "error" ? (
        <section
          className="class-surface empty-state"
          aria-label="Error state design example"
        >
          <CircleAlert size={30} aria-hidden="true" />
          <span className="badge tone-yellow">Design example</span>
          <h3>The class directory could not load</h3>
          <p className="muted">
            A connected version will keep saved classes safe and offer recovery
            here. This is a presentation example, not a service error.
          </p>
          <button
            type="button"
            className="button button-outline"
            onClick={() => setDesignState("ready")}
          >
            Return to directory
          </button>
        </section>
      ) : visible.length ? (
        <div className="class-card-grid">
          {visible.map((item) => (
            <article className="class-card class-surface" key={item.id}>
              <div className="class-card-heading">
                <span className="class-intro-icon tone-lavender">
                  <Users size={23} />
                </span>
                <span
                  className={`class-status ${item.archived ? "class-status-removed" : "class-status-active"}`}
                >
                  {item.archived ? "Archived" : "Open"}
                </span>
              </div>
              <div>
                {item.example && (
                  <span className="badge tone-yellow">Example class</span>
                )}
                <h3>{item.name}</h3>
                <p className="muted">
                  {item.description ||
                    "Add a class purpose to guide the group's learning."}
                </p>
              </div>
              <div className="class-card-counts">
                <span>
                  <BookOpen size={15} />
                  {item.courseIds.length} course links
                </span>
                <span>
                  <Users size={15} />
                  {
                    item.members.filter((member) => member.status === "active")
                      .length
                  }{" "}
                  simulated members
                </span>
              </div>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setSelectedId(item.id)}
              >
                Open class workspace
                <ArrowRight size={16} />
              </button>
            </article>
          ))}
        </div>
      ) : (
        <section className="class-surface empty-state class-directory-empty">
          <span className="class-intro-icon tone-yellow">
            <Users size={30} />
          </span>
          <h3>
            {model.classes.length
              ? "No classes match this view"
              : "Start with a meaningful gathering"}
          </h3>
          <p className="muted">
            {model.classes.length
              ? "Try another search or class status. Existing class drafts are kept."
              : "Create a class to plan your own group, or explore an explicitly labelled example with adult learners and invitation states."}
          </p>
          <div className="class-actions">
            {model.classes.length ? (
              <button
                className="button button-outline"
                type="button"
                onClick={() => {
                  setSearch("");
                  setFilter("all");
                }}
              >
                Clear filters
              </button>
            ) : (
              <>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => setEditing(true)}
                >
                  <Plus size={16} />
                  Create simulated class
                </button>
                <button
                  className="button button-outline"
                  type="button"
                  onClick={() => setSelectedId(model.exploreExample())}
                >
                  Explore example class
                  <ArrowRight size={16} />
                </button>
              </>
            )}
          </div>
        </section>
      )}
      {model.classes.length > 0 &&
        !model.classes.some((item) => item.id === "example-adult-class") && (
          <button
            type="button"
            className="button button-outline class-back"
            onClick={() => setSelectedId(model.exploreExample())}
          >
            Explore example class
            <ArrowRight size={16} />
          </button>
        )}
      <details className="class-state-examples">
        <summary>Screen state examples</summary>
        <p className="muted">
          Review presentation only. Your simulated class drafts stay intact.
        </p>
        <label className="field" htmlFor={`${prefix}-state`}>
          Directory presentation
          <select
            className="input"
            id={`${prefix}-state`}
            value={designState}
            onChange={(event) => setDesignState(event.target.value)}
          >
            <option value="ready">Current directory</option>
            <option value="loading">Loading example</option>
            <option value="error">Error example</option>
          </select>
        </label>
      </details>
      <p className="class-live-status" role="status">
        {status}
      </p>
    </div>
  );
}
