import { z } from "zod";
import { isValidPhoneNumber } from "libphonenumber-js";

export const inquirySchema = z
  .object({
    vehicleId: z.string().uuid(),
    locale: z.enum(["es", "ca", "en"]),
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().refine((v) => isValidPhoneNumber(v), { message: "invalid phone" }),
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
  });

export type InquiryInput = z.infer<typeof inquirySchema>;
