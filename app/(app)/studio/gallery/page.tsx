import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/data/business";
import type { CreativeRow } from "@/lib/ai/studio";
import { Gyan } from "@/components/mascot/gyan";
import { Button } from "@/components/ui/button";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { CreativeCard } from "../creative-card";

export default async function GalleryPage() {
  const supabase = await createClient();
  const business = (await getCurrentBusiness(supabase))!;

  const [{ data: creatives }, { data: threads }] = await Promise.all([
    supabase
      .from("creatives")
      .select("*, post_briefs(title)")
      .eq("business_id", business.id)
      .order("is_favorite", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(60),
    supabase
      .from("studio_threads")
      .select("id, title, updated_at")
      .eq("business_id", business.id)
      .order("updated_at", { ascending: false })
      .limit(10),
  ]);

  const items = (creatives ?? []) as (CreativeRow & { post_briefs: { title: string } | null })[];

  return (
    <main className="flex flex-col gap-5 p-4 pt-2">
      <div className="flex items-center gap-2">
        <Button href="/studio" variant="ghost" size="sm">
          <ArrowLeft className="size-4" /> Studio
        </Button>
      </div>
      <div>
        <h1 className="text-3xl">Gallery</h1>
        <p className="text-ink-soft">Every creative you&apos;ve made. Favourites first.</p>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center">
          <Gyan expression="sleepy" size={110} />
          <p className="text-ink-soft">No creatives yet. Head to Studio and make your first one.</p>
          <Button href="/studio">Open Studio</Button>
        </div>
      ) : (
        <Stagger className="grid grid-cols-2 gap-3">
          {items.map((c) => (
            <StaggerItem key={c.id}>
              <div className="flex flex-col gap-1">
                <CreativeCard
                  creative={{ id: c.id, url: c.public_url, aspect: c.aspect, brief_id: c.brief_id, is_favorite: c.is_favorite }}
                  compact
                />
                {c.post_briefs?.title && (
                  <p className="truncate text-xs font-bold text-ink-soft">{c.post_briefs.title}</p>
                )}
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {threads && threads.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-xl">Recent sessions</h2>
          {threads.map((t: { id: string; title: string | null; updated_at: string }) => (
            <Link
              key={t.id}
              href={`/studio?thread=${t.id}`}
              className="outline-brutal shadow-brutal-sm flex items-center gap-2 rounded-card bg-paper px-3 py-2 text-sm font-bold"
            >
              <MessageSquare className="size-4 shrink-0" />
              <span className="flex-1 truncate">{t.title ?? "Studio session"}</span>
              <span className="text-xs text-ink-soft">
                {new Date(t.updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </Link>
          ))}
        </section>
      )}
    </main>
  );
}
