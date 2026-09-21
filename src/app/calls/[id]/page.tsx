import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { calls } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { APPCOM_ELEMENTS, PROBING_CHECKLIST, averageAppcomScores } from "@/lib/appcom";
import { deleteMyScorecardAction } from "./score/actions";

export const dynamic = "force-dynamic";

function formatDateTime(d: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const call = await db.query.calls.findFirst({
    where: eq(calls.id, id),
    with: {
      createdBy: { columns: { name: true } },
      scorecards: { with: { scorer: { columns: { name: true, email: true } } } },
    },
  });

  if (!call) notFound();

  const myScorecard = call.scorecards.find((s) => s.scorerId === session.sub);
  const averages = averageAppcomScores(call.scorecards);
  const overallAvg =
    call.scorecards.length > 0
      ? (
          call.scorecards.reduce((a, s) => a + s.overallRating, 0) /
          call.scorecards.length
        ).toFixed(1)
      : null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-8 rounded-lg border border-border-light bg-white p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-purple-deep">{call.repName}</h1>
            <p className="text-gray-text">{call.accountName}</p>
          </div>
          <Link
            href={`/calls/${call.id}/score`}
            className="rounded-md bg-purple px-4 py-2 font-semibold text-white hover:opacity-90"
          >
            {myScorecard ? "Edit your score" : "Score this call"}
          </Link>
        </div>

        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-gray-text">Call date</dt>
            <dd className="font-tabular text-purple-deep">{formatDateTime(call.callDate)}</dd>
          </div>
          <div>
            <dt className="text-gray-text">Logged by</dt>
            <dd className="text-purple-deep">{call.createdBy?.name ?? "—"}</dd>
          </div>
          {call.recordingUrl ? (
            <div>
              <dt className="text-gray-text">Recording</dt>
              <dd>
                <a
                  href={call.recordingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium text-purple hover:underline"
                >
                  Open recording ↗
                </a>
              </dd>
            </div>
          ) : null}
          {call.context ? (
            <div className="sm:col-span-2">
              <dt className="text-gray-text">Context</dt>
              <dd className="text-purple-deep">{call.context}</dd>
            </div>
          ) : null}
        </dl>
      </div>

      <div className="mb-8 rounded-lg border border-purple bg-purple-tint-light p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-purple-deep">Panel average</h2>
          <p className="text-sm text-gray-text">
            {call.scorecards.length} {call.scorecards.length === 1 ? "score" : "scores"}
            {overallAvg ? (
              <>
                {" "}
                &middot; overall{" "}
                <span className="font-tabular font-semibold text-purple-deep">{overallAvg}/10</span>
              </>
            ) : null}
          </p>
        </div>

        {averages ? (
          <div className="space-y-3">
            {APPCOM_ELEMENTS.map((el) => {
              const value = averages[el.scoreField] ?? 0;
              return (
                <div key={el.key} className="flex items-center gap-3">
                  <span className="w-40 shrink-0 text-sm font-medium text-purple-deep">
                    {el.letter} &middot; {el.title}
                  </span>
                  <div className="h-2 flex-1 rounded-full bg-white">
                    <div
                      className="h-2 rounded-full bg-purple"
                      style={{ width: `${(value / 5) * 100}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right font-tabular text-sm font-semibold text-purple-deep">
                    {value.toFixed(1)}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-text">
            No scores submitted yet — be the first to score this call.
          </p>
        )}
      </div>

      <h2 className="mb-3 text-lg font-semibold text-purple-deep">
        Scorecards ({call.scorecards.length})
      </h2>
      <div className="space-y-4">
        {call.scorecards.map((sc) => (
          <div key={sc.id} className="rounded-lg border border-border-light bg-white p-5">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-purple-deep">{sc.scorer?.name ?? "Unknown"}</p>
                <p className="text-xs text-gray-text">{sc.scorer?.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="rounded-md bg-purple-tint px-2.5 py-1 font-tabular text-sm font-bold text-purple-deep">
                  {sc.overallRating}/10
                </span>
                {sc.scorerId === session.sub ? (
                  <form action={deleteMyScorecardAction}>
                    <input type="hidden" name="callId" value={call.id} />
                    <button
                      type="submit"
                      className="text-xs font-medium text-gray-text hover:text-warn"
                    >
                      Delete
                    </button>
                  </form>
                ) : null}
              </div>
            </div>

            <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
              {APPCOM_ELEMENTS.map((el) => {
                const score = sc[el.scoreField as keyof typeof sc] as number;
                const notes = sc[el.notesField as keyof typeof sc] as string | null;
                return (
                  <div key={el.key} className="text-sm">
                    <span className="font-medium text-purple-deep">
                      {el.letter} &middot; {el.title}:
                    </span>{" "}
                    <span className="font-tabular font-semibold text-purple-deep">{score}/5</span>
                    {notes ? <p className="text-gray-text">{notes}</p> : null}
                  </div>
                );
              })}
            </div>

            {sc.qualQuestion1 || sc.qualQuestion2 || sc.qualQuestion3 ? (
              <div className="mt-3 border-t border-border-light pt-3 text-sm">
                <p className="font-medium text-purple-deep">Top qualifying questions</p>
                <ul className="ml-4 list-disc text-gray-text">
                  {[sc.qualQuestion1, sc.qualQuestion2, sc.qualQuestion3]
                    .filter(Boolean)
                    .map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                </ul>
              </div>
            ) : null}

            <div className="mt-3 border-t border-border-light pt-3 text-sm">
              <p className="mb-1 font-medium text-purple-deep">Probing checklist</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-gray-text">
                {PROBING_CHECKLIST.map((item) => (
                  <span key={item.key}>
                    {sc[item.key] ? "✓" : "✗"} {item.label}
                  </span>
                ))}
              </div>
            </div>

            {sc.overallNotes ? (
              <div className="mt-3 border-t border-border-light pt-3 text-sm">
                <p className="font-medium text-purple-deep">Overall notes</p>
                <p className="text-gray-text">{sc.overallNotes}</p>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
