import { CloudOff, Settings2 } from "lucide-react";
import type { DirectoryState } from "../directory/types";
import type { AdminSettingsModel } from "./types";
import { WorkspaceDefaultsForm } from "./WorkspaceDefaultsForm";
import { ViewPreferencesForm } from "./ViewPreferencesForm";
import "./settings.css";

export function SystemSettingsPanel({
  model,
  directory,
}: {
  model: AdminSettingsModel;
  directory: DirectoryState;
}) {
  return (
    <div className="ssettings-panel page-stack">
      <header className="ssettings-intro">
        <span className="ssettings-intro-icon tone-lavender">
          <Settings2 size={26} aria-hidden="true" />
        </span>
        <div>
          <p className="eyebrow">System settings</p>
          <h2>The details that make work flow.</h2>
          <p className="muted">
            Useful defaults for administration, with a separate choice for your
            table view.
          </p>
        </div>
      </header>
      <WorkspaceDefaultsForm model={model} directory={directory} />
      <ViewPreferencesForm model={model} />
      <section
        className="ssettings-services ssettings-card"
        aria-labelledby="ssettings-services-heading"
      >
        <div className="ssettings-card-heading">
          <span className="ssettings-icon tone-mint">
            <CloudOff size={20} aria-hidden="true" />
          </span>
          <div>
            <h3 id="ssettings-services-heading">Connected services</h3>
            <p className="muted">
              These services are not connected in this workspace.
            </p>
          </div>
        </div>
        <dl className="ssettings-services-list">
          <div>
            <dt>Accounts &amp; sign-in</dt>
            <dd>Authentication and account recovery unavailable</dd>
          </div>
          <div>
            <dt>Email delivery</dt>
            <dd>Invitation emails and delivery status unavailable</dd>
          </div>
          <div>
            <dt>Media storage</dt>
            <dd>Shared uploads and file storage unavailable</dd>
          </div>
          <div>
            <dt>Access policy</dt>
            <dd>Permission enforcement and live grants unavailable</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
