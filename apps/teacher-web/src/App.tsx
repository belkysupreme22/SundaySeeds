import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BookOpen, ShieldCheck, Sprout, LogOut, Globe } from "lucide-react";
import TeacherDashboard from "./features/teacher/TeacherDashboard";
import AdminDashboard from "./features/admin/AdminDashboard";
import { StaffAuthProvider, useStaffAuth } from "./features/auth/useStaffAuth";
import { StaffSignInScreen } from "./features/auth/StaffSignInScreen";
import { StaffUnauthorizedScreen } from "./features/auth/StaffUnauthorizedScreen";

function AppShell() {
  const { t, i18n } = useTranslation();
  const { status, user, roles, signOut, hasRole } = useStaffAuth();
  const [studioOpen, setStudioOpen] = useState(false);
  const [workspace, setWorkspace] = useState<"teacher" | "admin">("teacher");

  const canTeach = hasRole("teacher");
  const canAdmin = hasRole("admin");

  const toggleLanguage = () => {
    const nextLang = i18n.language === "am" ? "en" : "am";
    void i18n.changeLanguage(nextLang);
  };

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
          <p style={{ fontWeight: 600 }}>{t("auth.verifying")}</p>
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
        {t("nav.skipToWorkspace")}
      </a>
      <aside className="sidebar">
        <a className="brand" href="#workspace">
          <span className="brand-mark">
            <Sprout size={24} />
          </span>
          <span>
            SundaySeeds<small>{t("common.brandSub")}</small>
          </span>
        </a>
        <div className="sidebar-label">{t("nav.workspaces")}</div>
        <nav aria-label="Dashboard proposals" className="workspace-nav">
          {canTeach && (
            <button
              type="button"
              aria-pressed={workspace === "teacher"}
              onClick={() => setWorkspace("teacher")}
            >
              <BookOpen size={19} />
              {t("nav.teacher")}<span>01</span>
            </button>
          )}
          {canAdmin && (
            <button
              type="button"
              aria-pressed={workspace === "admin"}
              onClick={() => setWorkspace("admin")}
            >
              <ShieldCheck size={19} />
              {t("nav.admin")}<span>02</span>
            </button>
          )}
        </nav>

        <div className="sidebar-note">
          <Sprout size={24} />
          <strong style={{ whiteSpace: "pre-line" }}>
            {t("auth.sidebarQuote")}
          </strong>
          <p>{t("auth.sidebarQuoteSub")}</p>
        </div>

        <div style={{ padding: "8px 12px", borderTop: "1px solid var(--line)" }}>
          <button
            type="button"
            className="button button-outline"
            onClick={toggleLanguage}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              fontSize: 13,
              padding: "6px 12px",
            }}
          >
            <Globe size={15} />
            <span>{i18n.language === "am" ? "English" : "አማርኛ"}</span>
          </button>
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
            <span>{t("common.signOut")}</span>
          </button>
        </div>
      </aside>
      <div className="workspace-shell">
        <header className="workspace-bar">
          <span className="badge tone-yellow">{t("common.verifiedStaff")}</span>
          <p>
            {t("common.sessionVerified")}
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
          {t("common.tagline")}
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
