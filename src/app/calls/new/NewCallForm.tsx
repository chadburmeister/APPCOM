"use client";

import { useActionState } from "react";
import { createCallAction, type ActionState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

function todayLocalDatetime() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

export function NewCallForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createCallAction,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="repName" className="mb-1 block text-sm font-medium text-purple-deep">
            Sales professional
          </label>
          <input
            id="repName"
            name="repName"
            type="text"
            required
            placeholder="e.g. Jordan Reyes"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-purple-deep outline-none focus:border-purple"
          />
        </div>

        <div>
          <label htmlFor="accountName" className="mb-1 block text-sm font-medium text-purple-deep">
            Account / prospect
          </label>
          <input
            id="accountName"
            name="accountName"
            type="text"
            required
            placeholder="e.g. Herff Jones"
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-purple-deep outline-none focus:border-purple"
          />
        </div>
      </div>

      <div>
        <label htmlFor="callDate" className="mb-1 block text-sm font-medium text-purple-deep">
          Call date &amp; time
        </label>
        <input
          id="callDate"
          name="callDate"
          type="datetime-local"
          required
          defaultValue={todayLocalDatetime()}
          className="w-full rounded-md border border-border bg-white px-3 py-2 font-tabular text-purple-deep outline-none focus:border-purple sm:w-64"
        />
      </div>

      <div>
        <label htmlFor="recordingUrl" className="mb-1 block text-sm font-medium text-purple-deep">
          Recording link <span className="font-normal text-gray-text">(optional)</span>
        </label>
        <input
          id="recordingUrl"
          name="recordingUrl"
          type="url"
          placeholder="https://..."
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-purple-deep outline-none focus:border-purple"
        />
      </div>

      <div>
        <label htmlFor="context" className="mb-1 block text-sm font-medium text-purple-deep">
          Context <span className="font-normal text-gray-text">(optional)</span>
        </label>
        <textarea
          id="context"
          name="context"
          rows={3}
          placeholder="Call type, where they are in the pipeline, anything scorers should know going in..."
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-purple-deep outline-none focus:border-purple"
        />
      </div>

      {state?.error ? (
        <p className="rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">
          {state.error}
        </p>
      ) : null}

      <SubmitButton pendingText="Saving…" className="rounded-md bg-purple px-5 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-60">
        Save call
      </SubmitButton>
    </form>
  );
}
