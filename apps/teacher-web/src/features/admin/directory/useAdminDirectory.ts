import { useRef, useState } from "react";
import { mergeDirectoryExamples } from "./directoryExamples";
import type {
  DirectoryModel,
  DirectoryResult,
  DirectoryRole,
  DirectoryState,
} from "./types";

const emptyDirectory = (): DirectoryState => ({
  people: [],
  organizations: [],
  classes: [],
  memberships: [],
  invitations: [],
});
const failure = (message: string): DirectoryResult => ({ ok: false, message });
const success = (message: string, id?: string): DirectoryResult => ({
  ok: true,
  message,
  id,
});
const key = (value: string) => value.trim().toLowerCase();
const validRole = (role: DirectoryRole) =>
  role === "learner" || role === "teacher";
const validName = (name: string) => name.length > 0 && name.length <= 100;
const validEmail = (email: string) =>
  email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

function classIssue(
  state: DirectoryState,
  classId: string,
): string | undefined {
  const group = state.classes.find((item) => item.id === classId);
  if (!group) return "This class is unavailable.";
  const organization = state.organizations.find(
    (item) => item.id === group.organizationId,
  );
  if (!organization) return "This class organization is unavailable.";
  if (organization.archived)
    return "Restore the organization before changing its classes or enrollment.";
  if (group.archived)
    return "Restore this class before changing its enrollment.";
}

function enrollmentIssue(
  state: DirectoryState,
  classId: string,
  email: string,
  role: DirectoryRole,
  invitationId?: string,
): string | undefined {
  const issue = classIssue(state, classId);
  if (issue) return issue;
  const person = state.people.find((item) => key(item.email) === key(email));
  if (person?.status === "inactive")
    return "Reactivate this person before enrolling or inviting them.";
  if (person && person.role !== role)
    return "The invitation classification must match the existing person. Role changes are planned separately.";
  if (
    person &&
    state.memberships.some(
      (item) =>
        item.personId === person.id &&
        item.classId === classId &&
        item.status === "active",
    )
  )
    return "This person already has an active membership in this class.";
  if (
    state.invitations.some(
      (item) =>
        item.id !== invitationId &&
        item.classId === classId &&
        key(item.email) === key(email) &&
        item.status === "pending",
    )
  )
    return "A pending invitation already exists for this email and class.";
}

