import { MobileNav } from "./MobileNav";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}

export function AppShell({ children, userName, userRole }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-2xl mx-auto pb-20 min-h-screen">
        {children}
      </main>
      <MobileNav userName={userName} userRole={userRole} />
    </div>
  );
}
