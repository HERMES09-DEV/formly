import type { Metadata } from "next";
import { Users } from "lucide-react";
import Link from "next/link";
import { DeleteAccountSection } from "@/components/settings/DeleteAccountSection";

export const metadata: Metadata = {
  title: "Settings | Formly",
};

export default function SettingsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
          Manage workspace access and account controls.
        </p>
      </div>

      <Link
        href="/dashboard/settings/members"
        className="group flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-px hover:border-slate-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600"
      >
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-slate-950 group-hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:group-hover:bg-gray-100 dark:group-hover:text-gray-950">
            <Users aria-hidden="true" className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-950 dark:text-gray-100">
              Members
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
              Invite teammates, review pending invites, and manage access.
            </p>
          </div>
        </div>
      </Link>

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-red-600 dark:text-red-400">
          Danger zone
        </h2>
        <DeleteAccountSection />
      </div>
    </div>
  );
}
