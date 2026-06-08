import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "animate-fadeIn flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white text-center dark:border-gray-700 dark:bg-gray-900",
        compact ? "p-6" : "min-h-72 p-8",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-gray-800 dark:text-gray-500">
        <Icon aria-hidden="true" className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-gray-100">
        {title}
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600 dark:text-gray-300">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
