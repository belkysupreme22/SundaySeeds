import { useState, useEffect } from "react";
import { BookOpen, ShieldCheck, Sprout, LogOut } from "lucide-react";
import TeacherDashboard from "./features/teacher/TeacherDashboard";
import AdminDashboard from "./features/admin/AdminDashboard";
import { StaffAuthProvider, useStaffAuth } from "./features/auth/useStaffAuth";
import { StaffSignInScreen } from "./features/auth/StaffSignInScreen";
import { StaffUnauthorizedScreen } from "./features/auth/StaffUnauthorizedScreen";

function AppShell() {
  const { status, user, roles, signOut, hasRole } = useStaffAuth();
  const [studioOpen, setStudioOpen] = useState(false);
  const [workspace, setWorkspace] = useState<"teacher" | "admin">("teacher");

  const canTeach = hasRole("teacher");
  const canAdmin = hasRole("admin");

  useEffect(() => {
    // Auto-select allowed workspace if user only has one role
    if (canAdmin && !canTeach) {
      setWorkspace("admin");
    } else if (canTeach && !canAdmin) {
      setWorkspace("teacher");
    }
  }, [canTeach, canAdmin]);

  if (status === "loading") {
    return (
      <div className="auth-shell">
        <div style={{ textAlign: "center", color: "var(--ink)" }}>
          <Sprout size={36} className="spin" style={{ marginBottom: 12 }} />
          <p style={{ fontWeight: 600 }}>Verifying staff authorization…</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return <StaffSignInScreen />;
  }

  if (status === "unauthorized") {
    return <StaffUnauthorizedScreen />;
  }

  return (
    <div
      className={`app-shell${workspace === "teacher" && studioOpen ? " editorial-shell" : ""}`}
    >
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
          {canTeach && (
            <button
              type="button"
              aria-pressed={workspace === "teacher"}
              onClick={() => setWorkspace("teacher")}
            >
              <BookOpen size={19} />
              Teacher<span>01</span>
            </button>
          )}
          {canAdmin && (
            <button
              type="button"
              aria-pressed={workspace === "admin"}
              onClick={() => setWorkspace("admin")}
            >
              <ShieldCheck size={19} />
              Administration<span>02</span>
            </button>
          )}
        </nav>

        <div className="sidebar-note">
          <Sprout size={24} />
          <strong>
            A little faith.
            <br />A shared purpose.
          </strong>
          <p>Thoughtful tools for teaching and learning together.</p>
        </div>

        <div className="sidebar-user-footer">
          <div className="sidebar-user-info">
            <span className="sidebar-user-email" title={user?.email}>
              {user?.email}
            </span>
            <div className="sidebar-roles-badges">
              {roles.map((r) => (
                <span key={r} className={`sidebar-role-badge badge-${r}`}>
                  {r}
                </span>
              ))}
            </div>
          </div>
          <button
            type="button"
            className="sidebar-signout-btn"
            onClick={() => void signOut()}
            title="Sign out of staff session"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
      <div className="workspace-shell">
        <header className="workspace-bar">
          <span className="badge tone-yellow">Role-verified staff</span>
          <p>
            Connected to SundaySeeds · Session verified via Supabase Auth
          </p>
        </header>
        <main id="workspace" tabIndex={-1}>
          {canTeach && (
            <section
              hidden={workspace !== "teacher"}
              aria-label="Teacher workspace"
            >
              <TeacherDashboard onStudioChange={setStudioOpen} />
            </section>
          )}
          {canAdmin && (
            <section
              hidden={workspace !== "admin"}
              aria-label="Administration workspace"
            >
              <AdminDashboard />
            </section>
          )}
        </main>
        <footer className="workspace-footer">
          SundaySeeds · A little faith, every day.
        </footer>
      </div>
    </div>
  );
}

export function App() {
  return (
    <StaffAuthProvider>
      <AppShell />
    </StaffAuthProvider>
  );
}
