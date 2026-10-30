import { useEffect, useRef, useState } from "react";
import type { ClassDetails, ClassInvitation, TeachingClass } from "./types";
import {
  fetchMyTeachingClasses,
  fetchClassPeople,
  saveTeachingClassApi,
  inviteClassMemberApi,
  revokeClassInvitationApi,
  updateClassMemberStatusApi,
} from "../data/staffDraftApi";

const normalizedEmail = (email: string) => email.trim().toLowerCase();

const isUuid = (id: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

export function useTeachingClasses() {
  const [classes, setClasses] = useState<TeachingClass[]>([]);
  const nextId = useRef(1);

  // Load real teaching classes and rosters from backend on mount
  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const summaries = await fetchMyTeachingClasses();
        if (!active || !summaries) return;

        // Fetch detailed people for each class in parallel
        const fullClasses: TeachingClass[] = await Promise.all(
          summaries.map(async (s) => {
            try {
              const people = await fetchClassPeople(s.id);
              return {
                id: s.id,
                name: s.name,
                description: s.description,
                meeting: s.meeting,
                archived: s.archived,
                courseIds: s.courseIds || [],
                members: people.members.map((m) => ({
                  id: m.id,
                  name: m.name,
                  email: m.email,
                  status: m.status,
                })),
                invitations: people.invitations.map((inv) => ({
                  id: inv.id,
                  name: inv.name,
                  email: inv.email,
                  status: inv.status,
                })),
              };
            } catch {
              return {
                id: s.id,
                name: s.name,
                description: s.description,
                meeting: s.meeting,
                archived: s.archived,
                courseIds: s.courseIds || [],
                members: [],
                invitations: [],
              };
            }
          }),
        );

        if (active) {
          setClasses((prev) => {
            // Keep example classes if the user loaded them
            const examples = prev.filter((c) => c.example);
            return [...fullClasses, ...examples];
          });
        }
      } catch {
        // Fall back gracefully to local state if offline or no backend session
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

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
      update(id, (item) => {
        const updated = { ...item, ...clean };
        if (isUuid(id)) {
          void saveTeachingClassApi(
            id,
            updated.name,
            updated.description,
            updated.meeting,
            updated.archived,
            updated.courseIds,
          ).catch((e) => console.error("Failed to save class to backend", e));
        }
        return updated;
      });
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

    // Persist to backend and swap temp ID if UUID returned
    void saveTeachingClassApi(
      null,
      clean.name,
      clean.description,
      clean.meeting,
      false,
      [],
    )
      .then((res) => {
        if (res && res.class_id) {
          setClasses((curr) =>
            curr.map((c) => (c.id === createdId ? { ...c, id: res.class_id } : c)),
          );
        }
      })
      .catch((e) => console.error("Failed to create class on backend", e));

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
    update(id, (item) => {
      const updated = { ...item, archived };
      if (isUuid(id)) {
        void saveTeachingClassApi(
          id,
          updated.name,
          updated.description,
          updated.meeting,
          archived,
          updated.courseIds,
        ).catch((e) => console.error("Failed to archive class", e));
      }
      return updated;
    });
  }

  function assign(id: string, courseId: string) {
    update(id, (item) => {
      if (item.archived || item.courseIds.includes(courseId)) return item;
      const updated = { ...item, courseIds: [...item.courseIds, courseId] };
      if (isUuid(id)) {
        void saveTeachingClassApi(
          id,
          updated.name,
          updated.description,
          updated.meeting,
          updated.archived,
          updated.courseIds,
        ).catch((e) => console.error("Failed to assign course to class", e));
      }
      return updated;
    });
  }

  function unassign(id: string, courseId: string) {
    update(id, (item) => {
      if (item.archived) return item;
      const updated = {
        ...item,
        courseIds: item.courseIds.filter((value) => value !== courseId),
      };
      if (isUuid(id)) {
        void saveTeachingClassApi(
          id,
          updated.name,
          updated.description,
          updated.meeting,
          updated.archived,
          updated.courseIds,
        ).catch((e) => console.error("Failed to unassign course from class", e));
      }
      return updated;
    });
  }

  function invite(id: string, name: string, email: string) {
    const tempInviteId = `class-invitation-${nextId.current++}`;
    const invitation: ClassInvitation = {
      id: tempInviteId,
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
      if (item.archived || duplicate) return item;

      if (isUuid(id)) {
        void inviteClassMemberApi(id, name, email)
          .then((res) => {
            if (res && res.invitation_id) {
              setClasses((curr) =>
                curr.map((c) =>
                  c.id === id
                    ? {
                        ...c,
                        invitations: c.invitations.map((inv) =>
                          inv.id === tempInviteId
                            ? { ...inv, id: res.invitation_id }
                            : inv,
                        ),
                      }
                    : c,
                ),
              );
            }
          })
          .catch((e) => console.error("Failed to invite member via backend", e));
      }

      return { ...item, invitations: [...item.invitations, invitation] };
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

      if (status === "revoked" && isUuid(invitationId)) {
        void revokeClassInvitationApi(invitationId).catch((e) =>
          console.error("Failed to revoke invitation on backend", e),
        );
      }

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
    update(id, (item) => {
      if (item.archived) return item;
      if (isUuid(id) && isUuid(memberId)) {
        void updateClassMemberStatusApi(id, memberId, status).catch((e) =>
          console.error("Failed to update member status on backend", e),
        );
      }
      return {
        ...item,
        members: item.members.map((member) =>
          member.id === memberId ? { ...member, status } : member,
        ),
        invitations:
          status === "active"
            ? item.invitations.map((invitation) =>
                invitation.status === "pending" &&
                invitation.email ===
                  item.members.find((member) => member.id === memberId)?.email
                  ? { ...invitation, status: "revoked" }
                  : invitation,
              )
            : item.invitations,
      };
    });
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
