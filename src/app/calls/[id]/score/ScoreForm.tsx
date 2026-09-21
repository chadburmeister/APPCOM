"use client";

import { useActionState } from "react";
import { submitScorecardAction, type ActionState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";
import { RatingInput } from "@/components/RatingInput";
import { APPCOM_ELEMENTS, PROBING_CHECKLIST, SCORE_MIN, SCORE_MAX } from "@/lib/appcom";
import type { Scorecard } from "@/db/schema";

export function ScoreForm({
  callId,
  existing,
}: {
  callId: string;
  existing?: Scorecard | null;
}) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    submitScorecardAction,
    null
  );

  const e = existing as (Record<string, unknown> | null | undefined);

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="callId" value={callId} />

      {APPCOM_ELEMENTS.map((element) => (
        <section
          key={element.key}
          className="rounded-lg border border-border-light bg-white p-5"
        >
          <div className="mb-3 flex items-baseline gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-purple-tint font-tabular text-sm font-bold text-purple-deep">
              {element.letter}
            </span>
            <h2 className="text-lg font-semibold text-purple-deep">{element.title}</h2>
          </div>
          <p className="mb-4 text-sm text-gray-text">{element.description}</p>

          <div className="mb-4">
            <span className="mb-1 block text-sm font-medium text-purple-deep">
              Score
            </span>
            <RatingInput
              name={element.scoreField}
              min={SCORE_MIN}
              max={SCORE_MAX}
              defaultValue={
                typeof e?.[element.scoreField] === "number"
                  ? (e[element.scoreField] as number)
                  : undefined
              }
              labels={{ low: "Missed the mark", high: "Excellent" }}
            />
          </div>

          {element.key === "purpose" ? (
            <label className="mb-4 flex items-center gap-2 text-sm text-purple-deep">
              <input
                type="checkbox"
                name="purposeStatedEarly"
                defaultChecked={Boolean(e?.purposeStatedEarly)}
                className="h-4 w-4 rounded border-border text-purple focus:ring-purple"
              />
              Stated within the first 3 minutes
            </label>
          ) : null}

          {element.key === "probing" ? (
            <div className="mb-4 space-y-4">
              <div>
                <span className="mb-2 block text-sm font-medium text-purple-deep">
                  Top 2-3 qualifying questions asked
                </span>
                <div className="space-y-2">
                  {[1, 2, 3].map((n) => (
                    <input
                      key={n}
                      type="text"
                      name={`qualQuestion${n}`}
                      defaultValue={(e?.[`qualQuestion${n}`] as string) ?? ""}
                      placeholder={`Question ${n}`}
                      className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-purple-deep outline-none focus:border-purple"
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                {PROBING_CHECKLIST.map((item) => (
                  <label key={item.key} className="flex items-center gap-2 text-sm text-purple-deep">
                    <input
                      type="checkbox"
                      name={item.key}
                      defaultChecked={Boolean(e?.[item.key])}
                      className="h-4 w-4 rounded border-border text-purple focus:ring-purple"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <label
              htmlFor={element.notesField}
              className="mb-1 block text-sm font-medium text-purple-deep"
            >
              Notes
            </label>
            <textarea
              id={element.notesField}
              name={element.notesField}
              rows={2}
              defaultValue={(e?.[element.notesField] as string) ?? ""}
              placeholder="What did you hear? What would you change?"
              className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-purple-deep outline-none focus:border-purple"
            />
          </div>
        </section>
      ))}

      <section className="rounded-lg border border-purple bg-purple-tint-light p-5">
        <h2 className="mb-3 text-lg font-semibold text-purple-deep">
          Overall call rating
        </h2>
        <RatingInput
          name="overallRating"
          min={1}
          max={10}
          defaultValue={typeof e?.overallRating === "number" ? (e.overallRating as number) : undefined}
          labels={{ low: "Poor", high: "Outstanding" }}
        />
        <div className="mt-4">
          <label htmlFor="overallNotes" className="mb-1 block text-sm font-medium text-purple-deep">
            Overall notes
          </label>
          <textarea
            id="overallNotes"
            name="overallNotes"
            rows={3}
            defaultValue={(e?.overallNotes as string) ?? ""}
            placeholder="Coaching takeaways for the rep..."
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-purple-deep outline-none focus:border-purple"
          />
        </div>
      </section>

      {state?.error ? (
        <p className="rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">
          {state.error}
        </p>
      ) : null}

      <SubmitButton
        pendingText="Saving score…"
        className="rounded-md bg-purple px-5 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {existing ? "Update score" : "Submit score"}
      </SubmitButton>
    </form>
  );
}
