import { useState } from "react";
import { BookOpen, ShieldCheck, Sprout } from "lucide-react";

export function App() {
  const [workspace, setWorkspace] = useState<"teacher" | "admin">("teacher");
  return (
    <div className="app-shell">
      <a className="skip-link" href="#workspace">
        Skip to workspace
      </a>
      <aside className="sidebar">
        <a className="brand" href="#workspace">
          <span className="brand-mark">
            <Sprout size={24} />
          </span>
          <span>
            SundaySeeds<small>Grow together.</small>
          </span>
        </a>
        <div className="sidebar-label">DESIGN WORKSPACES</div>
        <nav aria-label="Dashboard proposals" className="workspace-nav">
          <button
            type="button"
            aria-pressed={workspace === "teacher"}
            onClick={() => setWorkspace("teacher")}
          >
            <BookOpen size={19} />
            Teacher<span>01</span>
          </button>
          <button
            type="button"
            aria-pressed={workspace === "admin"}
            onClick={() => setWorkspace("admin")}
          >
            <ShieldCheck size={19} />
            Administration<span>02</span>
          </button>
        </nav>
        <div className="sidebar-note">
          <Sprout size={24} />
          <strong>
            A little faith.
            <br />A shared purpose.
          </strong>
          <p>Thoughtful tools for teaching and learning together.</p>
        </div>
      </aside>
      <div className="workspace-shell">
        <header className="workspace-bar">
          <span className="badge tone-yellow">Screen prototype</span>
          <p>
            Example content · Drafts reset on refresh · No backend connection
          </p>
        </header>
        <main id="workspace" tabIndex={-1}>
          <section
            hidden={workspace !== "teacher"}
            aria-label="Teacher proposal"
          >
            <div className="panel">
              <h1>Teacher workspace</h1>
              <p>Lesson screens are the next implementation task.</p>
            </div>
          </section>
          <section
            hidden={workspace !== "admin"}
            aria-label="Administration proposal"
          >
            <div className="panel">
              <h1>Administration workspace</h1>
              <p>Administration screens are a separate implementation task.</p>
            </div>
          </section>
        </main>
        <footer className="workspace-footer">
          SundaySeeds · A little faith, every day.
        </footer>
      </div>
    </div>
  );
}
