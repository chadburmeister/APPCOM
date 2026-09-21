import Link from "next/link";
import type { SessionPayload } from "@/lib/auth";
import { logoutAction } from "@/app/actions/logout";

export function NavBar({ session }: { session: SessionPayload | null }) {
  return (
    <header className="border-b border-border-light bg-base">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-lg font-extrabold tracking-tight text-purple">
            zocks
          </span>
          <span className="text-sm font-medium text-gray-text">
            APPCOM Scorecard
          </span>
        </Link>

        {session ? (
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="font-medium text-purple-deep hover:text-purple"
            >
              Calls
            </Link>
            <Link
              href="/calls/new"
              className="rounded-md bg-purple px-3 py-1.5 font-semibold text-white hover:opacity-90"
            >
              Log a call
            </Link>
            <span className="hidden text-gray-text sm:inline">
              {session.name}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="font-medium text-gray-text hover:text-purple-deep"
              >
                Sign out
              </button>
            </form>
          </nav>
        ) : null}
      </div>
    </header>
  );
}
