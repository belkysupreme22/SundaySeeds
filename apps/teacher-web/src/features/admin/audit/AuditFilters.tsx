import { InputField } from "../../../shared/ui/InputField";
import {
  auditExampleEvents,
  categoryLabels,
  outcomeLabels,
  type AuditFiltersValue,
} from "./auditExamples";

export function AuditFilters({
  value,
  onChange,
}: {
  value: AuditFiltersValue;
  onChange: (value: AuditFiltersValue) => void;
}) {
  function update(key: keyof AuditFiltersValue, next: string) {
    onChange({ ...value, [key]: next });
  }
  const organizations = [
    ...new Set(auditExampleEvents.map((event) => event.organization)),
  ];
  return (
    <section
      className="audit-surface audit-filters"
      aria-label="Filter fictional audit events"
    >
      <label className="field">
        Search events
        <InputField
          type="search"
          value={value.query}
          onChange={(event) => update("query", event.target.value)}
          placeholder="Actor, action, target or reference"
        />
      </label>
      <label className="field">
        Organization scope
        <select
          className="input"
          value={value.organization}
          onChange={(event) => update("organization", event.target.value)}
        >
          <option value="">All example scopes</option>
          {organizations.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Action group
        <select
          className="input"
          value={value.category}
          onChange={(event) => update("category", event.target.value)}
        >
          <option value="">All action groups</option>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        Outcome
        <select
          className="input"
          value={value.outcome}
          onChange={(event) => update("outcome", event.target.value)}
        >
          <option value="">All outcomes</option>
          {Object.entries(outcomeLabels).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="field">
        From example date (UTC)
        <InputField
          type="date"
          value={value.from}
          onChange={(event) => update("from", event.target.value)}
        />
      </label>
      <label className="field">
        To example date (UTC)
        <InputField
          type="date"
          value={value.to}
          onChange={(event) => update("to", event.target.value)}
        />
      </label>
    </section>
  );
}
