import { getServerSession } from "@/lib/auth/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function RootPage() {
  const session = await getServerSession();
  if (session) redirect("/fabrics");
  redirect("/auth/sign-in");
}
