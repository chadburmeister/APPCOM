import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { calls, scorecards } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { ScoreForm } from "./ScoreForm";

export const dynamic = "force-dynamic";

export default async function ScoreCallPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();

  const call = await db.query.calls.findFirst({ where: eq(calls.id, id) });
  if (!call) notFound();

  const existing = await db.query.scorecards.findFirst({
    where: and(eq(scorecards.callId, id), eq(scorecards.scorerId, session.sub)),
  });

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <p className="mb-1 text-sm font-medium text-purple">
        {call.repName} &middot; {call.accountName}
      </p>
      <h1 className="mb-6 text-2xl font-bold text-purple-deep">
        {existing ? "Update your APPCOM score" : "Score this call"}
      </h1>
      <ScoreForm callId={call.id} existing={existing} />
    </div>
  );
}
