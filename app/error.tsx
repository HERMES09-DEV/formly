"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface ErrorPageProps {
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <main
      id="main-content"
      className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-950 dark:bg-gray-950 dark:text-gray-100"
    >
      <section className="animate-fadeUp w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
          <AlertTriangle aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
          Something went wrong
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-gray-300">
          The page could not finish loading. Try again, or head back to your
          workspace.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset}>
            <RefreshCw aria-hidden="true" className="h-4 w-4" />
            Try again
          </Button>
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 transition-all duration-200 hover:-translate-y-px hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900"
          >
            Back to dashboard
          </Link>
        </div>
      </section>
    </main>
  );
}
