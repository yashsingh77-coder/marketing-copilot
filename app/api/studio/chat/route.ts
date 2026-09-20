import { NextResponse } from "next/server";
import { convertToModelMessages, isStepCount, streamText, tool, type UIMessage } from "ai";
import { z } from "zod";
import { model } from "@/lib/ai/client";
import { generateCreative, studioConfigured, type CreativeRow } from "@/lib/ai/studio";
import { createClient } from "@/lib/supabase/server";
import { getCurrentBusiness } from "@/lib/data/business";
import type { PostBriefRow } from "@/types/domain";

export const maxDuration = 120;

/**
 * POST /api/studio/chat  { messages: UIMessage[], briefId?: string, threadId?: string }
 * Gyan as a creative director: chats, then calls generate_creative to produce images via Gemini.
 */
export async function POST(request: Request) {
  if (!studioConfigured()) {
    return NextResponse.json({ error: "Studio is not configured (missing GOOGLE_GENERATIVE_AI_API_KEY)." }, { status: 503 });
  }

  const supabase = await createClient();
  const business = await getCurrentBusiness(supabase);
  if (!business) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { messages, briefId, threadId } = (await request.json()) as {
    messages: UIMessage[];
    briefId?: string;
    threadId?: string;
  };

  let brief: PostBriefRow | null = null;
  if (briefId) {
    const { data } = await supabase.from("post_briefs").select("*").eq("id", briefId).eq("business_id", business.id).maybeSingle();
    brief = (data as PostBriefRow) ?? null;
  }

  const instructions = `You are Gyan, a friendly creative director for "${business.name}" — a ${business.sub_niche ?? business.category} in ${business.area ? business.area + ", " : ""}${business.city}. The owner has zero design experience.

Your job: turn their ideas into finished social media creatives (images) using the generate_creative tool.

How to work:
- Be brief and warm. 1-3 short sentences per reply. No jargon.
- When the owner asks for a creative, call generate_creative right away with a rich, specific image description (subject, setting, lighting, composition, any exact text to render). Don't ask clarifying questions unless the request is truly ambiguous.
- Default aspect: 4:5 for feed posts, 9:16 for stories/reel covers, 1:1 if they say "square". Follow the brief's format when one is attached (reel/story → 9:16).
- When the owner wants changes ("make it warmer", "add ₹199", "remove the text"), call generate_creative with source_creative_id set to the creative being changed and describe only the change.
- Text on image: keep it short (under 6 words per line), and pass it exactly as it should appear. Suggest Hinglish when it fits the owner's voice.
- After the tool returns, describe what you made in one line and offer one concrete next tweak.
- Never say you can't make images. Never output image URLs or markdown images yourself — the tool result renders the image.
${brief ? `\nATTACHED BRIEF\nTitle: ${brief.title}\nFormat: ${brief.format}\nVisual concept: ${brief.visual_concept}\nCaption (first line): ${brief.caption.split("\n")[0]}` : "\nNo brief attached — work from the owner's description."}
Owner's voice: ${business.tone.voice}${business.tone.hinglish ? ", speaks Hinglish" : ""}.`;

  const result = streamText({
    model,
    instructions,
    messages: await convertToModelMessages(messages),
    stopWhen: isStepCount(3),
    tools: {
      generate_creative: tool({
        description:
          "Generate (or edit) a social media image creative. Returns the saved creative with a public URL. Use source_creative_id to edit an existing creative.",
        inputSchema: z.object({
          description: z
            .string()
            .describe("Detailed image description or, when editing, the specific change to make. Include exact text to render, if any."),
          aspect: z.enum(["1:1", "4:5", "9:16", "16:9"]).describe("Aspect ratio"),
          source_creative_id: z.string().uuid().optional().describe("ID of an existing creative to edit"),
        }),
        execute: async ({ description, aspect, source_creative_id }) => {
          let parent: CreativeRow | null = null;
          if (source_creative_id) {
            const { data } = await supabase
              .from("creatives")
              .select("*")
              .eq("id", source_creative_id)
              .eq("business_id", business.id)
              .maybeSingle();
            parent = (data as CreativeRow) ?? null;
          }
          try {
            const creative = await generateCreative(supabase, {
              business,
              instruction: description,
              aspect,
              brief,
              parent,
            });
            return {
              ok: true as const,
              creative: {
                id: creative.id,
                url: creative.public_url,
                aspect: creative.aspect,
                brief_id: creative.brief_id,
                parent_id: creative.parent_id,
              },
            };
          } catch (err) {
            return { ok: false as const, error: err instanceof Error ? err.message : "Image generation failed." };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    onFinish: async ({ messages: uiMessages }) => {
      // Persist the thread (best effort) so the owner can come back to it.
      if (!threadId) return;
      await supabase.from("studio_threads").upsert(
        {
          id: threadId,
          business_id: business.id,
          brief_id: brief?.id ?? null,
          title: brief?.title ?? firstUserText(messages) ?? "Studio session",
          messages: uiMessages,
        },
        { onConflict: "id" },
      );
    },
  });
}

function firstUserText(messages: UIMessage[]) {
  const m = messages.find((x) => x.role === "user");
  const t = m?.parts.find((p) => p.type === "text") as { text?: string } | undefined;
  return t?.text?.slice(0, 80);
}
