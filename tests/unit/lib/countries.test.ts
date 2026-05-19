import { describe, it, expect } from "vitest";
import { SUPPORTED_COUNTRIES, COUNTRY_OPTIONS } from "@/lib/countries";

describe("countries", () => {
  it("lists ES first as the default", () => {
    expect(SUPPORTED_COUNTRIES[0]).toBe("ES");
  });

  it("has matching entries between SUPPORTED_COUNTRIES and COUNTRY_OPTIONS", () => {
    expect(COUNTRY_OPTIONS.map((c) => c.code)).toEqual([...SUPPORTED_COUNTRIES]);
  });

  it("provides flag, native name, and dial code for every country", () => {
    for (const c of COUNTRY_OPTIONS) {
      expect(c.flag).toMatch(/^\p{Regional_Indicator}\p{Regional_Indicator}$/u);
      expect(c.nativeName.length).toBeGreaterThan(0);
      expect(c.dialCode).toMatch(/^\+\d{1,4}$/);
    }
  });

  it("has no duplicate ISO codes", () => {
    const codes = COUNTRY_OPTIONS.map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
