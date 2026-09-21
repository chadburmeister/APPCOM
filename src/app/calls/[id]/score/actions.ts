"use server";

import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { calls, scorecards } from "@/db/schema";
import { requireSession } from "@/lib/auth";
import { SCORE_MIN, SCORE_MAX } from "@/lib/appcom";

const scoreField = z.coerce.number().int().min(SCORE_MIN).max(SCORE_MAX);
// Unchecked HTML checkboxes are omitted from FormData entirely (the key is
// absent, not just undefined-valued), so this field must be .optional() —
// without it, Zod treats the missing key as a validation failure rather than
// passing undefined through to the transform.
const checkbox = z
  .string()
  .optional()
  .transform((v) => v === "on");

const scorecardSchema = z.object({
  callId: z.string().min(1),

  acceptanceScore: scoreField,
  acceptanceNotes: z.string().trim().optional(),

  purposeScore: scoreField,
  purposeStatedEarly: checkbox,
  purposeNotes: z.string().trim().optional(),

  probingScore: scoreField,
  qualQuestion1: z.string().trim().optional(),
  qualQuestion2: z.string().trim().optional(),
  qualQuestion3: z.string().trim().optional(),
  uncoveredChallenges: checkbox,
  uncoveredCostOfInaction: checkbox,
  uncoveredIdealSolution: checkbox,
  understoodBuyingProcess: checkbox,
  probingNotes: z.string().trim().optional(),

  consultingScore: scoreField,
  consultingNotes: z.string().trim().optional(),

  objectionsScore: scoreField,
  objectionsNotes: z.string().trim().optional(),

  motivateScore: scoreField,
  motivateNotes: z.string().trim().optional(),

  overallRating: z.coerce.number().int().min(1).max(10),
  overallNotes: z.string().trim().optional(),
});

export type ActionState = { error?: string } | null;

export async function submitScorecardAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();

  const raw = Object.fromEntries(formData.entries());
  const parsed = scorecardSchema.safeParse(raw);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your entries and try again." };
  }

  const { callId, ...data } = parsed.data;

  const call = await db.query.calls.findFirst({ where: eq(calls.id, callId) });
  if (!call) {
    return { error: "That call no longer exists." };
  }

  await db
    .insert(scorecards)
    .values({ callId, scorerId: session.sub, ...data, submitted: true })
    .onConflictDoUpdate({
      target: [scorecards.callId, scorecards.scorerId],
      set: { ...data, submitted: true, updatedAt: new Date() },
    });

  redirect(`/calls/${callId}`);
}

export async function deleteMyScorecardAction(formData: FormData) {
  const session = await requireSession();
  const callId = String(formData.get("callId") ?? "");
  if (!callId) return;

  await db
    .delete(scorecards)
    .where(
      and(eq(scorecards.callId, callId), eq(scorecards.scorerId, session.sub))
    );

  redirect(`/calls/${callId}`);
}
