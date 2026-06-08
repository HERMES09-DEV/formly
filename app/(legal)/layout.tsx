import Link from "next/link";
import type { ReactNode } from "react";

interface LegalLayoutProps {
  children: ReactNode;
}

export default function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-white px-6 py-12 text-slate-950 dark:bg-gray-950 dark:text-gray-100"
    >
      <div className="mx-auto max-w-2xl">
        <Link
          href="/dashboard"
          className="inline-flex text-sm font-medium text-slate-500 transition-colors hover:text-slate-950 dark:text-gray-400 dark:hover:text-gray-100"
        >
          &larr; Back to Formly
        </Link>
        <div className="mt-10">{children}</div>
      </div>
    </main>
  );
}
