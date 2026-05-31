import { getServerSession } from "@/lib/auth/server";
import { db } from "@/lib/db";
import { userProfiles } from "@/lib/db/schema";
import { eq, count } from "drizzle-orm";
import { AppShell } from "@/components/AppShell";

export const dynamic = "force-dynamic";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getLocalSession() reads and locally verifies the Neon Auth session-data
  // cookie (JWT/HS256) without any outbound HTTP call — no redirects, no
  // "failed to forward action response" errors during server action re-renders.
  const session = await getServerSession();

  if (!session) {
    // Middleware already redirects unauthenticated real-page requests.
    // This branch is only hit during server action re-renders when the
    // session-data cookie isn't yet in scope — render children bare.
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

  if (!profile || profile.role === "workshop") {
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
