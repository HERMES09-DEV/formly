"use client";

import { BarChart2, Inbox, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface FormNavTabsProps {
  formId: string;
  className?: string;
}

const tabs = [
  {
    segment: "responses",
    label: "Responses",
    icon: Inbox,
  },
  {
    segment: "analytics",
    label: "Analytics",
    icon: BarChart2,
  },
] satisfies {
  segment: string;
  label: string;
  icon: LucideIcon;
}[];

export function FormNavTabs({ formId, className }: FormNavTabsProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Form sections"
      className={cn(
        "inline-flex rounded-md border border-slate-300 bg-white p-1 dark:border-gray-700 dark:bg-gray-900",
        className,
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const href = `/dashboard/forms/${formId}/${tab.segment}`;
        const isActive =
          pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={tab.segment}
            href={href}
            className={cn(
              "inline-flex h-8 items-center justify-center gap-2 rounded px-3 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
              isActive &&
                "bg-slate-950 text-white hover:bg-slate-950 hover:text-white dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-gray-100 dark:hover:text-gray-950",
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
