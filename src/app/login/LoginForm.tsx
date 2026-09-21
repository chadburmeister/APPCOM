"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type ActionState } from "./actions";
import { SubmitButton } from "@/components/SubmitButton";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(
    loginAction,
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      {next ? <input type="hidden" name="next" value={next} /> : null}

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
          autoComplete="current-password"
          required
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-purple-deep outline-none focus:border-purple"
        />
      </div>

      {state?.error ? (
        <p className="rounded-md bg-warn/10 px-3 py-2 text-sm text-warn">
          {state.error}
        </p>
      ) : null}

      <SubmitButton pendingText="Signing in…">Sign in</SubmitButton>

      <p className="text-center text-sm text-gray-text">
        Need an account?{" "}
        <Link href="/register" className="font-medium text-purple hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}
