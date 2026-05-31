import { auth } from "@/auth";

export interface ServerSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    image?: string | null;
  };
}

// Reads the NextAuth JWT from the session cookie and verifies it locally.
// No outbound HTTP calls — safe to use in server actions and server components.
export async function getServerSession(): Promise<ServerSession | null> {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) return null;
  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    },
  };
}
