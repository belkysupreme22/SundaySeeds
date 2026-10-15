import type { DirectoryState } from "./types";

/** Fictional records are opt-in and deliberately independent of teacher simulations. */
export function directoryExamples(): DirectoryState {
  return {
    organizations: [
      {
        id: "example-org-garden",
        name: "Garden Community · Example",
        description:
          "A fictional organization for exploring adult learning administration.",
        archived: false,
      },
      {
        id: "example-org-riverside",
        name: "Riverside Fellowship · Example",
        description:
          "A second fictional organization, kept separate from Garden Community.",
        archived: false,
      },
    ],
    classes: [
      {
        id: "example-class-sunday",
        organizationId: "example-org-garden",
        name: "Sunday adult group",
        description: "An example group for adults exploring faith together.",
        archived: false,
      },
      {
        id: "example-class-evening",
        organizationId: "example-org-riverside",
        name: "Evening study group",
        description: "An example adult evening group.",
        archived: false,
      },
      {
        id: "example-class-archive",
        organizationId: "example-org-garden",
        name: "Previous study group",
        description: "An archived example; its records are retained.",
        archived: true,
      },
    ],
    people: [
      {
        id: "example-person-avery",
        name: "Avery Morgan · Example",
        email: "avery@example.test",
        role: "teacher",
        status: "active",
      },
      {
        id: "example-person-jordan",
        name: "Jordan Ellis · Example",
        email: "jordan@example.test",
        role: "learner",
        status: "active",
      },
      {
        id: "example-person-casey",
        name: "Casey Parker · Example",
        email: "casey@example.test",
        role: "learner",
        status: "inactive",
      },
    ],
    memberships: [
      {
        id: "example-membership-avery",
        personId: "example-person-avery",
        classId: "example-class-sunday",
        role: "teacher",
        status: "active",
      },
      {
        id: "example-membership-jordan",
        personId: "example-person-jordan",
        classId: "example-class-sunday",
        role: "learner",
        status: "active",
      },
      {
        id: "example-membership-casey",
        personId: "example-person-casey",
        classId: "example-class-sunday",
        role: "learner",
        status: "removed",
      },
    ],
    invitations: [
      {
        id: "example-invitation-robin",
        classId: "example-class-sunday",
        name: "Robin Lee · Example",
        email: "robin@example.test",
        role: "learner",
        status: "pending",
      },
      {
        id: "example-invitation-sam",
        classId: "example-class-evening",
        name: "Sam Taylor · Example",
        email: "sam@example.test",
        role: "teacher",
        status: "expired",
      },
    ],
  };
}

/** Preserve edits, and remap relationships when a matching record already exists. */
export function mergeDirectoryExamples(
  current: DirectoryState,
): DirectoryState {
  const examples = directoryExamples();
  const next: DirectoryState = {
    people: [...current.people],
    organizations: [...current.organizations],
    classes: [...current.classes],
    memberships: [...current.memberships],
    invitations: [...current.invitations],
  };
  const organizationIds = new Map<string, string>();
  const classIds = new Map<string, string>();
  const personIds = new Map<string, string>();
  const key = (value: string) => value.trim().toLowerCase();
  for (const organization of examples.organizations) {
    const existing = next.organizations.find(
      (item) =>
        item.id === organization.id ||
        key(item.name) === key(organization.name),
    );
    organizationIds.set(organization.id, existing?.id ?? organization.id);
    if (!existing) next.organizations.push(organization);
  }
  for (const group of examples.classes) {
    const organizationId = organizationIds.get(group.organizationId)!;
    const organization = next.organizations.find(
      (item) => item.id === organizationId,
    )!;
    const existing = next.classes.find(
      (item) =>
        item.id === group.id ||
        (item.organizationId === organizationId &&
          key(item.name) === key(group.name)),
    );
    if (!existing && organization.archived) continue;
    classIds.set(group.id, existing?.id ?? group.id);
    if (!existing) next.classes.push({ ...group, organizationId });
  }
  for (const person of examples.people) {
    const existing = next.people.find(
      (item) => item.id === person.id || key(item.email) === key(person.email),
    );
    personIds.set(person.id, existing?.id ?? person.id);
    if (!existing) next.people.push(person);
  }
  for (const membership of examples.memberships) {
    const personId = personIds.get(membership.personId)!;
    const classId = classIds.get(membership.classId);
    if (!classId) continue;
    const person = next.people.find((item) => item.id === personId)!;
    const group = next.classes.find((item) => item.id === classId)!;
    const organization = next.organizations.find(
      (item) => item.id === group.organizationId,
    )!;
    if (
      next.memberships.some(
        (item) =>
          item.id === membership.id ||
          (item.personId === personId && item.classId === classId),
      )
    )
      continue;
    if (
      person.role !== membership.role ||
      (membership.status === "active" &&
        (person.status !== "active" ||
          group.archived ||
          organization.archived ||
          next.invitations.some(
            (item) =>
              item.classId === classId &&
              key(item.email) === key(person.email) &&
              item.status === "pending",
          )))
    )
      continue;
    next.memberships.push({ ...membership, personId, classId });
  }
  for (const invitation of examples.invitations) {
    const classId = classIds.get(invitation.classId);
    if (!classId) continue;
    const group = next.classes.find((item) => item.id === classId)!;
    const organization = next.organizations.find(
      (item) => item.id === group.organizationId,
    )!;
    const person = next.people.find(
      (item) => key(item.email) === key(invitation.email),
    );
    if (
      next.invitations.some(
        (item) =>
          item.id === invitation.id ||
          (item.classId === classId &&
            key(item.email) === key(invitation.email) &&
            item.status === "pending"),
      )
    )
      continue;
    if (
      group.archived ||
      organization.archived ||
      (person &&
        (person.status !== "active" ||
          person.role !== invitation.role ||
          next.memberships.some(
            (item) =>
              item.personId === person.id &&
              item.classId === classId &&
              item.status === "active",
          )))
    )
      continue;
    next.invitations.push({ ...invitation, classId });
  }
  return next;
}
