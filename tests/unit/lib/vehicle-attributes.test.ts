import { describe, it, expect } from "vitest";
import { validateAttributes } from "@/lib/vehicle-attributes";

describe("vehicle attributes schemas", () => {
  it("accepts valid camper attributes", () => {
    const result = validateAttributes("camper", {
      berths: 4,
      travelSeats: 5,
      lengthM: 6.4,
      year: 2023,
      transmission: "automatic",
      licenseRequired: "B",
    });
    expect(result.success).toBe(true);
  });

  it("rejects camper with invalid berths", () => {
    const result = validateAttributes("camper", { berths: -1, year: 2020 });
    expect(result.success).toBe(false);
  });

  it("accepts valid motorcycle attributes", () => {
    const result = validateAttributes("motorcycle", {
      displacementCc: 650,
      year: 2022,
      licenseRequired: "A2",
    });
    expect(result.success).toBe(true);
  });

  it("rejects motorcycle with too-low displacement", () => {
    const result = validateAttributes("motorcycle", {
      displacementCc: 30,
      year: 2022,
      licenseRequired: "A2",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid car attributes", () => {
    const result = validateAttributes("car", {
      seats: 5,
      year: 2024,
      transmission: "manual",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid bicycle attributes", () => {
    const result = validateAttributes("bicycle", { type: "mtb", gears: 21 });
    expect(result.success).toBe(true);
  });

  it("accepts valid boat attributes", () => {
    const result = validateAttributes("boat", {
      lengthM: 8,
      year: 2020,
      capacity: 6,
    });
    expect(result.success).toBe(true);
  });

  it("throws on unknown vehicle type", () => {
    expect(() => validateAttributes("spaceship" as never, {})).toThrow();
  });
});
