import { SideNav } from "./SideNav";

interface AppShellProps {
  children: React.ReactNode;
  userName: string;
  userRole: string;
}

export function AppShell({ children, userName, userRole }: AppShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <SideNav userName={userName} userRole={userRole} />
      <main className="max-w-2xl mx-auto pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
