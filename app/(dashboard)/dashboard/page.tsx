import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Dashboard | Formly",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const orgId = session.user.orgId;

  if (!orgId) {
    redirect("/onboarding");
  }

  const org = await prisma.org.findUnique({
    where: { id: orgId },
    select: { name: true },
  });

  if (!org) {
    redirect("/onboarding");
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
          Welcome to {org.name}
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
          Start by creating and organizing forms for this workspace.
        </p>
      </div>

      <Link
        href="/dashboard/forms"
        className="block rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600 dark:hover:bg-gray-800"
      >
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-950 dark:text-gray-100">
              Go to forms
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
              Create your first form or manage existing forms.
            </p>
          </div>
          <span className="text-sm font-medium text-slate-950 dark:text-gray-100">
            Open
          </span>
        </div>
      </Link>
    </div>
  );
}
