import { getServerSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { AppShell } from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function AllRolesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession();

  if (!session) {
    return <>{children}</>;
  }

  const { id, email, name } = session.user;

  let [profile] = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.id, id))
    .limit(1);

  if (!profile) {
    const [{ value: profileCount }] = await db
      .select({ value: count() })
      .from(userProfiles);

    const role =
      Number(profileCount) === 0 ? ("admin" as const) : ("staff" as const);

    try {
      const inserted = await db
        .insert(userProfiles)
        .values({ id, email, fullName: name ?? null, role })
        .returning();
      profile = inserted[0];
    } catch {
      const [fallback] = await db
        .select()
        .from(userProfiles)
        .where(eq(userProfiles.id, id))
        .limit(1);
      profile = fallback;
    }
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <p className="text-muted-foreground text-sm text-center">
          Your account doesn&apos;t have access to this area yet. Contact an admin.
        </p>
      </div>
    );
  }

  return (
    <AppShell userName={name ?? email} userRole={profile.role}>
      {children}
    </AppShell>
  );
}
