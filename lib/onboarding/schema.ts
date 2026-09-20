import { z } from "zod";

export const OnboardingSchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string().min(1),
  sub_niche: z.string().max(80).nullable(),
  age_groups: z.array(z.string()).min(1),
  interests: z.array(z.string()).min(1).max(8),
  city: z.string().trim().min(2).max(60),
  area: z.string().trim().max(60).nullable(),
  weekly_hours: z.number().min(1).max(15),
  monthly_budget_inr: z.number().min(0).max(100000),
  voice: z.enum(["warm", "witty", "premium", "no-nonsense"]),
  hinglish: z.boolean(),
});

export type OnboardingInput = z.infer<typeof OnboardingSchema>;
