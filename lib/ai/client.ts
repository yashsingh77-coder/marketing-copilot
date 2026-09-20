import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import type { z } from "zod";

/**
 * Single place to swap the LLM provider. Every generator imports `model` from here.
 * To use OpenAI: `import { openai } from "@ai-sdk/openai"` and return `openai(process.env.AI_MODEL)`.
 */
export const model = anthropic(process.env.AI_MODEL ?? "claude-sonnet-4-5");

/** Thin wrapper over AI SDK 7's structured output so every generator reads the same. */
export async function generateStructured<T extends z.ZodTypeAny>(input: {
  schema: T;
  instructions: string;
  prompt: string;
}): Promise<z.infer<T>> {
  const { output } = await generateText({
    model,
    output: Output.object({ schema: input.schema }),
    instructions: input.instructions,
    prompt: input.prompt,
  });
  return output as z.infer<T>;
}

export const PROMPT_VERSION = "2026-09-20.1";
