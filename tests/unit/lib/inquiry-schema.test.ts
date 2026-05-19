import { describe, it, expect } from "vitest";
import { inquirySchema } from "@/lib/inquiry-schema";

function utcDateOffset(days: number) {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const base = {
  vehicleId: "11111111-1111-1111-8111-111111111111",
  locale: "es",
  name: "María González",
  email: "maria@example.com",
  checkIn: utcDateOffset(7),
  checkOut: utcDateOffset(14),
  guests: "2",
  message: "",
  consent: "on",
  websiteUrl: "",
};

describe("inquirySchema phone validation", () => {
  it("accepts a Spanish national number with phoneCountry=ES and normalizes to E.164", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "666 12 34 56",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+34666123456");
    }
  });

  it("accepts an already-E.164 number and leaves it normalized", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "+34666123456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+34666123456");
    }
  });

  it("trusts the + prefix when the dialed country mismatches the selected country", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "+39 333 123 4567",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+393331234567");
    }
  });

  it("validates a French number against phoneCountry=FR", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "FR",
      phone: "06 12 34 56 78",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+33612345678");
    }
  });

  it("rejects an obviously invalid number", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "123",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const phoneIssue = result.error.issues.find((i) => i.path[0] === "phone");
      expect(phoneIssue?.message).toBe("invalid phone");
    }
  });

  it("defaults phoneCountry to ES when omitted", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phone: "666123456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe("+34666123456");
    }
  });

  it("rejects an unsupported phoneCountry value", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "XX",
      phone: "+34666123456",
    });
    expect(result.success).toBe(false);
  });

  it("drops phoneCountry from the parsed output", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "666123456",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect((result.data as Record<string, unknown>).phoneCountry).toBeUndefined();
    }
  });
});

describe("inquirySchema date validation", () => {
  it("rejects a past checkIn", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "+34666123456",
      checkIn: utcDateOffset(-1),
      checkOut: utcDateOffset(3),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "checkIn");
      expect(issue?.message).toBe("checkIn must be tomorrow or later");
    }
  });

  it("rejects a checkIn equal to today (UTC)", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "+34666123456",
      checkIn: utcDateOffset(0),
      checkOut: utcDateOffset(3),
    });
    expect(result.success).toBe(false);
  });

  it("accepts a checkIn from tomorrow onwards", () => {
    const result = inquirySchema.safeParse({
      ...base,
      phoneCountry: "ES",
      phone: "+34666123456",
      checkIn: utcDateOffset(1),
      checkOut: utcDateOffset(5),
    });
    expect(result.success).toBe(true);
  });
});
