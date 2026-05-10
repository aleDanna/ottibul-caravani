import { describe, it, expect } from "vitest";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

describe("buildWhatsAppUrl", () => {
  const base = {
    ownerPhone: "34666123456",
    vehicleTitle: "Fiat Ducato 2023",
    checkIn: new Date("2026-06-15"),
    checkOut: new Date("2026-06-22"),
    guests: 4,
    customerName: "Mario Rossi",
    customerEmail: "mario@example.com",
    customerPhone: "+39 123 4567890",
  };

  it("builds Spanish URL with all fields", () => {
    const url = buildWhatsAppUrl({ ...base, locale: "es" });
    expect(url).toMatch(/^https:\/\/wa\.me\/34666123456\?text=/);
    const text = decodeURIComponent(url.split("text=")[1]);
    expect(text).toContain("Hola");
    expect(text).toContain("Fiat Ducato 2023");
    expect(text).toContain("Mario Rossi");
    expect(text).toContain("4 personas");
  });

  it("builds Catalan URL", () => {
    const url = buildWhatsAppUrl({ ...base, locale: "ca" });
    const text = decodeURIComponent(url.split("text=")[1]);
    expect(text).toContain("Hola"); // Catalan also uses Hola
    expect(text).toContain("persones");
  });

  it("builds English URL", () => {
    const url = buildWhatsAppUrl({ ...base, locale: "en" });
    const text = decodeURIComponent(url.split("text=")[1]);
    expect(text).toContain("Hello");
    expect(text).toContain("people");
  });

  it("includes optional message when provided", () => {
    const url = buildWhatsAppUrl({
      ...base,
      locale: "es",
      message: "Need pickup at airport",
    });
    const text = decodeURIComponent(url.split("text=")[1]);
    expect(text).toContain("Need pickup at airport");
  });

  it("omits optional message when undefined or empty", () => {
    const url1 = buildWhatsAppUrl({ ...base, locale: "es" });
    const url2 = buildWhatsAppUrl({ ...base, locale: "es", message: "" });
    expect(decodeURIComponent(url1.split("text=")[1])).not.toContain("undefined");
    expect(decodeURIComponent(url2.split("text=")[1])).not.toContain("undefined");
  });

  it("URL-encodes the text properly", () => {
    const url = buildWhatsAppUrl({ ...base, locale: "es" });
    // Special characters should be URL-encoded; spaces become %20 (or +; encodeURIComponent uses %20)
    expect(url).toContain("%20");
  });
});
