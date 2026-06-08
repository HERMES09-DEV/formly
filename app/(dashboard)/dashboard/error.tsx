"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface DashboardErrorProps {
  reset: () => void;
}

export default function DashboardError({ reset }: DashboardErrorProps) {
  return (
    <section className="animate-fadeUp mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
        <AlertTriangle aria-hidden="true" className="h-6 w-6" />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
        Dashboard could not load
      </h1>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-gray-300">
        Something interrupted this view. Try again or return to your forms.
      </p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Button onClick={reset}>
          <RefreshCw aria-hidden="true" className="h-4 w-4" />
          Try again
        </Button>
        <Link
          href="/dashboard/forms"
          className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 transition-all duration-200 hover:-translate-y-px hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900"
        >
          Back to forms
        </Link>
      </div>
    </section>
  );
}
