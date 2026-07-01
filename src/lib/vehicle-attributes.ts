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

// The fleet only rents campers. Other vehicle categories (motorcycle, car,
// bicycle, boat) were removed from the public catalogue and the admin UI. The
// vehicle_type DB enum still lists them for backwards compatibility, but no new
// records of those types can be created.
export const vehicleAttributesSchemas = {
  camper: camperAttributes,
} as const;

export type VehicleType = keyof typeof vehicleAttributesSchemas;

export type CamperAttributes = z.infer<typeof camperAttributes>;

export function validateAttributes(
  type: VehicleType,
  raw: unknown,
): { success: true; data: unknown } | { success: false; error: z.ZodError } {
  const schema = vehicleAttributesSchemas[type];
  if (!schema) throw new Error(`Unknown vehicle type: ${type}`);
  return schema.safeParse(raw);
}
