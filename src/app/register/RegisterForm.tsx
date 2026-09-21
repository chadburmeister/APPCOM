"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerAction, type ActionState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export function RegisterForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(
    registerAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-purple-deep">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-purple-deep outline-none focus:border-purple"
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
          autoComplete="email"
          required
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-purple-deep outline-none focus:border-purple"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-purple-deep">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-purple-deep outline-none focus:border-purple"
        />
        <p className="mt-1 text-xs text-gray-text">At least 8 characters.</p>
      </div>

      {state?.error ? (
        <p className="rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">
          {state.error}
        </p>
      ) : null}

      <SubmitButton pendingText="Creating account…">
        Create account
      </SubmitButton>

      <p className="text-center text-sm text-gray-text">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-purple hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
