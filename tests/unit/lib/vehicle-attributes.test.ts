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

  it("throws on unknown vehicle type", () => {
    expect(() => validateAttributes("spaceship" as never, {})).toThrow();
  });

  it("throws on vehicle types no longer offered", () => {
    expect(() => validateAttributes("motorcycle" as never, {})).toThrow();
    expect(() => validateAttributes("boat" as never, {})).toThrow();
  });
});
