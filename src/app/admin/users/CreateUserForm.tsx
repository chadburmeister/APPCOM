"use client";

import { useActionState, useRef, useEffect } from "react";
import { createUserAction, type ActionState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export function CreateUserForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    createUserAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the form after a successful add (no error means it worked).
  useEffect(() => {
    if (state === null) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-purple-deep">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-purple-deep outline-none focus:border-purple"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-purple-deep">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-purple-deep outline-none focus:border-purple"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-purple-deep">
          Temporary password
        </label>
        <input
          id="password"
          name="password"
          type="text"
          required
          minLength={8}
          placeholder="Share this with them directly"
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-purple-deep outline-none focus:border-purple"
        />
      </div>

      <div>
        <label htmlFor="role" className="mb-1 block text-sm font-medium text-purple-deep">
          Role
        </label>
        <select
          id="role"
          name="role"
          defaultValue="member"
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-purple-deep outline-none focus:border-purple"
        >
          <option value="member">Member (sees only their own calls)</option>
          <option value="coach">Coach (sees everything, manages users)</option>
        </select>
      </div>

      {state?.error ? (
        <p className="sm:col-span-2 rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">
          {state.error}
        </p>
      ) : null}

      <div className="sm:col-span-2">
        <SubmitButton
          pendingText="Adding…"
          className="rounded-md bg-purple px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          Add user
        </SubmitButton>
      </div>
    </form>
  );
}
