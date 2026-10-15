import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ShieldCheck } from "lucide-react";
import type { DirectoryState } from "../directory/types";
import { useAccessProposals } from "./useAccessProposals";
import { RolesPanel } from "./RolesPanel";
import { AssignmentsPanel } from "./AssignmentsPanel";
import { SafeguardWalkthrough } from "./SafeguardWalkthrough";
import "./access.css";

export function AccessWorkspace({
  directory,
  onOpenDirectory,
}: {
  directory: DirectoryState;
  onOpenDirectory: () => void;
}) {
  const model = useAccessProposals(directory);
  const [tab, setTab] = useState("roles");
  return (
    <section className="access-stack">
      <header className="access-heading">
        <div>
          <p className="eyebrow">Access planning</p>
          <h2>A clear responsibility. A deliberate boundary.</h2>
          <p className="muted">
            Plan delegated roles, review assignment snapshots and explore system
            safeguards.
          </p>
        </div>
        <span className="admin-icon-tile tone-lavender">
          <ShieldCheck size={23} aria-hidden="true" />
        </span>
      </header>
      <p className="access-notice">
        <strong>Proposal workspace.</strong> No permissions, administrator
        accounts or authority to delegate are configured. Organization/class
        choices refer to your directory simulation; these proposals reset on
        refresh.
      </p>
      <Tabs.Root value={tab} onValueChange={setTab} className="section-tabs">
        <Tabs.List className="tab-list" aria-label="Access planning tools">
          <Tabs.Trigger className="tab-trigger" value="roles">
            Role proposals
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="assignments">
            Assignment simulations
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="safeguards">
            System safeguards
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          value="roles"
          forceMount
          hidden={tab !== "roles"}
          className="access-tab-content"
        >
          <RolesPanel
            model={model}
            directory={directory}
            onOpenDirectory={onOpenDirectory}
          />
        </Tabs.Content>
        <Tabs.Content
          value="assignments"
          forceMount
          hidden={tab !== "assignments"}
          className="access-tab-content"
        >
          <AssignmentsPanel
            model={model}
            directory={directory}
            onOpenRoles={() => setTab("roles")}
          />
        </Tabs.Content>
        <Tabs.Content
          value="safeguards"
          forceMount
          hidden={tab !== "safeguards"}
          className="access-tab-content"
        >
          <SafeguardWalkthrough />
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}
