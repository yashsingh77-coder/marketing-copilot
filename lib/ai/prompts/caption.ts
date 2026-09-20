import type { CaptionLanguage } from "@/lib/ai/schemas";

const LANGUAGE_NOTES: Record<CaptionLanguage, string> = {
  en: "Write in clear, friendly English.",
  hinglish:
    "Write in Hinglish — natural Hindi-English mix in Latin script, the way a friendly local shop owner talks (e.g. 'Aaj ka special: adrak chai + garam samosa').",
  hi: "Write in Hindi using Devanagari script. Keep it simple and conversational.",
};

export function captionPrompt(input: {
  title: string;
  visualConcept: string;
  currentCaption: string;
  language: CaptionLanguage;
}) {
  return `Rewrite the caption for this post in a different language. Keep the same idea, hook structure, and CTA.

Post: ${input.title}
Visual: ${input.visualConcept}
Current caption:
"""
${input.currentCaption}
"""

${LANGUAGE_NOTES[input.language]}
Keep the first line under 8 words. Keep the CTA. Match the owner's emoji level.`;
}
