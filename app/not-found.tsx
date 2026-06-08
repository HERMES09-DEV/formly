import type { Metadata } from "next";
import { Compass, Home, LogIn } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found | Formly",
};

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-950 dark:bg-gray-950 dark:text-gray-100"
    >
      <section className="animate-fadeUp w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          <Compass aria-hidden="true" className="h-6 w-6" />
        </div>
        <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
          404
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
          This page is not available
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-gray-300">
          The link may have moved, or you may need access to view it.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-950 bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:-translate-y-px hover:brightness-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-100 dark:bg-gray-100 dark:text-gray-950 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900"
          >
            <Home aria-hidden="true" className="h-4 w-4" />
            Go to dashboard
          </Link>
          <Link
            href="/login"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 transition-all duration-200 hover:-translate-y-px hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900"
          >
            <LogIn aria-hidden="true" className="h-4 w-4" />
            Sign in
          </Link>
        </div>
      </section>
    </main>
  );
}
