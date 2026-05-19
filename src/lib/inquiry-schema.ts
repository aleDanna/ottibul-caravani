import { z } from "zod";
import { isValidPhoneNumber, parsePhoneNumberFromString } from "libphonenumber-js";
import { SUPPORTED_COUNTRIES } from "@/lib/countries";

export const inquirySchema = z
  .object({
    vehicleId: z.string().uuid(),
    locale: z.enum(["es", "ca", "en"]),
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phoneCountry: z.enum(SUPPORTED_COUNTRIES).default("ES"),
    phone: z.string().min(1),
    checkIn: z.coerce.date(),
    checkOut: z.coerce.date(),
    guests: z.coerce.number().int().min(1).max(20),
    message: z.string().max(2000).optional().or(z.literal("")),
    consent: z.union([z.literal("on"), z.literal(true), z.literal("true")]).transform(() => true),
    websiteUrl: z.string().max(0).optional().default(""), // honeypot
  })
  .refine((d) => d.checkOut > d.checkIn, {
    message: "checkOut must be after checkIn",
    path: ["checkOut"],
  })
  .refine((d) => isValidPhoneNumber(d.phone, d.phoneCountry), {
    message: "invalid phone",
    path: ["phone"],
  })
  .transform(({ phoneCountry, ...rest }) => ({
    ...rest,
    phone: parsePhoneNumberFromString(rest.phone, phoneCountry)!.number,
  }));

export type InquiryInput = z.infer<typeof inquirySchema>;
