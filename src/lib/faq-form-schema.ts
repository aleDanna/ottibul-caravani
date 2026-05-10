import { z } from "zod";

const translation = z.object({
  locale: z.enum(["es", "ca", "en"]),
  question: z.string().min(2),
  answer: z.string().min(2),
});

export const faqFormSchema = z.object({
  status: z.enum(["draft", "published"]),
  sortOrder: z.coerce.number().int().default(0),
  translations: z.array(translation).length(3),
});

export type FaqFormInput = z.infer<typeof faqFormSchema>;

export function validateForPublish(input: FaqFormInput): string[] {
  const errors: string[] = [];
  if (input.status === "published") {
    const locales = input.translations.map((t) => t.locale);
    if (!["es", "ca", "en"].every((l) => locales.includes(l as "es"))) {
      errors.push("All 3 translations (es/ca/en) required to publish");
    }
  }
  return errors;
}
