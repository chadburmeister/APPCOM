import { desc } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { requireCoach } from "@/lib/auth";
import { CreateUserForm } from "./CreateUserForm";
import { deactivateUserAction, reactivateUserAction } from "./actions";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export default async function ManageUsersPage() {
  const session = await requireCoach();

  const rows = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  });

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-1 text-2xl font-bold text-purple-deep">Manage users</h1>
      <p className="mb-6 text-sm text-gray-text">
        Add accounts for your reps and panelists, and deactivate anyone who
        should no longer have access. Deactivating keeps their call and
        scoring history intact.
      </p>

      <div className="mb-8 rounded-lg border border-border-light bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-purple-deep">Add a user</h2>
        <CreateUserForm />
      </div>

      <h2 className="mb-3 text-lg font-semibold text-purple-deep">
        Everyone ({rows.length})
      </h2>
      <div className="overflow-hidden rounded-lg border border-border-light">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-gray-text">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Role</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Joined</th>
              <th className="px-4 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-t border-border-light">
                <td className="px-4 py-3 font-medium text-purple-deep">
                  {u.name}
                  {u.id === session.sub ? (
                    <span className="ml-2 text-xs font-normal text-gray-text">(you)</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-gray-text">{u.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      u.role === "coach"
                        ? "rounded-full bg-purple-tint px-2 py-0.5 text-xs font-semibold text-purple-deep"
                        : "rounded-full bg-surface px-2 py-0.5 text-xs font-medium text-gray-text"
                    }
                  >
                    {u.role === "coach" ? "Coach" : "Member"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {u.active ? (
                    <span className="rounded-full bg-green-tint-light px-2 py-0.5 text-xs font-medium text-purple-deep">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-warn/10 px-2 py-0.5 text-xs font-medium text-warn">
                      Deactivated
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-tabular text-gray-text">
                  {formatDate(u.createdAt)}
                </td>
                <td className="px-4 py-3 text-right">
                  {u.id === session.sub ? null : u.active ? (
                    <form action={deactivateUserAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-gray-text hover:text-warn"
                      >
                        Deactivate
                      </button>
                    </form>
                  ) : (
                    <form action={reactivateUserAction}>
                      <input type="hidden" name="userId" value={u.id} />
                      <button
                        type="submit"
                        className="text-xs font-medium text-purple hover:underline"
                      >
                        Reactivate
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
