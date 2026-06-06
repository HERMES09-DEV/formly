import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/ui/Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!session.user.orgId) {
    redirect("/onboarding");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar
        orgId={session.user.orgId}
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
      />
      <main className="animate-fadeUp min-h-screen px-4 pb-24 pt-6 sm:px-6 md:px-8 md:pt-20 lg:ml-60 lg:py-8">
        {children}
      </main>
    </div>
  );
}
