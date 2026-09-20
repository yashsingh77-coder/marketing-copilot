/**
 * Smoke test for the AI layer without a database:
 *   npx tsx scripts/smoke-ai.mts
 * Requires ANTHROPIC_API_KEY (and optionally AI_MODEL) in .env.local.
 */
import { readFileSync } from "node:fs";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { generateStructured } = await import("../lib/ai/client");
const { PillarSetSchema, PostBriefSchema, BusinessContextSchema } = await import("../lib/ai/schemas");
const { systemPrompt } = await import("../lib/ai/prompts/system");
const { pillarsPrompt } = await import("../lib/ai/prompts/pillars");
const { briefPrompt } = await import("../lib/ai/prompts/brief");

const ctx = BusinessContextSchema.parse({
  name: "Café Bandra",
  category: "cafe",
  sub_niche: "Specialty coffee & brunch",
  city: "Mumbai",
  area: "Bandra West",
  audience: { age_groups: ["25–34"], interests: ["Coffee", "Working remotely", "Brunch"] },
  tone: { voice: "warm", languages: ["en", "hi"], hinglish: true, emoji: "some" },
  weekly_hours: 3,
  active_insights: [],
});

console.log(`model: ${process.env.AI_MODEL}`);

let t = Date.now();
const pillars = await generateStructured({ schema: PillarSetSchema, instructions: systemPrompt(ctx), prompt: pillarsPrompt });
console.log(`\n✓ pillars in ${Date.now() - t}ms`);
for (const p of pillars.pillars) console.log(`  ${p.emoji} ${p.name} (${p.weight}%, ${p.color}) — ${p.description}`);
console.log(`  rationale: ${pillars.rationale}`);

t = Date.now();
const brief = await generateStructured({
  schema: PostBriefSchema,
  instructions: systemPrompt(ctx),
  prompt: briefPrompt({ pillar: pillars.pillars[0], format: "reel", language: "hinglish" }),
});
console.log(`\n✓ brief in ${Date.now() - t}ms`);
console.log(`  ${brief.title} [${brief.format}/${brief.caption_language}]`);
console.log(`  shoot: ${brief.visual_concept.slice(0, 160)}…`);
console.log(`  caption: ${brief.caption.split("\n")[0]}`);
console.log(`  tags: ${brief.hashtags.local.join(" ")} | ${brief.hashtags.niche.join(" ")} | ${brief.hashtags.broad.join(" ")}`);
console.log(`  time: ${brief.best_time_hint}`);
