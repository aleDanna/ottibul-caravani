import { createHmac, timingSafeEqual } from "node:crypto";

function getSecret(): string {
  const s = process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET not set");
  return s;
}

function base64url(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64url(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

export function signPayload(payload: unknown): string {
  const body = base64url(Buffer.from(JSON.stringify(payload), "utf8"));
  const sig = base64url(createHmac("sha256", getSecret()).update(body).digest()).slice(0, 22);
  return `${body}.${sig}`;
}

export function verifyPayload<T = unknown>(
  token: string,
): { valid: true; payload: T } | { valid: false } {
  if (!token || !token.includes(".")) return { valid: false };
  const [body, sig] = token.split(".");
  if (!body || !sig) return { valid: false };
  const expected = base64url(createHmac("sha256", getSecret()).update(body).digest()).slice(0, 22);

  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return { valid: false };

  try {
    const payload = JSON.parse(fromBase64url(body).toString("utf8")) as T;
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
