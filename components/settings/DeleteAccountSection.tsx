"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteAccount } from "@/actions/user";
import { Button } from "@/components/ui/Button";

const confirmMessage =
  "Are you sure? This will permanently delete your account, all your workspaces, forms, and every response ever collected. This cannot be undone.";

export function DeleteAccountSection() {
  const [isPending, startTransition] = useTransition();

  function handleDeleteAccount() {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    startTransition(() => {
      void deleteAccount().catch(() => {
        toast.error("Something went wrong. Please try again.");
      });
    });
  }

  return (
    <section className="mt-8 rounded-xl border border-red-200 bg-white p-6 shadow-sm dark:border-red-900 dark:bg-gray-900">
      <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
        Delete account
      </h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-gray-300">
        Permanently delete your account and all associated data including all
        workspaces, forms, and responses. This cannot be undone.
      </p>
      <div className="mt-5">
        <Button
          variant="secondary"
          disabled={isPending}
          onClick={handleDeleteAccount}
          className="border-red-300 text-red-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700 dark:border-red-900 dark:text-red-400 dark:hover:border-red-800 dark:hover:bg-red-950/30 dark:hover:text-red-300"
        >
          {isPending ? (
            <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          )}
          Delete my account
        </Button>
      </div>
    </section>
  );
}
