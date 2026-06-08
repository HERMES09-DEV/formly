import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";

export default function DashboardNotFound() {
  return (
    <section className="animate-fadeUp mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
        <FileQuestion aria-hidden="true" className="h-6 w-6" />
      </div>
      <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
        Not found
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
        We could not find that workspace page
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-gray-300">
        It may have been deleted, moved, or belong to another workspace.
      </p>
      <Link
        href="/dashboard/forms"
        className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-950 bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-px hover:brightness-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-100 dark:bg-gray-100 dark:text-gray-950 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900"
      >
        <Home aria-hidden="true" className="h-4 w-4" />
        Back to forms
      </Link>
    </section>
  );
}
