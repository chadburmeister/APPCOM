"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingText,
  className,
}: {
  children: React.ReactNode;
  pendingText: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        "w-full rounded-md bg-purple px-4 py-2.5 font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      }
    >
      {pending ? pendingText : children}
    </button>
  );
}
