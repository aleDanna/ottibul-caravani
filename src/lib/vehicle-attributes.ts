import { z } from "zod";

const yearMax = new Date().getFullYear() + 1;

export const camperAttributes = z.object({
  berths: z.number().int().min(1).max(10),
  travelSeats: z.number().int().min(1).max(10),
  lengthM: z.number().min(2).max(15),
  year: z.number().int().min(1980).max(yearMax),
  transmission: z.enum(["manual", "automatic"]),
  licenseRequired: z.enum(["B", "C1", "C"]),
  hasKitchen: z.boolean().optional(),
  hasBathroom: z.boolean().optional(),
});

export const motorcycleAttributes = z.object({
  displacementCc: z.number().int().min(50).max(2500),
  year: z.number().int().min(1980).max(yearMax),
  licenseRequired: z.enum(["AM", "A1", "A2", "A"]),
  helmetIncluded: z.boolean().optional(),
});

export const carAttributes = z.object({
  seats: z.number().int().min(2).max(9),
  year: z.number().int().min(1980).max(yearMax),
  transmission: z.enum(["manual", "automatic"]),
});

export const bicycleAttributes = z.object({
  type: z.enum(["mtb", "road", "city", "electric"]),
  gears: z.number().int().min(1).max(30).optional(),
});

export const boatAttributes = z.object({
  lengthM: z.number().min(2).max(50),
  year: z.number().int().min(1970).max(yearMax),
  licenseRequired: z.string().optional(),
  capacity: z.number().int().min(1).max(50),
});

export const vehicleAttributesSchemas = {
  camper: camperAttributes,
  motorcycle: motorcycleAttributes,
  car: carAttributes,
  bicycle: bicycleAttributes,
  boat: boatAttributes,
} as const;

export type VehicleType = keyof typeof vehicleAttributesSchemas;

export type CamperAttributes = z.infer<typeof camperAttributes>;
export type MotorcycleAttributes = z.infer<typeof motorcycleAttributes>;
export type CarAttributes = z.infer<typeof carAttributes>;
export type BicycleAttributes = z.infer<typeof bicycleAttributes>;
export type BoatAttributes = z.infer<typeof boatAttributes>;

export function validateAttributes(
  type: VehicleType,
  raw: unknown,
): { success: true; data: unknown } | { success: false; error: z.ZodError } {
  const schema = vehicleAttributesSchemas[type];
  if (!schema) throw new Error(`Unknown vehicle type: ${type}`);
  return schema.safeParse(raw);
}
