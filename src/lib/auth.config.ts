import type { NextAuthConfig } from "next-auth";

// Edge-compatible NextAuth config: no providers, no DB.
// Used by `src/proxy.ts` to read/verify the session cookie in middleware.
// The full config (with Credentials + DB-backed authorize) lives in `auth.ts`
// and is consumed by Server Actions, Server Components, and the API route handler.
//
// Both configs share the same session strategy and cookie defaults, so the
// cookie set by `signIn` in `auth.ts` is readable here.
export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  pages: { signIn: "/admin/login" },
  providers: [],
} satisfies NextAuthConfig;
