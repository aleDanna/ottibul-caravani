import { z } from "zod";

export const heroImageFormSchema = z.object({
  url: z.string().url(),
  altText: z.string().max(200).optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).default(0),
  status: z.enum(["draft", "published"]),
});

export type HeroImageFormInput = z.infer<typeof heroImageFormSchema>;
