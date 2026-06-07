import type { Metadata } from "next";
import { ArrowRight, FileText } from "lucide-react";
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
        className="group block rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 transition-all duration-300 group-hover:scale-105 group-hover:bg-slate-950 group-hover:text-white dark:bg-gray-800 dark:text-gray-200 dark:group-hover:bg-gray-100 dark:group-hover:text-gray-950">
              <FileText aria-hidden="true" className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-slate-950 dark:text-gray-100">
                Go to forms
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
                Create your first form or manage existing forms.
              </p>
            </div>
          </div>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-slate-100 group-hover:text-slate-950 dark:text-gray-400 dark:group-hover:bg-gray-800 dark:group-hover:text-gray-100">
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </span>
        </div>
      </Link>
    </div>
  );
}
