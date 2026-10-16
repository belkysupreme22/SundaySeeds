import { useState } from "react";
import type { DirectoryState } from "../directory/types";
import {
  createWorkspaceDefaults,
  type AdminSettingsModel,
  type WorkspaceDefaults,
  type WorkspacePreferences,
} from "./types";

export function useAdminSettings(
  directory: DirectoryState,
): AdminSettingsModel {
  const [defaults, setDefaults] = useState<WorkspaceDefaults>(
    createWorkspaceDefaults,
  );
  const [preferences, setPreferences] = useState<WorkspacePreferences>({
    tableDensity: "comfortable",
  });
  return {
    defaults,
    preferences,
    saveDefaults(value) {
      const next = {
        ...value,
        newClassPurpose: value.newClassPurpose.trim(),
        helpTitle: value.helpTitle.trim(),
        helpMessage: value.helpMessage.trim(),
      };
      if (next.newClassPurpose.length > 1000)
        return {
          ok: false,
          message: "Keep the class purpose within 1,000 characters.",
        };
      if (!next.helpTitle || next.helpTitle.length > 80)
        return { ok: false, message: "Use a help title of 1–80 characters." };
      if (!next.helpMessage || next.helpMessage.length > 1200)
        return { ok: false, message: "Use a help note of 1–1,200 characters." };
      if (
        next.invitationRole !== "learner" &&
        next.invitationRole !== "teacher"
      )
        return {
          ok: false,
          message: "Choose adult learner or teacher participation.",
        };
      if (next.invitationClassId) {
        const group = directory.classes.find(
          (item) => item.id === next.invitationClassId,
        );
        const organization = directory.organizations.find(
          (item) => item.id === group?.organizationId,
        );
        if (!group || group.archived || !organization || organization.archived)
          return {
            ok: false,
            message:
              "Choose an active default class in an active organization, or leave the default class unselected.",
          };
      }
      setDefaults(next);
      return {
        ok: true,
        message:
          "Workspace defaults saved. New forms use these values; open drafts are unchanged.",
      };
    },
    savePreferences(value) {
      if (
        value.tableDensity !== "comfortable" &&
        value.tableDensity !== "compact"
      )
        return {
          ok: false,
          message: "Choose comfortable or compact table spacing.",
        };
      setPreferences({ tableDensity: value.tableDensity });
      return { ok: true, message: "Table spacing updated for this workspace." };
    },
  };
}
