/**
 * Smoke test for Gemini image generation (no DB):
 *   npx tsx scripts/smoke-image.mts [model]
 * Writes output to /tmp/creative-*.png
 */
import { readFileSync, writeFileSync } from "node:fs";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const modelId = process.argv[2] ?? process.env.AI_IMAGE_MODEL ?? "gemini-2.5-flash-image";
const out = process.env.SMOKE_OUT ?? "/tmp";

const prompt = `Social media creative for "Café Bandra", a specialty coffee & brunch cafe in Mumbai, India. Visual style: warm, inviting, natural light, cosy. Photorealistic.
Indian context — people, settings, food should feel authentically local. If text is included, render it exactly as written, large, legible, correctly spelled. No watermarks.
Create: overhead shot of a brunch plate (masala omelette, sourdough toast, filter coffee in a steel tumbler) on a wooden table, morning light. Bold text at the top: "Weekend Special" and smaller text below: "Sat–Sun, 9 AM onwards".`;

console.log(`model: ${modelId}`);
const t = Date.now();
const result = await generateText({
  model: google(modelId),
  prompt,
  providerOptions: {
    google: { responseModalities: ["TEXT", "IMAGE"], imageConfig: { aspectRatio: "4:5", imageOutputOptions: { mimeType: "image/png" } } },
  },
});
const ms = Date.now() - t;
const img = result.files.find((f) => f.mediaType.startsWith("image/"));
if (!img) {
  console.log(`✗ no image in ${ms}ms. text: ${result.text.slice(0, 300)}`);
  process.exit(1);
}
const path = `${out}/creative-${modelId}.png`;
writeFileSync(path, img.uint8Array);
console.log(`✓ ${img.mediaType} ${(img.uint8Array.length / 1024).toFixed(0)} KB in ${ms}ms → ${path}`);
if (result.text.trim()) console.log(`  model note: ${result.text.trim().slice(0, 200)}`);
console.log(`  usage: ${JSON.stringify(result.usage.totalTokens)} tokens`);
