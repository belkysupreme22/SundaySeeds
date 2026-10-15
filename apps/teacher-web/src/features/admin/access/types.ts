import type { DirectoryResult } from "../directory/types";

export const capabilityLabels = {
  "people.read": "View adult learner and teacher records",
  "enrollment.manage": "Manage class membership and invitations",
  "content.prepare": "Prepare course and lesson drafts",
  "reports.read": "View learning summaries",
} as const;
export type AccessCapability = keyof typeof capabilityLabels;
export type AccessScope =
  | { kind: "organization"; organizationId: string }
  | { kind: "class"; classId: string };
export interface AccessRole {
  id: string;
  name: string;
  purpose: string;
  scope: AccessScope;
  capabilities: AccessCapability[];
  revision: number;
}
export type RoleDetails = Pick<
  AccessRole,
  "name" | "purpose" | "scope" | "capabilities"
>;
export interface AssignmentSnapshot {
  roleName: string;
  scope: AccessScope;
  scopeLabel: string;
  capabilities: AccessCapability[];
  revision: number;
}
export interface AccessAssignment {
  id: string;
  personId: string;
  roleId: string;
  snapshot: AssignmentSnapshot;
  status: "simulated" | "revoked";
}
export interface AccessModel {
  roles: AccessRole[];
  assignments: AccessAssignment[];
  saveRole: (details: RoleDetails, id?: string) => DirectoryResult;
  recordAssignment: (
    roleId: string,
    personId: string,
    reviewedRevision: number,
  ) => DirectoryResult;
  revokeAssignment: (id: string) => DirectoryResult;
}
