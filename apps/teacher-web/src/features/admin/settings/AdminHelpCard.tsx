import { ArrowRight, HelpCircle, Settings } from "lucide-react";

export function AdminHelpCard({
  title,
  message,
  onOpenDirectory,
  onOpenSettings,
}: {
  title: string;
  message: string;
  onOpenDirectory: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <section className="panel admin-help-card">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Workspace guide</p>
          <h2>{title}</h2>
        </div>
        <HelpCircle size={25} aria-hidden="true" />
      </div>
      <p className="admin-help-message">{message}</p>
      <div className="admin-help-actions">
        <button
          type="button"
          className="button button-outline"
          onClick={onOpenDirectory}
        >
          Open organizations
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="button button-outline"
          onClick={onOpenSettings}
        >
          <Settings size={16} aria-hidden="true" />
          Edit guide
        </button>
      </div>
    </section>
  );
}
