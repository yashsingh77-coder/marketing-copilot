import Link from "next/link";
import { Images } from "lucide-react";
import type { UIMessage } from "ai";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness, getRecentBriefs } from "@/lib/data/business";
import { studioConfigured } from "@/lib/ai/studio";
import { StudioChat, StudioEmpty } from "./studio-chat";

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ brief?: string; thread?: string }>;
}) {
  const { brief, thread } = await searchParams;
  const supabase = await createClient();
  const business = (await getCurrentBusiness(supabase))!;
  const briefs = await getRecentBriefs(supabase, business.id, 15);

  type Thread = { id: string; messages: UIMessage[]; brief_id: string | null };
  let initialThread: Thread | null = null;
  if (thread) {
    const { data } = await supabase.from("studio_threads").select("id, messages, brief_id").eq("id", thread).maybeSingle();
    if (data) initialThread = data as unknown as Thread;
  }

  return (
    <main className="flex flex-col gap-3 p-4 pt-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl">Studio</h1>
          <p className="text-ink-soft">Chat with Gyan. Get finished creatives.</p>
        </div>
        <Link href="/studio/gallery" className="outline-brutal shadow-brutal-sm flex h-10 items-center gap-1.5 rounded-full bg-paper px-3 text-sm font-extrabold">
          <Images className="size-4" /> Gallery
        </Link>
      </div>

      {studioConfigured() ? (
        <StudioChat key={initialThread?.id ?? brief ?? "new"} briefs={briefs} initialBriefId={brief} initialThread={initialThread} />
      ) : (
        <StudioEmpty />
      )}
    </main>
  );
}
