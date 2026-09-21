import Link from "next/link";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { calls } from "@/db/schema";
import { requireSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

function formatDate(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export default async function DashboardPage() {
  const session = await requireSession();

  const rows = await db.query.calls.findMany({
    orderBy: [desc(calls.createdAt)],
    with: {
      scorecards: {
        columns: { overallRating: true, scorerId: true },
      },
      createdBy: { columns: { name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-purple-deep">Calls</h1>
          <p className="text-sm text-gray-text">
            Welcome back, {session.name.split(" ")[0]}.
          </p>
        </div>
        <Link
          href="/calls/new"
          className="rounded-md bg-purple px-4 py-2 font-semibold text-white hover:opacity-90"
        >
          Log a call
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-surface px-6 py-16 text-center">
          <p className="text-purple-deep font-medium">No calls logged yet.</p>
          <p className="mt-1 text-sm text-gray-text">
            Log your first call to start scoring against APPCOM.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border-light">
          <table className="w-full text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-gray-text">
              <tr>
                <th className="px-4 py-3 font-semibold">Rep</th>
                <th className="px-4 py-3 font-semibold">Account</th>
                <th className="px-4 py-3 font-semibold">Call date</th>
                <th className="px-4 py-3 font-semibold">Scorers</th>
                <th className="px-4 py-3 font-semibold">Avg. rating</th>
                <th className="px-4 py-3 font-semibold">Logged by</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((call) => {
                const ratings = call.scorecards
                  .map((s) => s.overallRating)
                  .filter((v): v is number => typeof v === "number");
                const avg =
                  ratings.length > 0
                    ? (
                        ratings.reduce((a, b) => a + b, 0) / ratings.length
                      ).toFixed(1)
                    : "—";

                return (
                  <tr key={call.id} className="border-t border-border-light hover:bg-purple-tint-light">
                    <td className="px-4 py-3">
                      <Link href={`/calls/${call.id}`} className="font-medium text-purple-deep hover:text-purple">
                        {call.repName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-purple-deep">{call.accountName}</td>
                    <td className="px-4 py-3 font-tabular text-gray-text">
                      {formatDate(call.callDate)}
                    </td>
                    <td className="px-4 py-3 font-tabular text-gray-text">
                      {call.scorecards.length}
                    </td>
                    <td className="px-4 py-3 font-tabular font-semibold text-purple-deep">
                      {avg}
                      {avg !== "—" ? <span className="text-gray-text font-normal"> / 10</span> : null}
                    </td>
                    <td className="px-4 py-3 text-gray-text">{call.createdBy?.name ?? "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
