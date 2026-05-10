import { describe, it, expect, beforeAll } from "vitest";
import { signPayload, verifyPayload } from "@/lib/hmac";

beforeAll(() => {
  process.env.AUTH_SECRET = "test-secret-32-bytes-test-secret-32";
});

describe("hmac sign/verify", () => {
  it("round-trips a payload", () => {
    const signed = signPayload({ url: "https://wa.me/1?text=hi" });
    const result = verifyPayload<{ url: string }>(signed);
    expect(result.valid).toBe(true);
    if (result.valid) expect(result.payload).toEqual({ url: "https://wa.me/1?text=hi" });
  });

  it("rejects tampered signature", () => {
    const signed = signPayload({ url: "a" });
    const [body] = signed.split(".");
    const tampered = `${body}.deadbeefdeadbeefdeadbe`;
    const result = verifyPayload(tampered);
    expect(result.valid).toBe(false);
  });

  it("rejects malformed token", () => {
    expect(verifyPayload("not-a-token").valid).toBe(false);
    expect(verifyPayload("").valid).toBe(false);
    expect(verifyPayload("only-one-part").valid).toBe(false);
  });

  it("rejects payload with mismatched body but valid-looking sig length", () => {
    const signed = signPayload({ url: "a" });
    const [_body, sig] = signed.split(".");
    const wrong = `Zm9vLWJhcg.${sig}`; // body is base64url 'foo-bar'
    const result = verifyPayload(wrong);
    expect(result.valid).toBe(false);
  });

  it("returns valid=false on JSON parse error after signature passes", () => {
    // Construct a token whose body is not valid JSON but signature checks out.
    // We sign a plain string then mangle the body's base64 decoding to invalid JSON.
    const raw = "not-json";
    const { createHmac } = require("node:crypto");
    const b64 = (s: string) =>
      Buffer.from(s, "utf8")
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");
    const body = b64(raw);
    const sig = b64(createHmac("sha256", process.env.AUTH_SECRET!).update(body).digest()).slice(
      0,
      22,
    );
    const result = verifyPayload(`${body}.${sig}`);
    expect(result.valid).toBe(false);
  });
});
