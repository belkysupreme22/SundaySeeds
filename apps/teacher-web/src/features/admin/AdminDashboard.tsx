import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowRight, BookOpen, ShieldCheck, Sprout, Users } from "lucide-react";
import { ChartPreview } from "../../shared/ChartPreview";
import RoleProposalDialog from "./RoleProposalDialog";
import "./admin.css";

const peopleFilters = [
  "Everyone",
  "Adult learners",
  "Teachers",
  "Administrators",
] as const;
type PeopleFilter = (typeof peopleFilters)[number];

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
  const [peopleFilter, setPeopleFilter] = useState<PeopleFilter>("Everyone");

  return (
    <div className="page-stack admin-dashboard">
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
          <Tabs.Trigger className="tab-trigger" value="access">
            Access &amp; roles
          </Tabs.Trigger>
        </Tabs.List>
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
                <h3>No activity to display yet</h3>
                <p className="muted">
                  Verified actions will appear here once activity records are
                  available.
                </p>
                <button
                  type="button"
                  className="button button-outline"
                  onClick={() => setTab("people")}
                >
                  Explore the people view
                </button>
              </div>
            </section>
          </div>
          <ChartPreview kind="activity" />
        </Tabs.Content>
        <Tabs.Content value="people" className="page-stack admin-tab-content">
          <div className="panel-heading">
            <div>
              <h2>People</h2>
              <p className="muted">The people who learn, teach and support.</p>
            </div>
          </div>
          <div
            className="admin-people-filters"
            role="group"
            aria-label="Filter people by role"
          >
            {peopleFilters.map((filter) => (
              <button
                key={filter}
                type="button"
                className="button button-outline"
                aria-pressed={peopleFilter === filter}
                onClick={() => setPeopleFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
          <section className="panel admin-directory">
            <div className="table-wrap">
              <table className="data-table">
                <caption>{peopleFilter} · Directory preview</caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Role</th>
                    <th scope="col">Assigned scope</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={4}>
                      <div className="empty-state">
                        <span className="admin-icon-tile tone-mint">
                          <Users size={25} aria-hidden="true" />
                        </span>
                        <h3 aria-live="polite">
                          {peopleFilter === "Everyone"
                            ? "No directory data connected"
                            : `No ${peopleFilter.toLowerCase()} data connected`}
                        </h3>
                        <p className="muted">
                          People and confirmed roles will appear here. No
                          accounts or assignments have been loaded.
                        </p>
                        <button
                          type="button"
                          className="button button-outline"
                          onClick={() => setTab("access")}
                        >
                          Review the access model{" "}
                          <ArrowRight size={17} aria-hidden="true" />
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
          <p className="admin-note tone-yellow">
            Invitations, teacher permissions and account management are still to
            be defined before this directory becomes operational.
          </p>
        </Tabs.Content>
        <Tabs.Content value="access" className="page-stack admin-tab-content">
          <div className="panel-heading">
            <div>
              <h2>Access &amp; roles</h2>
              <p className="muted">
                Give each responsibility a clear boundary.
              </p>
            </div>
          </div>
          <div className="two-col">
            <article className="panel tone-lavender admin-role-card">
              <ShieldCheck size={25} aria-hidden="true" />
              <h3>Super-admin</h3>
              <p>
                System-wide oversight. Sign-in, assignment and sensitive-action
                rules still need implementation.
              </p>
              <span className="badge">Role confirmed · Unconfigured</span>
            </article>
            <article className="panel admin-role-card">
              <Users size={25} aria-hidden="true" />
              <h3>Sub-admin</h3>
              <p>
                A delegated role with an explicitly agreed scope. No inherited
                global access is assumed.
              </p>
              <span className="badge">Structure proposed · Unconfigured</span>
            </article>
          </div>
          <section className="panel admin-scope-callout">
            <span className="admin-icon-tile tone-mint">
              <Sprout size={24} aria-hidden="true" />
            </span>
            <div>
              <h2>A structure that can grow</h2>
              <p className="muted">
                Sketch a sub-admin role before deciding who can do what. Scope
                and responsibilities remain proposals.
              </p>
            </div>
            <RoleProposalDialog />
          </section>
          <p className="admin-note tone-yellow">
            No administrator assignments are configured. Future permissions must
            be enforced by the backend, including every delegated scope.
          </p>
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
