import { createClient } from "@/lib/supabase/server";
import { getActivePillars, getCurrentBusiness, getRecentBriefs } from "@/lib/data/business";
import { IdeaGenerator } from "./idea-generator";

export default async function IdeasPage({
  searchParams,
}: {
  searchParams: Promise<{ pillar?: string; brief?: string }>;
}) {
  const { pillar, brief } = await searchParams;
  const supabase = await createClient();
  const business = (await getCurrentBusiness(supabase))!;
  const [pillars, recent] = await Promise.all([
    getActivePillars(supabase, business.id),
    getRecentBriefs(supabase, business.id, 20),
  ]);

  return (
    <main className="flex flex-col gap-5 p-4 pt-2">
      <div>
        <h1 className="text-3xl">Ideas</h1>
        <p className="text-ink-soft">One tap → format, shot list, caption, hashtags.</p>
      </div>
      <IdeaGenerator
        key={pillar ?? "default"}
        pillars={pillars}
        recent={recent}
        initialPillarId={pillar}
        focusBriefId={brief}
      />
    </main>
  );
}
