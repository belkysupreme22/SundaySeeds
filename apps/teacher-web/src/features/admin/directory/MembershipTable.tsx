import type { DirectoryMembership, DirectoryPerson } from "./types";
import { directoryRoleLabels } from "./types";

export function MembershipTable({
  visible,
  people,
  blocked,
  title,
  onChange,
}: {
  visible: DirectoryMembership[];
  people: DirectoryPerson[];
  blocked: boolean;
  title: string;
  onChange: (member: DirectoryMembership) => void;
}) {
  return (
    <div className="admin-dir-table-wrap">
      <table className="admin-dir-table">
        <caption className="sr-only">Memberships in {title}</caption>
        <thead>
          <tr>
            <th scope="col">Person</th>
            <th scope="col">Class role</th>
            <th scope="col">Membership</th>
            <th scope="col">Action</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((member) => {
            const memberPerson = people.find(
              (candidate) => candidate.id === member.personId,
            );
            const canRestore =
              memberPerson?.status === "active" &&
              memberPerson.role === member.role;
            return (
              <tr key={member.id}>
                <td>
                  <strong>{memberPerson?.name ?? "Unavailable person"}</strong>
                  <span className="admin-dir-subtext">
                    {memberPerson?.email ?? "Person record unavailable"}
                  </span>
                  {memberPerson?.status === "inactive" && (
                    <span className="admin-dir-status">Person inactive</span>
                  )}
                </td>
                <td>
                  {directoryRoleLabels[member.role]}
                  {memberPerson && memberPerson.role !== member.role && (
                    <span className="admin-dir-subtext">
                      Directory role changed
                    </span>
                  )}
                </td>
                <td>
                  <span className="admin-dir-status">
                    {member.status === "active" ? "Active" : "Removed"}
                  </span>
                </td>
                <td>
                  <button
                    className="button button-outline"
                    type="button"
                    disabled={
                      blocked || (member.status === "removed" && !canRestore)
                    }
                    onClick={() => onChange(member)}
                  >
                    {member.status === "active" ? "Remove" : "Restore"}
                  </button>
                  {member.status === "removed" && !canRestore && (
                    <span className="admin-dir-subtext">
                      Requires an active person with a matching role.
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
