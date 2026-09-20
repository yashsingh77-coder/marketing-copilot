// Phase 1: 5-step wizard → businesses row → /api/ai/pillars → dashboard.
// Screen spec: docs/DESIGN.md §2A
export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center p-6">
      <h1 className="text-3xl">Let&apos;s set you up</h1>
      <p className="mt-2 text-ink-soft">Onboarding wizard — coming in Phase 1.</p>
    </main>
  );
}
