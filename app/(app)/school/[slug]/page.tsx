// Phase 4 — Swipeable lesson cards → real task → XP + confetti. Spec: docs/DESIGN.md §2E
export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <main className="p-6">
      <h1 className="text-3xl">Lesson: {slug}</h1>
    </main>
  );
}
