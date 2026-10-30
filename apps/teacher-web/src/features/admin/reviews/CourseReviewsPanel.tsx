import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  CircleAlert,
  Clock,
  ExternalLink,
  Layers,
  RotateCcw,
  Send,
  ShieldCheck,
  Sparkles,
  BookOpen,
} from "lucide-react";
import {
  fetchCourseReviews,
  fetchCourseReview,
  publishCourseReview,
  returnCourseReview,
  type CourseReviewItem,
  type CourseReviewDetails,
} from "../../teacher/data/staffDraftApi";

export function CourseReviewsPanel() {
  const [reviews, setReviews] = useState<CourseReviewItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [details, setDetails] = useState<CourseReviewDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [returnNotes, setReturnNotes] = useState("");
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchCourseReviews();
      setReviews(items);
      if (items.length > 0 && !selectedId) {
        setSelectedId(items[0].review_id);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load course reviews.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadReviews();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setDetails(null);
      return;
    }
    let active = true;
    void fetchCourseReview(selectedId)
      .then((d) => {
        if (active) setDetails(d);
      })
      .catch((err) => {
        if (active) {
          const msg = err instanceof Error ? err.message : "Failed to load review details.";
          setError(msg);
        }
      });

    return () => {
      active = false;
    };
  }, [selectedId]);

  const handlePublish = async () => {
    if (!selectedId) return;
    setActionInProgress(true);
    setError(null);
    setMessage(null);
    try {
      const res = await publishCourseReview(selectedId);
      if (res.ok) {
        setMessage(`Success! Course Edition ${res.edition_number} is now published in the learner catalog.`);
        await loadReviews();
        const updated = await fetchCourseReview(selectedId);
        setDetails(updated);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Publication failed.";
      setError(msg);
    } finally {
      setActionInProgress(false);
    }
  };

  const handleReturn = async () => {
    if (!selectedId || !returnNotes.trim()) return;
    setActionInProgress(true);
    setError(null);
    setMessage(null);
    try {
      const res = await returnCourseReview(selectedId, returnNotes.trim());
      if (res.ok) {
        setMessage("Changes requested. The review status has been returned to the teacher.");
        setShowReturnModal(false);
        setReturnNotes("");
        await loadReviews();
        const updated = await fetchCourseReview(selectedId);
        setDetails(updated);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to return for changes.";
      setError(msg);
    } finally {
      setActionInProgress(false);
    }
  };

  const getStatusBadge = (status: CourseReviewItem["status"]) => {
    switch (status) {
      case "published":
        return <span className="badge tone-mint">Published</span>;
      case "changes_requested":
        return <span className="badge tone-peach">Changes Requested</span>;
      case "approved":
        return <span className="badge tone-yellow">Approved</span>;
      default:
        return <span className="badge tone-lavender">Pending Review</span>;
    }
  };

  return (
    <div className="admin-reviews-panel" style={{ display: "flex", gap: "24px", minHeight: "600px" }}>
      {/* Left Column: Review List */}
      <div style={{ flex: "0 0 320px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0, fontSize: "16px" }}>Submitted Reviews</h3>
          <button
            type="button"
            className="button button-outline"
            onClick={loadReviews}
            disabled={loading}
            style={{ padding: "4px 8px", fontSize: "12px" }}
          >
            <RotateCcw size={14} />
            <span>Refresh</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="panel empty-state" style={{ padding: "24px 16px", textAlign: "center" }}>
            <p className="muted" style={{ margin: 0 }}>No course drafts submitted for review yet.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", overflowY: "auto" }}>
            {reviews.map((r) => {
              const active = r.review_id === selectedId;
              return (
                <button
                  key={r.review_id}
                  type="button"
                  onClick={() => setSelectedId(r.review_id)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    padding: "12px 14px",
                    background: active ? "#ffffff" : "#fcfaff",
                    border: "1px solid var(--ink)",
                    boxShadow: active ? "3px 3px 0 var(--ink)" : "none",
                    borderRadius: "8px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 600, fontSize: "14px", color: "var(--ink)" }}>{r.title}</span>
                    {getStatusBadge(r.status)}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", display: "flex", gap: "8px" }}>
                    <span>Rev {r.revision}</span>
                    <span>·</span>
                    <span>{r.submitted_by || "Teacher"}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Right Column: Review Details Inspector */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #d94343", color: "#a81c1c", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
            {error}
          </div>
        )}
        {message && (
          <div style={{ background: "#f0fff4", border: "1px solid #2e7d32", color: "#1b5e20", padding: "10px 14px", borderRadius: 8, fontSize: 13 }}>
            {message}
          </div>
        )}

        {!details ? (
          <div className="panel empty-state" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <p className="muted">Select a review from the list to inspect its contents.</p>
          </div>
        ) : (
          <div className="panel" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                  <span className="eyebrow" style={{ margin: 0 }}>Review ID: {details.review_id.slice(0, 8)}…</span>
                  {getStatusBadge(details.status)}
                </div>
                <h2 style={{ margin: "0 0 6px 0", fontSize: "20px" }}>{details.snapshot.course.title}</h2>
                <p className="muted" style={{ margin: 0, fontSize: "13px" }}>
                  Submitted by {details.submitted_by} · Revision {details.revision} · {new Date(details.created_at).toLocaleString()}
                </p>
              </div>

              {/* Admin Actions */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {details.status !== "published" && (
                  <>
                    <button
                      type="button"
                      className="button button-outline"
                      onClick={() => setShowReturnModal(true)}
                      disabled={actionInProgress}
                    >
                      <RotateCcw size={16} />
                      <span>Request Changes</span>
                    </button>
                    <button
                      type="button"
                      className="button button-primary"
                      onClick={handlePublish}
                      disabled={actionInProgress}
                    >
                      <Sparkles size={16} />
                      <span>{actionInProgress ? "Publishing…" : "Publish Course Edition"}</span>
                    </button>
                  </>
                )}
                {details.status === "published" && (
                  <span className="badge tone-mint" style={{ padding: "8px 12px", fontSize: "13px" }}>
                    Published Edition {details.published_edition_number}
                  </span>
                )}
              </div>
            </div>

            {/* Review Notes Banner if changes were requested */}
            {details.review_notes && (
              <div style={{ background: "#fffbf0", border: "1px solid #d99b26", color: "#875a00", padding: "12px 16px", borderRadius: 8 }}>
                <strong>Admin Feedback Notes:</strong>
                <p style={{ margin: "4px 0 0 0", fontSize: "13px" }}>{details.review_notes}</p>
              </div>
            )}

            {/* Course Summary & Metrics */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px" }}>
              <div style={{ padding: "12px", background: "#f8f5fc", borderRadius: 8, border: "1px solid var(--line)" }}>
                <span className="muted" style={{ fontSize: "11px", fontWeight: 600 }}>MODULES</span>
                <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 700 }}>{details.snapshot.modules.length}</p>
              </div>
              <div style={{ padding: "12px", background: "#f8f5fc", borderRadius: 8, border: "1px solid var(--line)" }}>
                <span className="muted" style={{ fontSize: "11px", fontWeight: 600 }}>LESSONS</span>
                <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 700 }}>{details.snapshot.lessons.length}</p>
              </div>
              <div style={{ padding: "12px", background: "#f8f5fc", borderRadius: 8, border: "1px solid var(--line)" }}>
                <span className="muted" style={{ fontSize: "11px", fontWeight: 600 }}>QUESTIONS</span>
                <p style={{ margin: "4px 0 0 0", fontSize: "18px", fontWeight: 700 }}>
                  {details.snapshot.lessons.reduce((sum, l) => sum + (l.quiz?.length || 0), 0)}
                </p>
              </div>
            </div>

            {/* Modules & Lessons Inspection */}
            <div>
              <h3 style={{ fontSize: "15px", marginBottom: "12px" }}>Course Outline &amp; Content</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {details.snapshot.modules.map((m, mIdx) => (
                  <div key={m.id} style={{ border: "1px solid var(--line)", borderRadius: 8, padding: "16px" }}>
                    <div style={{ fontWeight: 600, fontSize: "14px", marginBottom: "8px" }}>
                      Module {mIdx + 1}: {m.title}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {m.lessonIds.map((lId) => {
                        const lesson = details.snapshot.lessons.find((l) => l.id === lId);
                        if (!lesson) return null;
                        return (
                          <div
                            key={lId}
                            style={{
                              background: "#fcfaff",
                              border: "1px solid var(--line)",
                              borderRadius: 6,
                              padding: "10px 12px",
                              fontSize: "13px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                              <strong>{lesson.title}</strong>
                              <span className="muted">{lesson.scripture}</span>
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--muted)" }}>
                              {lesson.sections.length} reading sections · {lesson.quiz.length} quiz questions
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Return for Changes Modal */}
      {showReturnModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(25, 23, 29, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            zIndex: 1000,
          }}
        >
          <div
            className="panel"
            style={{
              width: "100%",
              maxWidth: "480px",
              padding: "24px",
              background: "#ffffff",
              border: "1px solid var(--ink)",
              boxShadow: "4px 4px 0 var(--ink)",
              borderRadius: "12px",
            }}
          >
            <h3 style={{ margin: "0 0 8px 0" }}>Request Changes</h3>
            <p className="muted" style={{ margin: "0 0 16px 0", fontSize: "13px" }}>
              Provide clear feedback for the author explaining what needs adjustment before this course can be published.
            </p>
            <textarea
              className="input"
              rows={4}
              placeholder="e.g., Please add at least 2 questions to the second lesson quiz, and verify the memory verse reference."
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              style={{ width: "100%", marginBottom: "16px" }}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button
                type="button"
                className="button button-outline"
                onClick={() => setShowReturnModal(false)}
                disabled={actionInProgress}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={handleReturn}
                disabled={actionInProgress || !returnNotes.trim()}
              >
                Send Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
