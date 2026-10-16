import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { History } from "lucide-react";
import { AuditLog } from "./AuditLog";
import { OperationsPanel } from "./OperationsPanel";
import "./audit.css";

export function AuditWorkspace() {
  const [tab, setTab] = useState("events");
  return (
    <section className="audit-stack">
      <header className="audit-heading">
        <div>
          <p className="eyebrow">Audit & operations</p>
          <h2>A clear record. An honest status.</h2>
          <p className="muted">
            Review event presentation and recovery states without implying a
            connected audit or monitoring service.
          </p>
        </div>
        <span className="admin-icon-tile tone-lavender">
          <History size={24} aria-hidden="true" />
        </span>
      </header>
      <Tabs.Root value={tab} onValueChange={setTab} className="section-tabs">
        <Tabs.List
          className="tab-list"
          aria-label="Audit and operations sections"
        >
          <Tabs.Trigger className="tab-trigger" value="events">
            Audit events
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="operations">
            Service availability
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content
          value="events"
          forceMount
          hidden={tab !== "events"}
          className="audit-tab-content"
        >
          <AuditLog />
        </Tabs.Content>
        <Tabs.Content
          value="operations"
          forceMount
          hidden={tab !== "operations"}
          className="audit-tab-content"
        >
          <OperationsPanel />
        </Tabs.Content>
      </Tabs.Root>
    </section>
  );
}
