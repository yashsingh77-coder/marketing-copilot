import { createClient } from "@/lib/supabase/server";
import { getActivePillars, getCurrentBusiness } from "@/lib/data/business";
import { PillarList } from "./pillar-list";

export default async function PillarsPage() {
  const supabase = await createClient();
  const business = (await getCurrentBusiness(supabase))!;
  const pillars = await getActivePillars(supabase, business.id);

  return (
    <main className="flex flex-col gap-5 p-4 pt-2">
      <div>
        <h1 className="text-3xl">Your pillars</h1>
        <p className="text-ink-soft">The recurring themes that make your feed feel like you.</p>
      </div>
      <PillarList initial={pillars} />
    </main>
  );
}
