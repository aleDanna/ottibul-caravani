import bcrypt from "bcryptjs";
import { db } from "../src/db/client";
import { adminUsers } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const args = Object.fromEntries(
    process.argv
      .slice(2)
      .map((a) => a.split("="))
      .map(([k, v]) => [k.replace(/^--/, ""), v]),
  );
  const email = args.email;
  const password = args.password;
  const name = args.name ?? "Admin";

  if (!email || !password) {
    console.error("Usage: pnpm db:seed:admin --email=... --password=... [--name=...]");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [existing] = await db.select().from(adminUsers).where(eq(adminUsers.email, email)).limit(1);

  if (existing) {
    await db.update(adminUsers).set({ passwordHash, name }).where(eq(adminUsers.email, email));
    console.log(`Updated admin user: ${email}`);
  } else {
    await db.insert(adminUsers).values({ email, passwordHash, name });
    console.log(`Created admin user: ${email}`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
