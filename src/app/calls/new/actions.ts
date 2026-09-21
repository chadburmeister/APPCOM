"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { calls } from "@/db/schema";
import { requireSession } from "@/lib/auth";

const newCallSchema = z.object({
  repName: z.string().trim().min(1, "Enter the sales professional's name."),
  accountName: z.string().trim().min(1, "Enter the account or prospect name."),
  callDate: z.string().trim().min(1, "Pick the call date."),
  recordingUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (v) => !v || /^https?:\/\//i.test(v),
      "Recording link must start with http:// or https://"
    ),
  context: z.string().trim().optional(),
});

export type ActionState = { error?: string } | null;

export async function createCallAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();

  const parsed = newCallSchema.safeParse({
    repName: formData.get("repName"),
    accountName: formData.get("accountName"),
    callDate: formData.get("callDate"),
    recordingUrl: formData.get("recordingUrl") || undefined,
    context: formData.get("context") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const { repName, accountName, callDate, recordingUrl, context } = parsed.data;

  const [call] = await db
    .insert(calls)
    .values({
      repName,
      accountName,
      callDate: new Date(callDate),
      recordingUrl: recordingUrl || null,
      context: context || null,
      createdById: session.sub,
    })
    .returning();

  redirect(`/calls/${call.id}`);
}
