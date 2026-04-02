import { z } from "zod";

export const onboardingSchema = z.object({
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  image: z.string().url().optional(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;
