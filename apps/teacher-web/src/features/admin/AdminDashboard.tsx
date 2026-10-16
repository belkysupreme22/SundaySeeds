import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight, BookOpen, ShieldCheck, Sprout, Users } from "lucide-react";
import { ChartPreview } from "../../shared/ChartPreview";
import { AccessWorkspace } from "./access/AccessWorkspace";
import "./admin.css";
import { useAdminDirectory } from "./directory/useAdminDirectory";
import { PeoplePanel } from "./directory/PeoplePanel";
import { OrganizationsPanel } from "./directory/OrganizationsPanel";
import { InvitationsPanel } from "./directory/InvitationsPanel";
import "./directory/directory.css";
import { useAdminSettings } from "./settings/useAdminSettings";
import { SystemSettingsPanel } from "./settings/SystemSettingsPanel";
import { AdminHelpCard } from "./settings/AdminHelpCard";
import { AuditWorkspace } from "./audit/AuditWorkspace";

function AdministrationStructure() {
  return (
    <div className="admin-structure">
      <div className="admin-structure-row">
        <span className="admin-icon-tile tone-lavender">
          <ShieldCheck size={21} aria-hidden="true" />
        </span>
        <div>
          <h3>Super-admin</h3>
          <p className="muted">Oversees the whole SundaySeeds system.</p>
        </div>
        <span className="badge">Confirmed role</span>
      </div>
      <div className="admin-structure-row">
        <span className="admin-icon-tile tone-mint">
          <Users size={21} aria-hidden="true" />
        </span>
        <div>
          <h3>Sub-admin</h3>
          <p className="muted">
            Delegated responsibilities with boundaries still to be agreed.
          </p>
        </div>
        <span className="badge">Scope pending</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("overview");
  const directory = useAdminDirectory();
  const settings = useAdminSettings(directory);

  return (
    <div
      className="page-stack admin-dashboard"
      data-table-density={settings.preferences.tableDensity}
    >
      <header className="page-heading">
        <div>
          <p className="eyebrow">SundaySeeds administration</p>
          <h1>A little clarity. Room to grow.</h1>
          <p className="muted">
            People, learning and access across the system.
          </p>
        </div>
        <span className="badge admin-workspace-badge">
          <ShieldCheck size={16} aria-hidden="true" />
          Super-admin workspace
        </span>
      </header>
      <Tabs.Root className="section-tabs" value={tab} onValueChange={setTab}>
        <Tabs.List className="tab-list" aria-label="Admin sections">
          <Tabs.Trigger className="tab-trigger" value="overview">
            Overview
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="people">
            People
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="organizations">
            Organizations
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="invitations">
            Invitations
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="access">
            Access &amp; roles
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="settings">
            Settings
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="audit">
            Audit &amp; operations
          </Tabs.Trigger>
        </Tabs.List>
        {["people", "organizations", "invitations"].includes(tab) && (
          <div className="admin-dir-workspace-note">
            <p>
              <strong>Directory simulation.</strong> People, organizations and
              invitations share example records for this session. No accounts,
              messages or access grants are created.
            </p>
            <button
              className="button button-outline"
              type="button"
              onClick={directory.loadExamples}
            >
              Explore example workspace
            </button>
          </div>
        )}
        <Tabs.Content value="overview" className="page-stack admin-tab-content">
          <section className="panel tone-lavender admin-welcome">
            <div>
              <p className="eyebrow">The bigger picture</p>
              <h2>Make room for learning.</h2>
              <p>
                A shared home for supporting SundaySeeds as the adult learning
                community grows.
              </p>
            </div>
            <span className="admin-sprout">
              <Sprout size={46} strokeWidth={1.4} aria-hidden="true" />
            </span>
          </section>
          <div className="three-col" aria-label="System data availability">
            <article className="stat-tile tone-mint">
              <div className="admin-stat-label">
                <h3>Adult learners</h3>
                <Users size={20} aria-hidden="true" />
              </div>
              <p className="admin-stat-value" aria-label="Unavailable">
                —
              </p>
              <p className="muted admin-help">Awaiting connected data</p>
            </article>
            <article className="stat-tile tone-yellow">
              <div className="admin-stat-label">
                <h3>Published lessons</h3>
                <BookOpen size={20} aria-hidden="true" />
              </div>
              <p className="admin-stat-value" aria-label="Unavailable">
                —
              </p>
              <p className="muted admin-help">Awaiting connected data</p>
            </article>
            <article className="stat-tile tone-peach">
              <div className="admin-stat-label">
                <h3>Administrator assignments</h3>
                <ShieldCheck size={20} aria-hidden="true" />
              </div>
              <p className="admin-stat-value" aria-label="Unavailable">
                —
              </p>
              <p className="muted admin-help">Awaiting connected data</p>
            </article>
          </div>
          <div className="two-col">
            <section className="panel">
              <div className="panel-heading">
                <h2>Administration structure</h2>
              </div>
              <AdministrationStructure />
              <div className="admin-panel-action">
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setTab("access")}
                >
                  Explore access <ArrowRight size={17} aria-hidden="true" />
                </button>
              </div>
            </section>
            <section className="panel">
              <div className="panel-heading">
                <h2>Recent activity</h2>
              </div>
              <div className="empty-state">
                <span className="admin-icon-tile tone-yellow">
                  <BookOpen size={23} aria-hidden="true" />
                </span>
                <h3>No connected activity records</h3>
                <p className="muted">
                  Verified actions will appear here once activity records are
                  available.
                </p>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setTab("audit")}
                >
                  Review audit workspace
                </button>
              </div>
            </section>
          </div>
          <AdminHelpCard
            title={settings.defaults.helpTitle}
            message={settings.defaults.helpMessage}
            onOpenDirectory={() => setTab("organizations")}
            onOpenSettings={() => setTab("settings")}
          />
          <ChartPreview kind="activity" />
        </Tabs.Content>
        <Tabs.Content
          value="people"
          forceMount
          hidden={tab !== "people"}
          className="page-stack admin-tab-content"
        >
          <PeoplePanel model={directory} />
        </Tabs.Content>
        <Tabs.Content
          value="organizations"
          forceMount
          hidden={tab !== "organizations"}
          className="page-stack admin-tab-content"
        >
          <OrganizationsPanel
            model={directory}
            newClassPurpose={settings.defaults.newClassPurpose}
          />
        </Tabs.Content>
        <Tabs.Content
          value="invitations"
          forceMount
          hidden={tab !== "invitations"}
          className="page-stack admin-tab-content"
        >
          <InvitationsPanel
            model={directory}
            defaultRole={settings.defaults.invitationRole}
            defaultClassId={settings.defaults.invitationClassId}
            onOpenOrganizations={() => setTab("organizations")}
          />
        </Tabs.Content>
        <Tabs.Content
          value="access"
          forceMount
          hidden={tab !== "access"}
          className="page-stack admin-tab-content"
        >
          <AccessWorkspace
            directory={directory}
            onOpenDirectory={() => setTab("organizations")}
          />
        </Tabs.Content>
        <Tabs.Content
          value="settings"
          forceMount
          hidden={tab !== "settings"}
          className="page-stack admin-tab-content"
        >
          <SystemSettingsPanel model={settings} directory={directory} />
        </Tabs.Content>
        <Tabs.Content
          value="audit"
          forceMount
          hidden={tab !== "audit"}
          className="page-stack admin-tab-content"
        >
          <AuditWorkspace />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
