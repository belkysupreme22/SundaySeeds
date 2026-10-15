export type DirectoryRole = "learner" | "teacher";
export type InvitationStatus = "pending" | "accepted" | "expired" | "revoked";
export interface DirectoryPerson {
  id: string;
  name: string;
  email: string;
  role: DirectoryRole;
  status: "active" | "inactive";
}
export interface DirectoryOrganization {
  id: string;
  name: string;
  description: string;
  archived: boolean;
}
export interface DirectoryClass {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  archived: boolean;
}
export interface DirectoryMembership {
  id: string;
  personId: string;
  classId: string;
  role: DirectoryRole;
  status: "active" | "removed";
}
export interface DirectoryInvitation {
  id: string;
  classId: string;
  name: string;
  email: string;
  role: DirectoryRole;
  status: InvitationStatus;
}
export interface DirectoryResult {
  ok: boolean;
  message: string;
  id?: string;
}
export type PersonDetails = Pick<DirectoryPerson, "name" | "email" | "role">;
export type OrganizationDetails = Pick<
  DirectoryOrganization,
  "name" | "description"
>;
export type ClassDetails = Pick<
  DirectoryClass,
  "organizationId" | "name" | "description"
>;
export type InvitationDetails = Pick<
  DirectoryInvitation,
  "classId" | "name" | "email" | "role"
>;
export interface DirectoryState {
  people: DirectoryPerson[];
  organizations: DirectoryOrganization[];
  classes: DirectoryClass[];
  memberships: DirectoryMembership[];
  invitations: DirectoryInvitation[];
}
export interface DirectoryModel extends DirectoryState {
  loadExamples: () => void;
  savePerson: (details: PersonDetails, id?: string) => DirectoryResult;
  setPersonStatus: (
    id: string,
    status: DirectoryPerson["status"],
  ) => DirectoryResult;
  saveOrganization: (
    details: OrganizationDetails,
    id?: string,
  ) => DirectoryResult;
  archiveOrganization: (id: string, archived: boolean) => DirectoryResult;
  saveClass: (details: ClassDetails, id?: string) => DirectoryResult;
  archiveClass: (id: string, archived: boolean) => DirectoryResult;
  assignMembership: (
    personId: string,
    classId: string,
    role: DirectoryRole,
  ) => DirectoryResult;
  setMembershipStatus: (
    id: string,
    status: DirectoryMembership["status"],
  ) => DirectoryResult;
  createInvitation: (details: InvitationDetails) => DirectoryResult;
  changeInvitationStatus: (
    id: string,
    status: InvitationStatus,
  ) => DirectoryResult;
}
export const directoryRoleLabels: Record<DirectoryRole, string> = {
  learner: "Adult learner",
  teacher: "Teacher",
};
