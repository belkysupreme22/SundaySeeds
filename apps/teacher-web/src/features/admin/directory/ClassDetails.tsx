import { useState } from "react";
import { Archive, ArrowLeft, Pencil, RotateCcw } from "lucide-react";
import type {
  DirectoryClass,
  DirectoryModel,
  DirectoryOrganization,
} from "./types";
import { ClassMemberships } from "./ClassMemberships";

export function ClassDetails({
  item,
  organization,
  model,
  onBack,
  onEdit,
}: {
  item: DirectoryClass;
  organization: DirectoryOrganization;
  model: DirectoryModel;
  onBack: () => void;
  onEdit: () => void;
}) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [archiveConfirm, setArchiveConfirm] = useState(false);
  const blocked = item.archived || organization.archived;
  const invitations = model.invitations.filter(
    (invitation) => invitation.classId === item.id,
  );
  function announce(result: { ok: boolean; message: string }) {
    setMessage(result.message);
    setError(!result.ok);
    return result.ok;
  }
  function changeArchive() {
    if (announce(model.archiveClass(item.id, !item.archived)))
      setArchiveConfirm(false);
  }
  return (
    <section className="admin-dir-stack">
      <button
        type="button"
        className="button button-outline admin-dir-back"
        onClick={onBack}
      >
        <ArrowLeft size={16} />
        Back to {organization.name}
      </button>
      <div className="admin-dir-surface admin-dir-stack tone-mint">
        <p className="admin-dir-scope">
          Organization: <strong>{organization.name}</strong>
          {organization.archived && " · Archived"}
        </p>
        <div className="admin-dir-heading">
          <div>
            <p className="eyebrow">Class workspace</p>
            <h2>{item.name}</h2>
            <span className="admin-dir-status">
              {item.archived ? "Archived" : "Active"}
            </span>
          </div>
          <div className="admin-dir-actions">
            <button
              className="button button-outline"
              type="button"
              disabled={blocked}
              onClick={onEdit}
            >
              <Pencil size={16} />
              Edit brief
            </button>
            <button
              className="button button-outline"
              type="button"
              disabled={organization.archived}
              onClick={() => setArchiveConfirm(true)}
            >
              {item.archived ? <RotateCcw size={16} /> : <Archive size={16} />}
              {item.archived ? "Restore class" : "Archive class"}
            </button>
          </div>
        </div>
        <p>{item.description || "No class purpose has been added."}</p>
        {blocked && (
          <p className="admin-dir-note">
            {organization.archived
              ? "The organization is archived. Restore the organization before changing this class."
              : "This class is archived. Restore it to resume membership and invitation changes."}{" "}
            Existing records remain available to read.
          </p>
        )}
        {archiveConfirm && (
          <div
            className="admin-dir-confirm"
            role="group"
            aria-label="Confirm class archive status"
          >
            <h3>
              {item.archived ? "Restore this class?" : "Archive this class?"}
            </h3>
            <p>
              {item.archived
                ? "The class will be active again. Removed memberships and invitation statuses stay as they are."
                : "Keep this class and its roster, but pause membership and invitation changes. This does not delete people or their records."}
            </p>
            <div className="admin-dir-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setArchiveConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-primary"
                disabled={organization.archived}
                onClick={changeArchive}
              >
                {item.archived ? "Confirm restore" : "Confirm archive"}
              </button>
            </div>
          </div>
        )}
      </div>
      {message && (
        <p
          className={error ? "admin-dir-error" : "admin-dir-note"}
          role={error ? "alert" : "status"}
        >
          {message}
        </p>
      )}
      <ClassMemberships item={item} organization={organization} model={model} />
      <div className="admin-dir-surface admin-dir-stack">
        <div>
          <p className="eyebrow">Invitation overview</p>
          <h3>Invitations for this class</h3>
        </div>
        <div className="admin-dir-actions">
          {(["pending", "accepted", "expired", "revoked"] as const).map(
            (invitationStatus) => (
              <span className="admin-dir-chip" key={invitationStatus}>
                {
                  invitations.filter(
                    (invitation) => invitation.status === invitationStatus,
                  ).length
                }{" "}
                {invitationStatus}
              </span>
            ),
          )}
        </div>
        <p className="muted">
          Use the Invitations tab to inspect recipients and manage invitation
          status. Invitations do not send email or create sign-in access.
        </p>
      </div>
    </section>
  );
}
