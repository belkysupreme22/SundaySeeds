# 0007 — Administrator settings with concrete consumers

Date: 16 October 2026

Status: prototype composition; no production configuration service.

AdminDashboard owns session-only workspace defaults and a separate view preference. The Settings forms explicitly save or cancel their drafts; Restore defaults loads a draft rather than applying immediately. New admin class forms capture the saved purpose when opened. New invitation forms capture the saved participation and an available default class. Open form buffers and existing records are never synchronized from later settings changes.

Saved default scope references remain inspectable when a class or parent organization is archived. Settings requires correction to a valid class or no default before saving; newly opened invitations fall back to an unselected scope. Existing directory model validation still enforces class/organization availability and participation compatibility.

The support note has a real consumer on Administration Overview. Table density is separate from workspace defaults and changes only table spacing within AdminDashboard. No arbitrary toggles, account settings, email delivery or permission policy controls are simulated as connected. Teacher and mobile state remain independent. Refresh clears settings alongside the rest of the web prototype.

Reference-12 informs grouped light-gray settings surfaces and pastel accents. Source formatting/whitespace checks alone do not establish runtime, visual, build or typecheck success; those checks remain with the owner.