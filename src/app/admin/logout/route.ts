import { signOut } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function POST() {
  await signOut({ redirect: false });
  return NextResponse.redirect(new URL("/admin/login", process.env.AUTH_URL!));
}