/** Session-only administrative records; classifications never grant permissions. */
export function useAdminDirectory(): DirectoryModel {
  const [state, setState] = useState<DirectoryState>(emptyDirectory);
  const current = useRef(state);
  const sequence = useRef(0);
  const nextId = (kind: string) => `directory-${kind}-${++sequence.current}`;
  const commit = (next: DirectoryState, result: DirectoryResult) => {
    current.current = next;
    setState(next);
    return result;
  };

  return {
    ...state,
    loadExamples() {
      const next = mergeDirectoryExamples(current.current);
      commit(next, success("Example directory opened."));
    },
    savePerson(details, id) {
      const snapshot = current.current;
      const existing = snapshot.people.find((item) => item.id === id);
      if (id && !existing) return failure("This person is unavailable.");
      const name = details.name.trim();
      const email = key(details.email);
      if (!validName(name)) return failure("Enter a name of 1–100 characters.");
      if (!validEmail(email))
        return failure("Enter a valid email address of up to 254 characters.");
      if (!validRole(details.role))
        return failure("Choose Adult learner or Teacher.");
      if (
        snapshot.people.some(
          (item) => item.id !== id && key(item.email) === email,
        )
      )
        return failure("A person with this email already exists.");
      if (existing && existing.role !== details.role)
        return failure(
          "Changing an existing person's classification is planned with the access workflow.",
        );
      if (
        existing &&
        key(existing.email) !== email &&
        (snapshot.memberships.some((item) => item.personId === id) ||
          snapshot.invitations.some(
            (item) => key(item.email) === key(existing.email),
          ))
      )
        return failure(
          "Email changes for people with enrollment or invitation history are deferred. Their existing relationships are preserved.",
        );
      if (
        snapshot.invitations.some(
          (item) =>
            key(item.email) === email &&
            item.status === "pending" &&
            item.role !== details.role,
        )
      )
        return failure(
          "This email has a pending invitation with a different classification.",
        );
      const personId = id ?? nextId("person");
      const person = {
        id: personId,
        name,
        email,
        role: details.role,
        status: existing?.status ?? ("active" as const),
      };
      return commit(
        {
          ...snapshot,
          people: existing
            ? snapshot.people.map((item) => (item.id === id ? person : item))
            : [...snapshot.people, person],
        },
        success(existing ? "Person updated." : "Person created.", personId),
      );
    },
    setPersonStatus(id, status) {
      const snapshot = current.current;
      if (!snapshot.people.some((item) => item.id === id))
        return failure("This person is unavailable.");
      if (status !== "active" && status !== "inactive")
        return failure("Choose an available person status.");
      return commit(
        {
          ...snapshot,
          people: snapshot.people.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        },
        success(
          status === "active"
            ? "Person reactivated. Existing relationships were retained."
            : "Person marked inactive. Membership and invitation records were retained.",
          id,
        ),
      );
    },
    saveOrganization(details, id) {
      const snapshot = current.current;
      const existing = snapshot.organizations.find((item) => item.id === id);
      if (id && !existing) return failure("This organization is unavailable.");
      if (existing?.archived)
        return failure("Restore this organization before editing it.");
      const name = details.name.trim();
      const description = details.description.trim();
      if (!validName(name))
        return failure("Enter an organization name of 1–100 characters.");
      if (description.length > 1000)
        return failure("Keep the description within 1,000 characters.");
      if (
        snapshot.organizations.some(
          (item) => item.id !== id && key(item.name) === key(name),
        )
      )
        return failure("An organization with this name already exists.");
      const organizationId = id ?? nextId("organization");
      const organization = {
        id: organizationId,
        name,
        description,
        archived: false,
      };
      return commit(
        {
          ...snapshot,
          organizations: existing
            ? snapshot.organizations.map((item) =>
                item.id === id ? organization : item,
              )
            : [...snapshot.organizations, organization],
        },
        success(
          existing ? "Organization updated." : "Organization created.",
          organizationId,
        ),
      );
    },
    archiveOrganization(id, archived) {
      const snapshot = current.current;
      if (!snapshot.organizations.some((item) => item.id === id))
        return failure("This organization is unavailable.");
      return commit(
        {
          ...snapshot,
          organizations: snapshot.organizations.map((item) =>
            item.id === id ? { ...item, archived } : item,
          ),
        },
        success(
          archived
            ? "Organization archived. Classes and enrollment records were retained."
            : "Organization restored. Individually archived classes remain archived.",
          id,
        ),
      );
    },
    saveClass(details, id) {
      const snapshot = current.current;
      const existing = snapshot.classes.find((item) => item.id === id);
      if (id && !existing) return failure("This class is unavailable.");
      if (existing && existing.organizationId !== details.organizationId)
        return failure(
          "Moving a class between organizations is deferred. Its existing relationships were preserved.",
        );
      const organization = snapshot.organizations.find(
        (item) => item.id === details.organizationId,
      );
      if (!organization) return failure("Choose an available organization.");
      if (organization.archived)
        return failure(
          "Restore this organization before changing its classes.",
        );
      if (existing?.archived)
        return failure("Restore this class before editing it.");
      const name = details.name.trim();
      const description = details.description.trim();
      if (!validName(name))
        return failure("Enter a class name of 1–100 characters.");
      if (description.length > 1000)
        return failure("Keep the description within 1,000 characters.");
      if (
        snapshot.classes.some(
          (item) =>
            item.id !== id &&
            item.organizationId === organization.id &&
            key(item.name) === key(name),
        )
      )
        return failure(
          "A class with this name already exists in this organization.",
        );
      const classId = id ?? nextId("class");
      const group = {
        id: classId,
        organizationId: organization.id,
        name,
        description,
        archived: false,
      };
      return commit(
        {
          ...snapshot,
          classes: existing
            ? snapshot.classes.map((item) => (item.id === id ? group : item))
            : [...snapshot.classes, group],
        },
        success(existing ? "Class updated." : "Class created.", classId),
      );
    },
    archiveClass(id, archived) {
      const snapshot = current.current;
      const group = snapshot.classes.find((item) => item.id === id);
      if (!group) return failure("This class is unavailable.");
      const organization = snapshot.organizations.find(
        (item) => item.id === group.organizationId,
      );
      if (!organization || organization.archived)
        return failure("Restore the organization before changing this class.");
      return commit(
        {
          ...snapshot,
          classes: snapshot.classes.map((item) =>
            item.id === id ? { ...item, archived } : item,
          ),
        },
        success(
          archived
            ? "Class archived. Membership and invitation records were retained."
            : "Class restored.",
          id,
        ),
      );
    },
    assignMembership(personId, classId, role) {
      const snapshot = current.current;
      const person = snapshot.people.find((item) => item.id === personId);
      if (!person) return failure("Choose an available person.");
      if (!validRole(role) || person.role !== role)
        return failure("The membership classification must match the person.");
      const issue = enrollmentIssue(snapshot, classId, person.email, role);
      if (issue) return failure(issue);
      const removed = snapshot.memberships.find(
        (item) =>
          item.personId === personId &&
          item.classId === classId &&
          item.status === "removed",
      );
      const membershipId = removed?.id ?? nextId("membership");
      const membership = {
        id: membershipId,
        personId,
        classId,
        role,
        status: "active" as const,
      };
      return commit(
        {
          ...snapshot,
          memberships: removed
            ? snapshot.memberships.map((item) =>
                item.id === removed.id ? membership : item,
              )
            : [...snapshot.memberships, membership],
        },
        success(
          removed ? "Membership restored." : "Membership added.",
          membershipId,
        ),
      );
    },
    setMembershipStatus(id, status) {
      const snapshot = current.current;
      const membership = snapshot.memberships.find((item) => item.id === id);
      if (!membership) return failure("This membership is unavailable.");
      const issue = classIssue(snapshot, membership.classId);
      if (issue) return failure(issue);
      if (status !== "active" && status !== "removed")
        return failure("Choose an available membership status.");
      if (membership.status === status)
        return success("Membership already has this status.", id);
      if (status === "active") {
        const person = snapshot.people.find(
          (item) => item.id === membership.personId,
        );
        if (!person || person.status !== "active")
          return failure("Reactivate this person before restoring membership.");
        if (person.role !== membership.role)
          return failure(
            "The membership classification no longer matches this person.",
          );
        const enrollment = enrollmentIssue(
          snapshot,
          membership.classId,
          person.email,
          membership.role,
        );
        if (enrollment) return failure(enrollment);
      }
      return commit(
        {
          ...snapshot,
          memberships: snapshot.memberships.map((item) =>
            item.id === id ? { ...item, status } : item,
          ),
        },
        success(
          status === "active"
            ? "Membership restored."
            : "Membership removed. Its record was retained.",
          id,
        ),
      );
    },
    createInvitation(details) {
      const snapshot = current.current;
      const name = details.name.trim();
      const email = key(details.email);
      if (!validName(name)) return failure("Enter a name of 1–100 characters.");
      if (!validEmail(email))
        return failure("Enter a valid email address of up to 254 characters.");
      if (!validRole(details.role))
        return failure("Choose Adult learner or Teacher.");
      const issue = enrollmentIssue(
        snapshot,
        details.classId,
        email,
        details.role,
      );
      if (issue) return failure(issue);
      const id = nextId("invitation");
      return commit(
        {
          ...snapshot,
          invitations: [
            ...snapshot.invitations,
            {
              id,
              classId: details.classId,
              name,
              email,
              role: details.role,
              status: "pending",
            },
          ],
        },
        success("Invitation recorded. No email was sent.", id),
      );
    },
    changeInvitationStatus(id, status) {
      const snapshot = current.current;
      const invitation = snapshot.invitations.find((item) => item.id === id);
      if (!invitation) return failure("This invitation is unavailable.");
      const issue = classIssue(snapshot, invitation.classId);
      if (issue) return failure(issue);
      if (invitation.status === status)
        return success("Invitation already has this status.", id);
      const isReissue =
        status === "pending" &&
        (invitation.status === "expired" || invitation.status === "revoked");
      if (
        !isReissue &&
        !(
          invitation.status === "pending" &&
          (status === "accepted" ||
            status === "revoked" ||
            status === "expired")
        )
      )
        return failure(
          "This invitation status change is unavailable. Accepted invitations cannot be reissued.",
        );
      if (isReissue || status === "accepted") {
        const enrollment = enrollmentIssue(
          snapshot,
          invitation.classId,
          invitation.email,
          invitation.role,
          id,
        );
        if (enrollment) return failure(enrollment);
      }
      const invitations = snapshot.invitations.map((item) =>
        item.id === id ? { ...item, status } : item,
      );
      if (status !== "accepted")
        return commit(
          { ...snapshot, invitations },
          success(
            isReissue
              ? "Invitation reissued. No email was sent."
              : status === "revoked"
                ? "Invitation revoked."
                : "Invitation marked expired.",
            id,
          ),
        );
      const existingPerson = snapshot.people.find(
        (item) => key(item.email) === key(invitation.email),
      );
      const personId = existingPerson?.id ?? nextId("person");
      const people = existingPerson
        ? snapshot.people
        : [
            ...snapshot.people,
            {
              id: personId,
              name: invitation.name,
              email: invitation.email,
              role: invitation.role,
              status: "active" as const,
            },
          ];
      const removed = snapshot.memberships.find(
        (item) =>
          item.personId === personId &&
          item.classId === invitation.classId &&
          item.status === "removed",
      );
      const membership = {
        id: removed?.id ?? nextId("membership"),
        personId,
        classId: invitation.classId,
        role: invitation.role,
        status: "active" as const,
      };
      const memberships = removed
        ? snapshot.memberships.map((item) =>
            item.id === removed.id ? membership : item,
          )
        : [...snapshot.memberships, membership];
      return commit(
        { ...snapshot, invitations, people, memberships },
        success(
          "Invitation accepted in the simulation. Person and membership records are ready.",
          id,
        ),
      );
    },
  };
}
