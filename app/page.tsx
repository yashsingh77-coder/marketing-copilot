import Link from "next/link";

// Landing — placeholder until the design plan is approved (docs/DESIGN.md).
export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-4xl">Marketing Co-Pilot</h1>
      <p className="text-ink-soft">
        From zero to a working content plan — with a guru who teaches you along the way.
      </p>
      <Link
        href="/login"
        className="outline-brutal shadow-brutal rounded-button bg-primary px-6 py-3 font-bold text-paper"
      >
        Get started
      </Link>
    </main>
  );
}
