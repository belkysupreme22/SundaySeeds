export type AuditCategory =
  "enrollment" | "access" | "content" | "configuration";
export type AuditOutcome = "succeeded" | "denied" | "failed";
export interface AuditExampleEvent {
  id: string;
  time: string;
  category: AuditCategory;
  action: string;
  actor: string;
  organization: string;
  className: string | null;
  target: string;
  targetId: string;
  outcome: AuditOutcome;
  summary: string;
  requestReference: string;
  changes: { field: string; before: string; after: string }[];
}
export const categoryLabels: Record<AuditCategory, string> = {
  enrollment: "Enrollment",
  access: "Access",
  content: "Content",
  configuration: "Configuration",
};
export const outcomeLabels: Record<AuditOutcome, string> = {
  succeeded: "Succeeded",
  denied: "Denied",
  failed: "Failed",
};
/** Fixed fictional records, never derived from directory actions or service responses. */
export const auditExampleEvents: AuditExampleEvent[] = [
  {
    id: "EX-AUD-006",
    time: "2026-10-02T11:20:00Z",
    category: "configuration",
    action: "Class default updated",
    actor: "Example administrator A",
    organization: "Garden Community · Example",
    className: null,
    target: "Organization defaults",
    targetId: "EX-DEFAULTS-GARDEN",
    outcome: "succeeded",
    summary:
      "The fictional service acknowledged a default-purpose change. Existing classes were not changed.",
    requestReference: "EX-REQ-006",
    changes: [
      {
        field: "Default class purpose",
        before: "Not set",
        after: "Explore faith through weekly reflection.",
      },
    ],
  },
  {
    id: "EX-AUD-005",
    time: "2026-10-02T10:10:00Z",
    category: "content",
    action: "Lesson publication requested",
    actor: "Example teacher A",
    organization: "Garden Community · Example",
    className: "Sunday adult group · Example",
    target: "A daily rhythm of prayer",
    targetId: "EX-LESSON-PRAYER",
    outcome: "failed",
    summary:
      "The fictional publication service rejected the request as temporarily unavailable. No new published version was acknowledged.",
    requestReference: "EX-REQ-005",
    changes: [],
  },
  {
    id: "EX-AUD-004",
    time: "2026-10-02T09:30:00Z",
    category: "access",
    action: "Assignment revocation requested",
    actor: "Example administrator B",
    organization: "Riverside Fellowship · Example",
    className: "Evening group · Example",
    target: "Example scoped assignment",
    targetId: "EX-ASSIGNMENT-04",
    outcome: "denied",
    summary:
      "The fictional actor's permitted scope did not include this class. The example assignment remained unchanged.",
    requestReference: "EX-REQ-004",
    changes: [],
  },
  {
    id: "EX-AUD-003",
    time: "2026-10-01T14:05:00Z",
    category: "enrollment",
    action: "Membership removed",
    actor: "Example administrator A",
    organization: "Garden Community · Example",
    className: "Sunday adult group · Example",
    target: "Example learner membership",
    targetId: "EX-MEMBERSHIP-03",
    outcome: "succeeded",
    summary:
      "The fictional service acknowledged removal from this class. This example does not describe a system-wide account change.",
    requestReference: "EX-REQ-003",
    changes: [
      { field: "Membership state", before: "Active", after: "Removed" },
    ],
  },
  {
    id: "EX-AUD-002",
    time: "2026-10-01T11:40:00Z",
    category: "enrollment",
    action: "Invitation prepared",
    actor: "Example teacher A",
    organization: "Garden Community · Example",
    className: "Sunday adult group · Example",
    target: "Example learner invitation",
    targetId: "EX-INVITATION-02",
    outcome: "succeeded",
    summary:
      "A fictional pending invitation was recorded. Recording an invitation does not establish delivery or acceptance.",
    requestReference: "EX-REQ-002",
    changes: [
      { field: "Invitation state", before: "No record", after: "Pending" },
    ],
  },
  {
    id: "EX-AUD-001",
    time: "2026-10-01T08:15:00Z",
    category: "access",
    action: "Scoped assignment recorded",
    actor: "Example super-admin",
    organization: "Riverside Fellowship · Example",
    className: null,
    target: "Example learning coordinator assignment",
    targetId: "EX-ASSIGNMENT-01",
    outcome: "succeeded",
    summary:
      "The fictional service recorded a bounded assignment after review. This fixture is unrelated to the Access proposal workspace.",
    requestReference: "EX-REQ-001",
    changes: [
      { field: "Assignment state", before: "No record", after: "Recorded" },
      {
        field: "Scope",
        before: "Not assigned",
        after: "Riverside Fellowship · Example",
      },
    ],
  },
];
export function exampleTime(value: string) {
  return value.replace("T", " ").replace("Z", " UTC");
}
export interface AuditFiltersValue {
  query: string;
  organization: string;
  category: string;
  outcome: string;
  from: string;
  to: string;
}
export const emptyAuditFilters: AuditFiltersValue = {
  query: "",
  organization: "",
  category: "",
  outcome: "",
  from: "",
  to: "",
};
