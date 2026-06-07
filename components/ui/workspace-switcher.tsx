"use client";

import { Building2, ChevronDown, Loader2 } from "lucide-react";
import { useId, useTransition } from "react";
import { toast } from "sonner";
import { switchOrg } from "@/actions/org";
import { cn } from "@/lib/utils";

export interface WorkspaceOption {
  id: string;
  name: string;
  role: "OWNER" | "MEMBER";
}

interface WorkspaceSwitcherProps {
  activeOrgId: string;
  workspaces: WorkspaceOption[];
  className?: string;
}

export function WorkspaceSwitcher({
  activeOrgId,
  workspaces,
  className,
}: WorkspaceSwitcherProps) {
  const selectId = useId();
  const [isPending, startTransition] = useTransition();

  function handleChange(orgId: string) {
    if (orgId === activeOrgId) {
      return;
    }

    startTransition(() => {
      void switchOrg({ orgId })
        .then(() => {
          window.location.assign("/dashboard");
        })
        .catch((error: unknown) => {
          toast.error(
            error instanceof Error
              ? error.message
              : "Could not switch workspace.",
          );
        });
    });
  }

  return (
    <div className={cn("relative min-w-0", className)}>
      <label htmlFor={selectId} className="sr-only">
        Active workspace
      </label>
      <Building2
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-gray-400"
      />
      <select
        id={selectId}
        value={activeOrgId}
        disabled={isPending}
        onChange={(event) => handleChange(event.target.value)}
        className="h-10 w-full appearance-none truncate rounded-md border border-slate-200 bg-white py-0 pl-9 pr-9 text-sm font-medium text-slate-950 outline-none transition-colors hover:border-slate-300 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 disabled:cursor-wait disabled:opacity-70 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-600 dark:focus:border-gray-300 dark:focus:ring-gray-200/20"
      >
        {workspaces.map((workspace) => (
          <option key={workspace.id} value={workspace.id}>
            {workspace.name}
          </option>
        ))}
      </select>
      {isPending ? (
        <Loader2
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-500 dark:text-gray-400"
        />
      ) : (
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-gray-400"
        />
      )}
    </div>
  );
}
