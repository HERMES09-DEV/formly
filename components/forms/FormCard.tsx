"use client";

import {
  CircleDashed,
  Globe,
  Inbox,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteForm } from "@/actions/form";
import { CopyLinkButton } from "@/components/builder/CopyLinkButton";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface FormCardData {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  submissionCount: number;
}

interface FormCardProps {
  form: FormCardData;
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function FormCard({ form }: FormCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(`Delete "${form.title}"?`)) {
      return;
    }

    startTransition(() => {
      void deleteForm({ formId: form.id })
        .then(() => {
          toast.success("Form deleted");
          router.refresh();
        })
        .catch((deleteError: unknown) => {
          toast.error(getErrorMessage(deleteError));
        });
    });
  }

  return (
    <article className="group flex min-h-52 transform flex-col rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900 dark:hover:border-gray-600">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold text-slate-950 dark:text-gray-100">
            {form.title}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-600 dark:text-gray-300">
            <Inbox
              aria-hidden="true"
              className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
            />
            {form.submissionCount}{" "}
            {form.submissionCount === 1 ? "submission" : "submissions"}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-transform duration-300 group-hover:scale-[1.03]",
            form.published
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-slate-100 text-slate-600 dark:bg-gray-800 dark:text-gray-300",
          )}
        >
          {form.published ? (
            <Globe aria-hidden="true" className="h-3 w-3" />
          ) : (
            <CircleDashed aria-hidden="true" className="h-3 w-3" />
          )}
          {form.published ? "Published" : "Draft"}
        </span>
      </div>

      <div className="mt-auto space-y-3 pt-6">
        <div className="grid grid-cols-3 gap-2">
          <Link
            href={`/dashboard/forms/${form.id}`}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 transition-all duration-150 hover:bg-gray-100 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900"
          >
            <Pencil aria-hidden="true" className="h-4 w-4" />
            Edit
          </Link>
          <CopyLinkButton slug={form.slug} published={form.published} />
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={handleDelete}
            className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
            aria-label={isPending ? `Deleting ${form.title}` : undefined}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Trash2 aria-hidden="true" className="h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>
    </article>
  );
}
