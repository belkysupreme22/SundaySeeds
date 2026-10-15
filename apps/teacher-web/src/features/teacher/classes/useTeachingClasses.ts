import { useRef, useState } from "react";
import type { ClassDetails, ClassInvitation, TeachingClass } from "./types";

const normalizedEmail = (email: string) => email.trim().toLowerCase();

export function useTeachingClasses() {
  const [classes, setClasses] = useState<TeachingClass[]>([]);
  const nextId = useRef(1);

  function update(id: string, change: (item: TeachingClass) => TeachingClass) {
    setClasses((current) =>
      current.map((item) => (item.id === id ? change(item) : item)),
    );
  }

  function save(details: ClassDetails, id?: string) {
    const clean = {
      name: details.name.trim(),
      description: details.description.trim(),
      meeting: details.meeting.trim(),
    };
    if (id) {
      update(id, (item) => ({ ...item, ...clean }));
      return id;
    }
    const createdId = `teaching-class-${nextId.current++}`;
    setClasses((current) => [
      ...current,
      {
        ...clean,
        id: createdId,
        archived: false,
        courseIds: [],
        members: [],
        invitations: [],
      },
    ]);
    return createdId;
  }

  function exploreExample() {
    const id = "example-adult-class";
    setClasses((current) =>
      current.some((item) => item.id === id)
        ? current
        : [
            ...current,
            {
              id,
              example: true,
              name: "Everyday faith · adult study",
              description:
                "An example small-group class exploring how scripture shapes daily decisions, relationships and prayer.",
              meeting:
                "Example rhythm: Sunday discussion, with reading during the week",
              archived: false,
              courseIds: [],
              members: [
                {
                  id: "example-member-1",
                  name: "Alex Morgan",
                  email: "alex@example.test",
                  status: "active",
                },
                {
                  id: "example-member-2",
                  name: "Sam Taylor",
                  email: "sam@example.test",
                  status: "active",
                },
                {
                  id: "example-member-3",
                  name: "Robin Lee",
                  email: "robin@example.test",
                  status: "removed",
                },
              ],
              invitations: [
                {
                  id: "example-invite-1",
                  name: "Jordan Ellis",
                  email: "jordan@example.test",
                  status: "pending",
                },
                {
                  id: "example-invite-2",
                  name: "Casey Reed",
                  email: "casey@example.test",
                  status: "expired",
                },
              ],
            },
          ],
    );
    return id;
  }

  function archive(id: string, archived: boolean) {
    update(id, (item) => ({ ...item, archived }));
  }

  function assign(id: string, courseId: string) {
    update(id, (item) =>
      item.archived || item.courseIds.includes(courseId)
        ? item
        : { ...item, courseIds: [...item.courseIds, courseId] },
    );
  }

  function unassign(id: string, courseId: string) {
    update(id, (item) =>
      item.archived
        ? item
        : {
            ...item,
            courseIds: item.courseIds.filter((value) => value !== courseId),
          },
    );
  }

  function invite(id: string, name: string, email: string) {
    const invitation: ClassInvitation = {
      id: `class-invitation-${nextId.current++}`,
      name: name.trim(),
      email: normalizedEmail(email),
      status: "pending",
    };
    update(id, (item) => {
      const duplicate =
        item.members.some(
          (member) =>
            normalizedEmail(member.email) === invitation.email &&
            member.status === "active",
        ) ||
        item.invitations.some(
          (existing) =>
            normalizedEmail(existing.email) === invitation.email &&
            existing.status === "pending",
        );
      return item.archived || duplicate
        ? item
        : { ...item, invitations: [...item.invitations, invitation] };
    });
  }

  function invitationStatus(
    id: string,
    invitationId: string,
    status: ClassInvitation["status"],
  ) {
    update(id, (item) => {
      const invitation = item.invitations.find(
        (value) => value.id === invitationId,
      );
      if (item.archived || !invitation || invitation.status === "accepted")
        return item;
      if (status !== "pending" && invitation.status !== "pending") return item;
      if (
        status === "pending" &&
        (item.members.some(
          (member) =>
            normalizedEmail(member.email) === invitation.email &&
            member.status === "active",
        ) ||
          item.invitations.some(
            (value) =>
              value.id !== invitationId &&
              value.email === invitation.email &&
              value.status === "pending",
          ))
      )
        return item;
      let members = item.members;
      if (status === "accepted") {
        const existing = members.find(
          (member) => normalizedEmail(member.email) === invitation.email,
        );
        members = existing
          ? members.map((member) =>
              member.id === existing.id
                ? { ...member, status: "active" as const }
                : member,
            )
          : [
              ...members,
              {
                id: `member-${invitation.id}`,
                name: invitation.name,
                email: invitation.email,
                status: "active" as const,
              },
            ];
      }
      return {
        ...item,
        members,
        invitations: item.invitations.map((value) =>
          value.id === invitationId ? { ...value, status } : value,
        ),
      };
    });
  }

  function membership(
    id: string,
    memberId: string,
    status: "active" | "removed",
  ) {
    update(id, (item) =>
      item.archived
        ? item
        : {
            ...item,
            members: item.members.map((member) =>
              member.id === memberId ? { ...member, status } : member,
            ),
            invitations:
              status === "active"
                ? item.invitations.map((invitation) =>
                    invitation.status === "pending" &&
                    invitation.email ===
                      item.members.find((member) => member.id === memberId)
                        ?.email
                      ? { ...invitation, status: "revoked" }
                      : invitation,
                  )
                : item.invitations,
          },
    );
  }

  return {
    classes,
    save,
    exploreExample,
    archive,
    assign,
    unassign,
    invite,
    invitationStatus,
    membership,
  };
}

export type TeachingClassesModel = ReturnType<typeof useTeachingClasses>;
