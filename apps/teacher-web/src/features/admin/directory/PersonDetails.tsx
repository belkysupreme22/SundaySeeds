import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Pencil, User } from "lucide-react";
import {
  directoryRoleLabels,
  type DirectoryModel,
  type DirectoryPerson,
} from "./types";

export function PersonDetails({
  model,
  person,
  onBack,
  onEdit,
}: {
  model: DirectoryModel;
  person: DirectoryPerson;
  onBack: () => void;
  onEdit: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    heading.current?.focus();
  }, [person.id]);
  const memberships = model.memberships.filter(
    (item) => item.personId === person.id,
  );
  const invitations = model.invitations.filter(
    (item) => item.email.toLowerCase() === person.email.toLowerCase(),
  );
  function scope(classId: string) {
    const group = model.classes.find((item) => item.id === classId);
    const org = model.organizations.find(
      (item) => item.id === group?.organizationId,
    );
    return {
      group,
      org,
      title: `${org?.name ?? "Organization unavailable"} / ${group?.name ?? "Class unavailable"}`,
    };
  }
  function changeStatus() {
    const result = model.setPersonStatus(
      person.id,
      person.status === "active" ? "inactive" : "active",
    );
    setMessage(result.message);
    setError(!result.ok);
    if (result.ok) setConfirm(false);
  }
  return (
    <section className="admin-dir-stack">
      <button
        type="button"
        className="button button-outline admin-dir-back"
        onClick={onBack}
      >
        <ArrowLeft size={16} aria-hidden="true" />
        All people
      </button>
      <header className="admin-dir-surface admin-dir-profile">
        <span className="admin-dir-avatar" aria-hidden="true">
          <User size={32} />
        </span>
        <div>
          <p className="eyebrow">Directory record</p>
          <h2 tabIndex={-1} ref={heading}>
            {person.name}
          </h2>
          <p>{person.email}</p>
          <div className="admin-dir-actions">
            <span className="badge">{directoryRoleLabels[person.role]}</span>
            <span className="badge">{person.status}</span>
          </div>
        </div>
        <button
          type="button"
          className="button button-outline"
          onClick={onEdit}
        >
          <Pencil size={16} aria-hidden="true" />
          Edit details
        </button>
      </header>
      <section className="admin-dir-surface admin-dir-stack">
        <div className="admin-dir-heading">
          <div>
            <h3>Directory status</h3>
            <p className="muted">
              This changes the record status only. Class membership records
              remain separate; live access is not connected.
            </p>
          </div>
          <button
            type="button"
            className="button button-outline"
            onClick={() => setConfirm(true)}
          >
            {person.status === "active"
              ? "Mark record inactive"
              : "Reactivate record"}
          </button>
        </div>
        {confirm && (
          <div
            className="admin-dir-confirm"
            role="group"
            aria-label="Confirm directory status change"
          >
            <p>
              {person.status === "active"
                ? "Mark this directory record inactive? Existing class records remain visible, and new enrollments will be paused in this simulation."
                : "Reactivate this directory record? Removed memberships stay removed; no real access is granted."}
            </p>
            <div className="admin-dir-actions">
              <button
                type="button"
                className="button button-outline"
                onClick={() => setConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-primary"
                onClick={changeStatus}
              >
                Confirm record change
              </button>
            </div>
          </div>
        )}
        {message && (
          <p
            className={error ? "admin-dir-error" : "admin-dir-status"}
            role={error ? "alert" : "status"}
          >
            {message}
          </p>
        )}
      </section>
      <section className="admin-dir-surface admin-dir-stack">
        <div>
          <p className="eyebrow">Organization / class scope</p>
          <h3>Memberships and teaching assignments</h3>
        </div>
        {memberships.length ? (
          <div
            className="table-wrap"
            tabIndex={0}
            role="region"
            aria-label="Person membership scope table"
          >
            <table className="data-table">
              <caption>
                Membership records for {person.name}; record status is shown
                separately above.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Organization / class</th>
                  <th scope="col">Participation</th>
                  <th scope="col">Membership</th>
                </tr>
              </thead>
              <tbody>
                {memberships.map((member) => {
                  const context = scope(member.classId);
                  return (
                    <tr key={member.id}>
                      <th scope="row">
                        {context.title}
                        {(context.org?.archived || context.group?.archived) && (
                          <small className="admin-dir-subtext">
                            Archived scope · records retained
                          </small>
                        )}
                      </th>
                      <td>{directoryRoleLabels[member.role]}</td>
                      <td>{member.status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">
            No class membership is linked. Use Organizations to add this active
            person to a class.
          </p>
        )}
        <p className="muted">
          Membership changes are made in the organization’s class roster.
        </p>
      </section>
      <section className="admin-dir-surface admin-dir-stack">
        <div>
          <p className="eyebrow">Related invitations</p>
          <h3>A clear path into each group</h3>
        </div>
        {invitations.length ? (
          <ul className="admin-dir-record-list">
            {invitations.map((invite) => (
              <li key={invite.id}>
                <strong>{scope(invite.classId).title}</strong>
                <span>
                  {directoryRoleLabels[invite.role]} · {invite.status}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">
            No invitation records match this example email.
          </p>
        )}
        <p className="muted">
          Use Invitations to review or change an invitation state. No delivery
          dates or join links are fabricated.
        </p>
      </section>
    </section>
  );
}
