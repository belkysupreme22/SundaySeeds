import { useRef, useState } from "react";
import type { DirectoryResult, DirectoryState } from "../directory/types";
import { getScopeContext } from "./scope";
import { capabilityLabels } from "./types";
import type {
  AccessAssignment,
  AccessCapability,
  AccessModel,
  AccessRole,
  AccessScope,
} from "./types";

interface ProposalState {
  roles: AccessRole[];
  assignments: AccessAssignment[];
}

const failure = (message: string): DirectoryResult => ({ ok: false, message });
const success = (message: string, id: string): DirectoryResult => ({
  ok: true,
  message,
  id,
});
const copyScope = (scope: AccessScope): AccessScope =>
  scope.kind === "organization"
    ? { kind: "organization", organizationId: scope.organizationId }
    : { kind: "class", classId: scope.classId };
const validCapability = (value: AccessCapability) =>
  Object.prototype.hasOwnProperty.call(capabilityLabels, value);

/** Session-only proposals. No directory classification, membership or grant changes. */
export function useAccessProposals(directory: DirectoryState): AccessModel {
  const [state, setState] = useState<ProposalState>({
    roles: [],
    assignments: [],
  });
  const current = useRef(state);
  const currentDirectory = useRef(directory);
  currentDirectory.current = directory;
  const sequence = useRef(0);
  const nextId = (kind: string) => `access-${kind}-${++sequence.current}`;
  const commit = (next: ProposalState, result: DirectoryResult) => {
    current.current = next;
    setState(next);
    return result;
  };

  return {
    ...state,
    saveRole(details, id) {
      const snapshot = current.current;
      const existing = snapshot.roles.find((item) => item.id === id);
      if (id !== undefined && !existing)
        return failure("This role proposal is unavailable.");
      const name = details.name.trim();
      const purpose = details.purpose.trim();
      if (!name || name.length > 60)
        return failure("Enter a role name of 1–60 characters.");
      if (purpose.length > 500)
        return failure("Keep the role purpose within 500 characters.");
      if (
        !Array.isArray(details.capabilities) ||
        !details.capabilities.length ||
        details.capabilities.some((item) => !validCapability(item))
      )
        return failure(
          "Choose at least one capability from the available list.",
        );
      const context = getScopeContext(currentDirectory.current, details.scope);
      if (!context.available) return failure(context.reason);
      const roleId = existing?.id ?? nextId("role");
      const role: AccessRole = {
        id: roleId,
        name,
        purpose,
        scope: copyScope(details.scope),
        capabilities: [...new Set(details.capabilities)],
        revision: (existing?.revision ?? 0) + 1,
      };
      return commit(
        {
          ...snapshot,
          roles: existing
            ? snapshot.roles.map((item) => (item.id === roleId ? role : item))
            : [...snapshot.roles, role],
        },
        success(
          existing
            ? "Role proposal updated. Existing assignment snapshots are unchanged."
            : "Role proposal saved. No live role or access was created.",
          roleId,
        ),
      );
    },
    recordAssignment(roleId, personId, reviewedRevision) {
      const snapshot = current.current;
      const role = snapshot.roles.find((item) => item.id === roleId);
      if (!role) return failure("This role proposal is unavailable.");
      const person = currentDirectory.current.people.find(
        (item) => item.id === personId,
      );
      if (!person) return failure("Choose a person from the directory.");
      if (person.status !== "active")
        return failure(
          "Reactivate this person before recording an assignment proposal.",
        );
      const context = getScopeContext(currentDirectory.current, role.scope);
      if (!context.available) return failure(context.reason);
      if (reviewedRevision !== role.revision)
        return failure(
          "This role proposal changed. Review its current revision before recording the assignment.",
        );
      if (
        snapshot.assignments.some(
          (item) =>
            item.roleId === roleId &&
            item.personId === personId &&
            item.status === "simulated",
        )
      )
        return failure(
          "A simulated assignment already exists for this person and role proposal. Revoke it before recording a fresh review.",
        );
      const id = nextId("assignment");
      const assignment: AccessAssignment = {
        id,
        personId,
        roleId,
        status: "simulated",
        snapshot: {
          roleName: role.name,
          scope: copyScope(role.scope),
          scopeLabel: context.label,
          capabilities: [...role.capabilities],
          revision: role.revision,
        },
      };
      return commit(
        { ...snapshot, assignments: [...snapshot.assignments, assignment] },
        success(
          "Assignment proposal recorded for review. No access was granted.",
          id,
        ),
      );
    },
    revokeAssignment(id) {
      const snapshot = current.current;
      const assignment = snapshot.assignments.find((item) => item.id === id);
      if (!assignment)
        return failure("This assignment proposal is unavailable.");
      if (assignment.status !== "simulated")
        return failure(
          "This assignment proposal is already revoked. A new assignment requires a fresh review.",
        );
      return commit(
        {
          ...snapshot,
          assignments: snapshot.assignments.map((item) =>
            item.id === id ? { ...item, status: "revoked" } : item,
          ),
        },
        success(
          "Assignment proposal revoked. Its review snapshot is retained; no live access was changed.",
          id,
        ),
      );
    },
  };
}
