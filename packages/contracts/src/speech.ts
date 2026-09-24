import { z } from "zod";

const localeSchema = z
  .string()
  .trim()
  .regex(/^[a-z]{2,3}(?:-[A-Z]{2})?$/, "Use a BCP 47 locale such as en-US");

export const speechRequestSchema = z.object({
  text: z.string().trim().min(1).max(5_000),
  locale: localeSchema,
  voice: z.string().trim().min(1).max(80).default("calm"),
  format: z.enum(["mp3", "wav", "ogg"]).default("mp3"),
});

export const speechGenerationSchema = z.object({
  text: z.string().trim().min(1).max(1_200),
  locale: localeSchema,
  voice: z
    .enum([
      "alloy",
      "ash",
      "ballad",
      "coral",
      "echo",
      "fable",
      "nova",
      "onyx",
      "sage",
      "shimmer",
      "verse",
      "marin",
      "cedar",
    ])
    .default("cedar"),
  format: z.enum(["mp3", "wav", "ogg"]).default("mp3"),
  instructions: z.string().trim().min(1).max(300).optional(),
});

export type SpeechRequestInput = z.infer<typeof speechRequestSchema>;
export type SpeechGenerationInput = z.infer<typeof speechGenerationSchema>;
