import type { CaptionLanguage, PostFormat } from "@/lib/ai/schemas";

type BriefPromptInput = {
  pillar: { name: string; description: string; example_ideas: string[] };
  format?: PostFormat;
  language?: CaptionLanguage;
  hint?: string;
  recentTitles?: string[];
};

export function briefPrompt(input: BriefPromptInput) {
  const format = input.format
    ? `Format: ${input.format}.`
    : "Choose the best format for this idea and audience.";
  const language = input.language
    ? `Write the caption in: ${input.language}.`
    : "Pick the caption language that matches the owner's voice settings.";
  const avoid =
    input.recentTitles?.length
      ? `\nDo NOT repeat these recent ideas: ${input.recentTitles.join("; ")}.`
      : "";
  const hint = input.hint ? `\nOwner's hint: "${input.hint}"` : "";

  return `Create one complete post brief for the pillar "${input.pillar.name}" (${input.pillar.description}).
Pillar example ideas: ${input.pillar.example_ideas.join("; ")}.
${format}
${language}${hint}${avoid}

Requirements:
- visual_concept: describe exactly what to shoot so a non-designer can do it with a phone. For carousels, list each slide. For reels, give a 3-5 shot list with approximate seconds.
- caption: hook in the first line (under 8 words), then 2-4 short lines, then the CTA. Match the voice and emoji level.
- hashtags: every tag starts with '#', no spaces. Local tags must reference the actual area/city. Niche tags must be category-specific. Broad tags: only 1-3.
- title: under 10 words. cta: one short sentence.
- best_time_hint: base it on the audience (students → late evening, office crowd → lunch/after work, families → weekend morning).`;
}
