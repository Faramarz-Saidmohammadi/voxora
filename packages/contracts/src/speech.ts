import { z } from "zod";

export const speechRequestSchema = z.object({
  text: z.string().trim().min(1).max(5_000),
  locale: z
    .string()
    .trim()
    .regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/, "Use a BCP 47 locale such as en-US"),
  voice: z.string().trim().min(1).max(80).default("calm"),
  format: z.enum(["mp3", "wav", "ogg"]).default("mp3"),
});

export type SpeechRequestInput = z.infer<typeof speechRequestSchema>;
