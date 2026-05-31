"use server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export async function registerUser({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name?: string;
}): Promise<void> {
  const normalized = email.toLowerCase().trim();
  if (!normalized || !password) throw new Error("Email and password are required.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, normalized))
    .limit(1);

  if (existing) throw new Error("An account with this email already exists.");

  const hashed = await bcrypt.hash(password, 12);
  await db.insert(users).values({
    email: normalized,
    password: hashed,
    name: name?.trim() || null,
  });
}
