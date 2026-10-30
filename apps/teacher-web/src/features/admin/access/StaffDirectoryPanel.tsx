import { useEffect, useState } from "react";
import { ShieldCheck, Users, Plus, CheckCircle2, AlertCircle, Trash2 } from "lucide-react";
import {
  fetchStaffMembers,
  updateStaffRole,
  updateCourseAuthorAssignment,
  type StaffMemberItem,
} from "../../teacher/data/staffDraftApi";

export function StaffDirectoryPanel() {
  const [staff, setStaff] = useState<StaffMemberItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Form states
  const [roleEmail, setRoleEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState<"admin" | "teacher">("teacher");
  const [submittingRole, setSubmittingRole] = useState(false);

  const [authorEmail, setAuthorEmail] = useState("");
  const [courseId, setCourseId] = useState("");
  const [submittingAuthor, setSubmittingAuthor] = useState(false);

  const loadStaff = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchStaffMembers();
      setStaff(items);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load staff directory.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStaff();
  }, []);

  const handleGrantRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleEmail.trim()) return;
    setSubmittingRole(true);
    setError(null);
    setFeedback(null);
    try {
      await updateStaffRole(roleEmail.trim(), selectedRole, true);
      setFeedback(`Granted ${selectedRole} role to ${roleEmail.trim()}`);
      setRoleEmail("");
      await loadStaff();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to grant staff role.";
      setError(msg);
    } finally {
      setSubmittingRole(false);
    }
  };

  const handleRevokeRole = async (email: string, role: "admin" | "teacher") => {
    if (!confirm(`Are you sure you want to revoke the ${role} role for ${email}?`)) {
      return;
    }
    setError(null);
    setFeedback(null);
    try {
      await updateStaffRole(email, role, false);
      setFeedback(`Revoked ${role} role from ${email}`);
      await loadStaff();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to revoke staff role.";
      setError(msg);
    }
  };

  const handleAssignCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authorEmail.trim() || !courseId.trim()) return;
    setSubmittingAuthor(true);
    setError(null);
    setFeedback(null);
    try {
      await updateCourseAuthorAssignment(authorEmail.trim(), courseId.trim(), true);
      setFeedback(`Assigned course authoring rights to ${authorEmail.trim()}`);
      setAuthorEmail("");
      setCourseId("");
      await loadStaff();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to assign course author.";
      setError(msg);
    } finally {
      setSubmittingAuthor(false);
    }
  };

  const handleRevokeCourse = async (email: string, cId: string) => {
    setError(null);
    setFeedback(null);
    try {
      await updateCourseAuthorAssignment(email, cId, false);
      setFeedback(`Revoked course authoring rights from ${email}`);
      await loadStaff();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to revoke course author.";
      setError(msg);
    }
  };

  return (
    <div className="page-stack" style={{ gap: "24px" }}>
      {/* Feedback / Error notifications */}
      {feedback && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#f0faf5", border: "1px solid #1f8a70", color: "#114f40", padding: "12px 16px", borderRadius: 8 }}>
          <CheckCircle2 size={18} aria-hidden="true" />
          <span>{feedback}</span>
        </div>
      )}
      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "#fff5f5", border: "1px solid #c53030", color: "#741d1d", padding: "12px 16px", borderRadius: 8 }}>
          <AlertCircle size={18} aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {/* Grant Actions Grid */}
      <div className="two-col" style={{ gap: "20px" }}>
        {/* Grant Role Card */}
        <section className="panel" style={{ padding: "20px" }}>
          <div className="panel-heading" style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", margin: 0 }}>Grant Staff Role</h3>
            <p className="muted" style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
              Provision verified system administrative or teacher access by email.
            </p>
          </div>
          <form onSubmit={handleGrantRole} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                Staff Email Address
              </label>
              <input
                type="email"
                required
                className="input"
                placeholder="teacher@example.org"
                value={roleEmail}
                onChange={(e) => setRoleEmail(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                Role
              </label>
              <select
                className="input"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as "admin" | "teacher")}
                style={{ width: "100%" }}
              >
                <option value="teacher">Teacher (Course Authoring &amp; Class Roster)</option>
                <option value="admin">Admin (Super-admin &amp; Publication Authority)</option>
              </select>
            </div>
            <button
              type="submit"
              className="button button-primary"
              disabled={submittingRole || !roleEmail.trim()}
              style={{ marginTop: "4px" }}
            >
              <Plus size={16} aria-hidden="true" />
              {submittingRole ? "Granting role..." : "Grant Role"}
            </button>
          </form>
        </section>

        {/* Assign Course Author Card */}
        <section className="panel" style={{ padding: "20px" }}>
          <div className="panel-heading" style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", margin: 0 }}>Assign Course Author</h3>
            <p className="muted" style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
              Grant a teacher scoped authoring rights to draft a specific course.
            </p>
          </div>
          <form onSubmit={handleAssignCourse} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                Teacher Email Address
              </label>
              <input
                type="email"
                required
                className="input"
                placeholder="teacher@example.org"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, marginBottom: "4px" }}>
                Course UUID
              </label>
              <input
                type="text"
                required
                className="input"
                placeholder="e.g. c0000000-0000-4000-8000-000000000001"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <button
              type="submit"
              className="button button-primary"
              disabled={submittingAuthor || !authorEmail.trim() || !courseId.trim()}
              style={{ marginTop: "4px" }}
            >
              <Plus size={16} aria-hidden="true" />
              {submittingAuthor ? "Assigning author..." : "Assign Course Author"}
            </button>
          </form>
        </section>
      </div>

      {/* Connected Staff Directory List */}
      <section className="panel" style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "16px", margin: 0 }}>Connected Staff Members</h3>
            <p className="muted" style={{ margin: "4px 0 0 0", fontSize: "13px" }}>
              Active roles and course assignments verified directly from database grants.
            </p>
          </div>
          <button
            type="button"
            className="button button-outline"
            onClick={loadStaff}
            disabled={loading}
          >
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {staff.length === 0 ? (
          <div className="empty-state" style={{ padding: "32px 16px", textAlign: "center" }}>
            <Users size={32} className="muted" style={{ margin: "0 auto 8px" }} />
            <h4>No staff records found</h4>
            <p className="muted" style={{ fontSize: "13px" }}>
              Use the forms above to grant your first staff role or assign course authoring rights.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {staff.map((member) => (
              <div
                key={member.user_id}
                style={{
                  border: "1px solid var(--line)",
                  borderRadius: 8,
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  background: "#ffffff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong style={{ fontSize: "14px" }}>{member.email}</strong>
                    <div className="muted" style={{ fontSize: "11px", marginTop: "2px" }}>
                      User ID: {member.user_id}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {member.roles.map((r) => (
                      <span
                        key={r}
                        className={`badge ${r === "admin" ? "tone-lavender" : "tone-mint"}`}
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        {r === "admin" ? <ShieldCheck size={12} /> : <Users size={12} />}
                        {r}
                        <button
                          type="button"
                          onClick={() => handleRevokeRole(member.email, r)}
                          title={`Revoke ${r} role`}
                          style={{
                            background: "transparent",
                            border: "none",
                            cursor: "pointer",
                            padding: "0 0 0 4px",
                            display: "inline-flex",
                            alignItems: "center",
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Assigned Courses */}
                {member.assigned_courses.length > 0 && (
                  <div style={{ background: "#f8f6fc", padding: "10px 12px", borderRadius: 6, fontSize: "12px" }}>
                    <span style={{ fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: "4px" }}>
                      Assigned Course Authoring:
                    </span>
                    <ul style={{ margin: 0, paddingLeft: "16px" }}>
                      {member.assigned_courses.map((ac) => (
                        <li key={ac.course_id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "2px 0" }}>
                          <span>{ac.title} ({ac.course_id.slice(0, 8)}...)</span>
                          <button
                            type="button"
                            className="button button-outline"
                            onClick={() => handleRevokeCourse(member.email, ac.course_id)}
                            style={{ padding: "2px 8px", fontSize: "11px" }}
                          >
                            Revoke
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
