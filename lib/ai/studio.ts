import { generateText } from "ai";
import { google } from "@ai-sdk/google";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Business, PostBriefRow } from "@/types/domain";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = SupabaseClient<any>;

export const IMAGE_MODEL = process.env.AI_IMAGE_MODEL ?? "gemini-2.5-flash-image";

export type CreativeAspect = "1:1" | "4:5" | "9:16" | "16:9";

export type CreativeRow = {
  id: string;
  business_id: string;
  brief_id: string | null;
  parent_id: string | null;
  storage_path: string;
  public_url: string;
  prompt: string;
  user_instruction: string | null;
  aspect: CreativeAspect;
  model: string;
  is_favorite: boolean;
  created_at: string;
};

export function studioConfigured() {
  return !!process.env.GOOGLE_GENERATIVE_AI_API_KEY;
}

/** Brand + platform guardrails prepended to every image prompt. */
function brandDirection(business: Business) {
  const vibe: Record<string, string> = {
    warm: "warm, inviting, natural light, cosy",
    witty: "playful, bold colours, energetic",
    premium: "minimal, elegant, muted palette, lots of negative space",
    "no-nonsense": "clean, clear, high contrast, simple",
  };
  return [
    `Social media creative for "${business.name}", a ${business.sub_niche ?? business.category} in ${business.city}, India.`,
    `Visual style: ${vibe[business.tone.voice] ?? vibe.warm}. Photorealistic unless asked otherwise.`,
    "Indian context — people, settings, food, and signage should feel authentically local.",
    "If text is included, render it exactly as written, large, legible, and correctly spelled. No lorem ipsum, no gibberish text, no watermarks, no logos of other brands.",
    "Leave safe margins: keep key elements away from the outer 8% of the frame.",
  ].join(" ");
}

export async function generateCreative(
  supabase: Db,
  input: {
    business: Business;
    instruction: string;
    aspect: CreativeAspect;
    brief?: PostBriefRow | null;
    parent?: CreativeRow | null;
  },
): Promise<CreativeRow> {
  const briefContext = input.brief
    ? `\nThis creative is for the post "${input.brief.title}" (${input.brief.format}). Visual concept from the brief: ${input.brief.visual_concept}`
    : "";

  const prompt = input.parent
    ? `Edit the attached image. ${input.instruction}. Keep everything else the same unless asked. ${brandDirection(input.business)}`
    : `${brandDirection(input.business)}${briefContext}\n\nCreate: ${input.instruction}`;

  let parentBytes: Uint8Array | null = null;
  if (input.parent) {
    const res = await fetch(input.parent.public_url);
    if (!res.ok) throw new Error("Could not load the previous creative to edit it.");
    parentBytes = new Uint8Array(await res.arrayBuffer());
  }

  const result = await generateText({
    model: google(IMAGE_MODEL),
    prompt: parentBytes
      ? [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              { type: "file", data: parentBytes, mediaType: "image/png" },
            ],
          },
        ]
      : prompt,
    providerOptions: {
      google: {
        responseModalities: ["TEXT", "IMAGE"],
        imageConfig: { aspectRatio: input.aspect, imageOutputOptions: { mimeType: "image/png" } },
      },
    },
  });

  const file = result.files.find((f) => f.mediaType.startsWith("image/"));
  if (!file) {
    throw new Error(
      result.text?.trim()
        ? `The image model replied without an image: "${result.text.trim().slice(0, 200)}"`
        : "The image model returned no image. Try rephrasing.",
    );
  }

  const id = crypto.randomUUID();
  const ext = file.mediaType === "image/jpeg" ? "jpg" : "png";
  const storagePath = `${input.business.id}/${id}.${ext}`;

  const { error: upErr } = await supabase.storage.from("creatives").upload(storagePath, file.uint8Array, {
    contentType: file.mediaType,
    upsert: false,
  });
  if (upErr) throw new Error(`Upload failed: ${upErr.message}`);

  const {
    data: { publicUrl },
  } = supabase.storage.from("creatives").getPublicUrl(storagePath);

  const { data, error } = await supabase
    .from("creatives")
    .insert({
      id,
      business_id: input.business.id,
      brief_id: input.brief?.id ?? input.parent?.brief_id ?? null,
      parent_id: input.parent?.id ?? null,
      storage_path: storagePath,
      public_url: publicUrl,
      prompt,
      user_instruction: input.instruction,
      aspect: input.aspect,
      model: IMAGE_MODEL,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);

  return data as CreativeRow;
}
