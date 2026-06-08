import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/ui/Sidebar";
import { PageTransition } from "@/components/ui/page-transition";
import { prisma } from "@/lib/prisma";

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

  const [account, memberships] = await Promise.all([
    prisma.account.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        id: "asc",
      },
      select: {
        provider: true,
      },
    }),
    prisma.orgMember.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        id: "asc",
      },
      select: {
        role: true,
        org: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-gray-950 dark:text-gray-100">
      <Sidebar
        activeOrgId={session.user.orgId}
        signInProvider={account?.provider ?? null}
        user={{
          name: session.user.name,
          email: session.user.email,
          image: session.user.image,
        }}
        workspaces={memberships.map((membership) => ({
          id: membership.org.id,
          name: membership.org.name,
          role: membership.role,
        }))}
      />
      <main
        id="main-content"
        className="min-h-screen px-4 pb-24 pt-20 sm:px-6 md:px-8 lg:ml-60 lg:py-8"
      >
        <PageTransition>{children}</PageTransition>
      </main>
    </div>
  );
}
