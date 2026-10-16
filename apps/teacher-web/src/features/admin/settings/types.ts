import type { DirectoryResult, DirectoryRole } from "../directory/types";

export interface WorkspaceDefaults {
  newClassPurpose: string;
  invitationRole: DirectoryRole;
  invitationClassId: string;
  helpTitle: string;
  helpMessage: string;
}
export interface WorkspacePreferences {
  tableDensity: "comfortable" | "compact";
}
export interface AdminSettingsModel {
  defaults: WorkspaceDefaults;
  preferences: WorkspacePreferences;
  saveDefaults: (value: WorkspaceDefaults) => DirectoryResult;
  savePreferences: (value: WorkspacePreferences) => DirectoryResult;
}
export function createWorkspaceDefaults(): WorkspaceDefaults {
  return {
    newClassPurpose: "",
    invitationRole: "learner",
    invitationClassId: "",
    helpTitle: "A clear place to start.",
    helpMessage:
      "Start in Organizations to create a class and review its roster. Use Invitations to prepare a class-scoped invitation. People brings the same directory records together. Access & roles lets you review responsibilities and their proposed boundaries.",
  };
}
