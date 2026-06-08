import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingShellProps {
  title: string;
  description: string;
  className?: string;
}

export function LoadingShell({
  title,
  description,
  className,
}: LoadingShellProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "animate-fadeUp flex min-h-[60vh] w-full items-center justify-center px-4",
        className,
      )}
    >
      <section className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
          {title}
        </h1>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-300">
          {description}
        </p>
        <div className="mx-auto mt-6 max-w-xs space-y-2">
          <div className="h-2.5 animate-pulse rounded-full bg-slate-100 dark:bg-gray-800" />
          <div className="mx-auto h-2.5 w-3/4 animate-pulse rounded-full bg-slate-100 dark:bg-gray-800" />
        </div>
      </section>
    </div>
  );
}
