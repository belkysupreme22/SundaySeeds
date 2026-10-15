import { useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import {
  directoryRoleLabels,
  type DirectoryInvitation,
  type DirectoryModel,
  type InvitationStatus,
} from "./types";
const transitionCopy = {
  accepted: {
    label: "Simulate acceptance",
    detail:
      "Create or reuse a simulated person record and activate their class membership? This does not create a sign-in account or grant real access.",
  },
  revoked: {
    label: "Revoke invitation",
    detail:
      "Mark this simulated invitation as revoked? No membership or delivery service is changed.",
  },
  expired: {
    label: "Simulate expiry",
    detail:
      "Mark this invitation as expired for this example? No real expiration time is recorded.",
  },
  pending: {
    label: "Reissue invitation",
    detail:
      "Return this invitation to pending? No email or join link will be delivered.",
  },
};

export function InvitationDetails({
  model,
  selected,
  onBack,
  initialFeedback,
}: {
  model: DirectoryModel;
  selected: DirectoryInvitation;
  onBack: () => void;
  initialFeedback: string;
}) {
  const [confirmation, setConfirmation] = useState<InvitationStatus | null>(
    null,
  );
  const [feedback, setFeedback] = useState(initialFeedback);
  const [error, setError] = useState("");
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [selected.id]);
  const back = onBack;
  function scope(invitation: DirectoryInvitation) {
    const group = model.classes.find((item) => item.id === invitation.classId);
    const organization = model.organizations.find(
      (item) => item.id === group?.organizationId,
    );
    return {
      group,
      organization,
      title: `${organization?.name ?? "Organization unavailable"} / ${group?.name ?? "Class unavailable"}`,
      closed:
        !group || group.archived || !organization || organization.archived,
    };
  }
  function change() {
    if (!selected || !confirmation) return;
    const result = model.changeInvitationStatus(selected.id, confirmation);
    if (result.ok) {
      setConfirmation(null);
      setFeedback(result.message);
      setError("");
    } else setError(result.message);
  }
  if (selected) {
    const context = scope(selected);
    return (
      <section className="admin-dir-stack">
        <button
          type="button"
          className="button button-outline admin-dir-back"
          onClick={back}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          All invitations
        </button>
        <header className="admin-dir-surface admin-dir-heading">
          <div>
            <p className="eyebrow">Invitation · simulation</p>
            <h2 ref={heading} tabIndex={-1}>
              {selected.name}
            </h2>
            <p>{selected.email}</p>
            <p className="admin-dir-scope">{context.title}</p>
          </div>
          <span className="badge">{selected.status}</span>
        </header>
        <div className="admin-dir-surface admin-dir-stack">
          <dl className="admin-dir-meta">
            <div>
              <dt>Participation</dt>
              <dd>{directoryRoleLabels[selected.role]}</dd>
            </div>
            <div>
              <dt>Scope</dt>
              <dd>One class within the organization shown above</dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>Not connected · no email or join link</dd>
            </div>
          </dl>
          {context.closed && (
            <p className="admin-dir-note">
              This organization or class is archived or unavailable. Restore its
              scope before changing invitation states.
            </p>
          )}
          <div className="admin-dir-actions">
            {selected.status === "pending" ? (
              (["accepted", "revoked", "expired"] as const).map((next) => (
                <button
                  type="button"
                  className="button button-outline"
                  disabled={context.closed}
                  key={next}
                  onClick={() => {
                    setConfirmation(next);
                    setError("");
                  }}
                >
                  {transitionCopy[next].label}
                </button>
              ))
            ) : selected.status === "accepted" ? (
              <p className="muted">
                Accepted in the simulation. Find the person in People or their
                membership in Organizations to review the result.
              </p>
            ) : (
              <button
                type="button"
                className="button button-outline"
                disabled={context.closed}
                onClick={() => {
                  setConfirmation("pending");
                  setError("");
                }}
              >
                Reissue invitation
              </button>
            )}
          </div>
          {confirmation && (
            <div
              className="admin-dir-confirm"
              role="group"
              aria-label="Confirm invitation state change"
            >
              <strong>{transitionCopy[confirmation].label}</strong>
              <p>{transitionCopy[confirmation].detail}</p>
              <p>
                {selected.name} · {directoryRoleLabels[selected.role]} ·{" "}
                {context.title}
              </p>
              <div className="admin-dir-actions">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => {
                    setConfirmation(null);
                    setError("");
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="button button-primary"
                  disabled={context.closed}
                  onClick={change}
                >
                  Confirm simulation
                </button>
              </div>
            </div>
          )}
          {error && (
            <p role="alert" className="admin-dir-error">
              {error}
            </p>
          )}
          <p className="admin-dir-status" role="status">
            {feedback}
          </p>
        </div>
      </section>
    );
  }
  return null;
}
