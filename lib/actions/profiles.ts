"use server";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { getServerSession } from "@/lib/auth/server";
import { eq, count } from "drizzle-orm";

export async function ensureUserProfile() {
  const session = await getServerSession();
  if (!session) return null;

  const { id, email, name } = session.user;

  const [existing] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, id))
    .limit(1);

  if (existing) return existing;

  const [{ value: profileCount }] = await db
    .select({ value: count() })
    .from(userProfiles);

  const role =
    Number(profileCount) === 0 ? ("admin" as const) : ("staff" as const);

  try {
    const [created] = await db
      .insert(userProfiles)
      .values({ id, email, fullName: name ?? null, role })
      .returning();
    return created ?? null;
  } catch {
    const [fallback] = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.id, id))
      .limit(1);
    return fallback ?? null;
  }
}
