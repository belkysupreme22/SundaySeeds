import { useId, useState, type FormEvent } from "react";
import { Mail, Plus, Users } from "lucide-react";
import { InputField } from "../../../shared/ui/InputField";
import type { TeachingClass, ClassInvitation } from "./types";
import type { TeachingClassesModel } from "./useTeachingClasses";

export function ClassPeople({
  item,
  model,
  mode,
}: {
  item: TeachingClass;
  model: TeachingClassesModel;
  mode: "roster" | "invitations";
}) {
  const prefix = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmation, setConfirmation] = useState<{
    message: string;
    label: string;
    action: () => void;
  } | null>(null);
  const [status, setStatus] = useState("");
  const query = search.trim().toLowerCase();
  const people = mode === "roster" ? item.members : item.invitations;
  const filtered = people.filter(
    (person) =>
      (filter === "all" || person.status === filter) &&
      `${person.name} ${person.email}`.toLowerCase().includes(query),
  );
  const activeEmails = new Set(
    item.members
      .filter((member) => member.status === "active")
      .map((member) => member.email.toLowerCase()),
  );

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const address = email.trim().toLowerCase();
    if (!name.trim() || !address) {
      setError("Add a name and an example email address.");
      return;
    }
    if (
      activeEmails.has(address) ||
      item.invitations.some(
        (invitation) =>
          invitation.email.toLowerCase() === address &&
          invitation.status === "pending",
      )
    ) {
      setError(
        "This address already has an active membership or a pending invitation in this simulation.",
      );
      return;
    }
    model.invite(item.id, name, address);
    setName("");
    setEmail("");
    setError("");
    setShowForm(false);
    setFilter("all");
    setSearch("");
    setStatus("Simulated invitation created. No email was sent.");
  }

  function changeInvitation(
    invitation: ClassInvitation,
    next: ClassInvitation["status"],
  ) {
    const labels = {
      accepted: "Simulate acceptance",
      revoked: "Revoke invitation",
      expired: "Simulate expiry",
      pending: "Reissue invitation",
    };
    const messages = {
      accepted: `Simulate ${invitation.name} accepting? This adds an active entry to this example roster, without creating an account or granting access.`,
      revoked: `Revoke the simulated invitation for ${invitation.name}?`,
      expired: `Show the invitation for ${invitation.name} as expired? No real expiry time is being recorded.`,
      pending: `Reissue the simulated invitation for ${invitation.name}? This returns it to pending; no email will be sent.`,
    };
    setConfirmation({
      message: messages[next],
      label: labels[next],
      action: () => {
        model.invitationStatus(item.id, invitation.id, next);
        setStatus(`Invitation marked ${next} in the simulation.`);
      },
    });
  }

  return (
    <section className="class-surface class-people">
      <div className="class-section-heading">
        <div>
          <p className="eyebrow">
            {mode === "roster" ? "Adult learners" : "Invitation workspace"}
          </p>
          <h3>
            {mode === "roster"
              ? "People in this class"
              : "A clear path into the group"}
          </h3>
          <p className="muted">
            {mode === "roster"
              ? "All entries are simulated memberships. Learning progress is unavailable."
              : "Create example invitations and explore their states. No delivery, join link or account access is connected."}
          </p>
        </div>
        {mode === "invitations" && (
          <button
            type="button"
            className="button button-primary"
            disabled={item.archived}
            onClick={() => setShowForm(!showForm)}
          >
            <Plus size={16} />
            {showForm ? "Close invitation form" : "Create simulated invitation"}
          </button>
        )}
      </div>
      {showForm && mode === "invitations" && (
        <form className="class-invite-form" onSubmit={submit}>
          <h3>Invitation simulation</h3>
          <p className="muted">
            Use example details such as learner@example.test.
          </p>
          <div className="class-form-columns">
            <label className="field" htmlFor={`${prefix}-name`}>
              Learner name
              <InputField
                id={`${prefix}-name`}
                value={name}
                maxLength={100}
                required
                onChange={(event) => setName(event.target.value)}
                disabled={item.archived}
              />
            </label>
            <label className="field" htmlFor={`${prefix}-email`}>
              Example email
              <InputField
                id={`${prefix}-email`}
                type="email"
                value={email}
                maxLength={254}
                required
                onChange={(event) => setEmail(event.target.value)}
                disabled={item.archived}
              />
            </label>
          </div>
          {error && (
            <p className="teacher-form-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="button button-primary"
            disabled={item.archived}
          >
            Create simulated invitation
          </button>
        </form>
      )}
      <div className="class-filters">
        <label className="field" htmlFor={`${prefix}-search`}>
          Find a person
          <InputField
            id={`${prefix}-search`}
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or example email"
          />
        </label>
        <label className="field" htmlFor={`${prefix}-status`}>
          Status
          <select
            className="input"
            id={`${prefix}-status`}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
          >
            <option value="all">All states</option>
            {(mode === "roster"
              ? ["active", "removed"]
              : ["pending", "accepted", "revoked", "expired"]
            ).map((value) => (
              <option value={value} key={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {confirmation && (
        <div
          className="class-confirm"
          role="group"
          aria-label="Confirm simulated membership change"
        >
          <p>{confirmation.message}</p>
          <div className="class-actions">
            <button
              type="button"
              className="button button-outline"
              onClick={() => setConfirmation(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                confirmation.action();
                setConfirmation(null);
              }}
              disabled={item.archived}
            >
              {confirmation.label}
            </button>
          </div>
        </div>
      )}
      {filtered.length ? (
        <ul className="class-person-list">
          {filtered.map((person) => (
            <li key={person.id}>
              <span className="class-avatar" aria-hidden="true">
                {person.name
                  .split(" ")
                  .map((part) => part.charAt(0))
                  .slice(0, 2)
                  .join("")}
              </span>
              <div className="class-person-copy">
                <strong>{person.name}</strong>
                <span className="muted">{person.email}</span>
                <span className={`class-status class-status-${person.status}`}>
                  {person.status}
                </span>
              </div>
              <div className="class-actions">
                {mode === "roster" ? (
                  <button
                    type="button"
                    className="button button-outline"
                    disabled={item.archived}
                    onClick={() =>
                      setConfirmation({
                        message:
                          person.status === "active"
                            ? `Remove ${person.name} from the simulated active roster? The entry remains visible as removed; there is no real access to revoke.`
                            : `Restore ${person.name} to the simulated active roster? No real access is granted.`,
                        label:
                          person.status === "active"
                            ? "Remove from roster"
                            : "Restore membership",
                        action: () => {
                          model.membership(
                            item.id,
                            person.id,
                            person.status === "active" ? "removed" : "active",
                          );
                          setStatus("Simulated membership updated.");
                        },
                      })
                    }
                  >
                    {person.status === "active" ? "Remove" : "Restore"}
                  </button>
                ) : (
                  <>
                    {person.status === "pending" && (
                      <>
                        <button
                          type="button"
                          className="button button-outline"
                          disabled={item.archived}
                          onClick={() =>
                            changeInvitation(
                              person as ClassInvitation,
                              "accepted",
                            )
                          }
                        >
                          Simulate acceptance
                        </button>
                        <button
                          type="button"
                          className="button button-outline"
                          disabled={item.archived}
                          onClick={() =>
                            changeInvitation(
                              person as ClassInvitation,
                              "expired",
                            )
                          }
                        >
                          Simulate expiry
                        </button>
                        <button
                          type="button"
                          className="button button-outline"
                          disabled={item.archived}
                          onClick={() =>
                            changeInvitation(
                              person as ClassInvitation,
                              "revoked",
                            )
                          }
                        >
                          Revoke
                        </button>
                      </>
                    )}
                    {(person.status === "expired" ||
                      person.status === "revoked") && (
                      <button
                        type="button"
                        className="button button-outline"
                        disabled={
                          item.archived ||
                          activeEmails.has(person.email.toLowerCase()) ||
                          item.invitations.some(
                            (invitation) =>
                              invitation.id !== person.id &&
                              invitation.email === person.email &&
                              invitation.status === "pending",
                          )
                        }
                        onClick={() =>
                          changeInvitation(person as ClassInvitation, "pending")
                        }
                      >
                        Reissue
                      </button>
                    )}
                    {person.status === "accepted" && (
                      <span className="muted">See roster for membership</span>
                    )}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state">
          <span className="teacher-icon-tile tone-mint">
            {mode === "roster" ? <Users size={22} /> : <Mail size={22} />}
          </span>
          <h3>
            {people.length
              ? "No matching people"
              : mode === "roster"
                ? "A space for your group"
                : "No invitations yet"}
          </h3>
          <p className="muted">
            {people.length
              ? "Try another name or status."
              : mode === "roster"
                ? "Simulate accepting an invitation to add an adult learner to this roster."
                : "Create an invitation simulation to explore pending, accepted, expired and revoked states."}
          </p>
          {people.length > 0 && (
            <button
              type="button"
              className="button button-outline"
              onClick={() => {
                setSearch("");
                setFilter("all");
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}
      <p className="class-live-status" role="status">
        {status}
      </p>
    </section>
  );
}
