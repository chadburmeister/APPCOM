import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import { NavBar } from "@/components/NavBar";

export const metadata: Metadata = {
  title: "APPCOM Call Scorecard",
  description: "Score sales calls against the APPCOM framework.",
};

// Loaded via a stylesheet link (rather than next/font/google) so the build
// never depends on reaching Google's font API from wherever it runs.
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- root layout is the App Router equivalent of _document, so this rule's warning doesn't apply here */}
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <NavBar session={session} />
        <main className="flex-1 w-full">{children}</main>
      </body>
    </html>
  );
}
