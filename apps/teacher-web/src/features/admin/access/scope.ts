import type { DirectoryState } from "../directory/types";
import type { AccessScope } from "./types";

/** Resolve proposals against the directory; this never establishes live access. */
export function getScopeContext(
  directory: DirectoryState,
  scope: AccessScope,
): { label: string; available: boolean; reason: string } {
  if (scope?.kind === "organization") {
    const organization = directory.organizations.find(
      (item) => item.id === scope.organizationId,
    );
    if (!organization)
      return {
        label: "Unavailable organization",
        available: false,
        reason: "Choose an organization from the directory.",
      };
    return {
      label: organization.name,
      available: !organization.archived,
      reason: organization.archived
        ? "Restore this organization before using its scope in a proposal."
        : "",
    };
  }

  if (scope?.kind === "class") {
    const group = directory.classes.find((item) => item.id === scope.classId);
    if (!group)
      return {
        label: "Unavailable class",
        available: false,
        reason: "Choose a class from the directory.",
      };
    const organization = directory.organizations.find(
      (item) => item.id === group.organizationId,
    );
    const label = `${organization?.name ?? "Unavailable organization"} / ${group.name}`;
    if (!organization)
      return {
        label,
        available: false,
        reason: "The organization for this class is unavailable.",
      };
    if (organization.archived)
      return {
        label,
        available: false,
        reason:
          "Restore the organization before using this class scope in a proposal.",
      };
    return {
      label,
      available: !group.archived,
      reason: group.archived
        ? "Restore this class before using its scope in a proposal."
        : "",
    };
  }

  return {
    label: "No scope selected",
    available: false,
    reason: "Choose an explicit organization or class scope.",
  };
}
