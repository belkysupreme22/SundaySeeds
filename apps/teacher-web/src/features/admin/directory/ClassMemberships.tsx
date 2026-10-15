import { useId, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import type {
  DirectoryClass,
  DirectoryMembership,
  DirectoryModel,
  DirectoryOrganization,
} from "./types";
import { directoryRoleLabels } from "./types";
import { MembershipTable } from "./MembershipTable";

export function ClassMemberships({
  item,
  organization,
  model,
}: {
  item: DirectoryClass;
  organization: DirectoryOrganization;
  model: DirectoryModel;
}) {
  const prefix = useId();
  const [personId, setPersonId] = useState("");
  const [status, setStatus] = useState("all");
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);
  const [membershipConfirm, setMembershipConfirm] =
    useState<DirectoryMembership | null>(null);
  const blocked = item.archived || organization.archived;
  const members = model.memberships.filter(
    (member) => member.classId === item.id,
  );
  const visible = members.filter(
    (member) => status === "all" || member.status === status,
  );
  const candidates = model.people.filter(
    (person) =>
      person.status === "active" &&
      !members.some((member) => member.personId === person.id),
  );
  const person = candidates.find((candidate) => candidate.id === personId);
  function announce(result: { ok: boolean; message: string }) {
    setMessage(result.message);
    setError(!result.ok);
    return result.ok;
  }
  function addMember(event: FormEvent) {
    event.preventDefault();
    if (!person) {
      setMessage("Choose an active person to add to this class.");
      setError(true);
      return;
    }
    if (announce(model.assignMembership(person.id, item.id, person.role)))
      setPersonId("");
  }
  function changeMembership() {
    if (!membershipConfirm) return;
    const result = model.setMembershipStatus(
      membershipConfirm.id,
      membershipConfirm.status === "active" ? "removed" : "active",
    );
    if (announce(result)) setMembershipConfirm(null);
  }
  return (
    <>
      {message && (
        <p
          className={error ? "admin-dir-error" : "admin-dir-note"}
          role={error ? "alert" : "status"}
        >
          {message}
        </p>
      )}
      <div className="admin-dir-surface admin-dir-stack">
        <div className="admin-dir-heading">
          <div>
            <p className="eyebrow">People in this class</p>
            <h3>Class roster</h3>
          </div>
          <span className="admin-dir-meta">
            {members.filter((member) => member.status === "active").length}{" "}
            active ·{" "}
            {members.filter((member) => member.status === "removed").length}{" "}
            removed
          </span>
        </div>
        <p className="muted">
          Class roles follow each person’s directory role. Adding a record here
          does not grant application access.
        </p>
        <form
          className="admin-dir-membership-form admin-dir-actions"
          onSubmit={addMember}
        >
          <label className="field" htmlFor={`${prefix}-person`}>
            Add an existing person
            <select
              id={`${prefix}-person`}
              className="input"
              value={personId}
              disabled={blocked || !candidates.length}
              onChange={(event) => setPersonId(event.target.value)}
            >
              <option value="">Choose an active person</option>
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  {candidate.name} · {directoryRoleLabels[candidate.role]} ·{" "}
                  {candidate.email}
                </option>
              ))}
            </select>
          </label>
          <button
            className="button button-primary"
            type="submit"
            disabled={blocked || !person}
          >
            <Plus size={16} />
            Add to class
          </button>
        </form>
        {!blocked && !candidates.length && (
          <p className="muted">
            No other active people are available. Restore a removed membership
            below, or create or reactivate a person in People first.
          </p>
        )}
        {membershipConfirm && (
          <div
            className="admin-dir-confirm"
            role="group"
            aria-label="Confirm membership change"
          >
            <h4>
              {membershipConfirm.status === "active"
                ? "Remove this membership?"
                : "Restore this membership?"}
            </h4>
            <p>
              {model.people.find(
                (candidate) => candidate.id === membershipConfirm.personId,
              )?.name ?? "This person"}{" "}
              · {item.name} · {organization.name}
            </p>
            <p>
              {membershipConfirm.status === "active"
                ? "The membership will be marked removed and retained in this roster. The person stays in the directory."
                : "The membership will become active if this person is active and their directory role still matches."}
            </p>
            <div className="admin-dir-actions">
              <button
                className="button button-outline"
                type="button"
                onClick={() => setMembershipConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="button button-primary"
                type="button"
                disabled={blocked}
                onClick={changeMembership}
              >
                {membershipConfirm.status === "active"
                  ? "Confirm remove"
                  : "Confirm restore"}
              </button>
            </div>
          </div>
        )}
        <label className="field" htmlFor={`${prefix}-status`}>
          Membership status
          <select
            id={`${prefix}-status`}
            className="input"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All memberships</option>
            <option value="active">Active</option>
            <option value="removed">Removed</option>
          </select>
        </label>
        {visible.length ? (
          <MembershipTable
            visible={visible}
            people={model.people}
            blocked={blocked}
            title={`${item.name}, ${organization.name}`}
            onChange={setMembershipConfirm}
          />
        ) : (
          <div className="admin-dir-empty">
            <h4>
              {members.length
                ? "No memberships match"
                : "The roster is ready to grow"}
            </h4>
            <p>
              {members.length
                ? "Choose another membership status."
                : "Add an active adult learner or teacher from the directory."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
