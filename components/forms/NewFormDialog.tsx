"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";
import { createForm } from "@/actions/form";
import { Button } from "@/components/ui/Button";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

export function NewFormDialog() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();

  function closeDialog() {
    if (isPending) {
      return;
    }

    setIsOpen(false);
    setTitle("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(() => {
      void createForm({ title })
        .then((form) => {
          setIsOpen(false);
          setTitle("");
          toast.success("Form created");
          router.push(`/dashboard/forms/${form.id}`);
          router.refresh();
        })
        .catch((createError: unknown) => {
          toast.error(getErrorMessage(createError));
        });
    });
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        <Plus aria-hidden="true" className="h-4 w-4" />
        New form
      </Button>

      {isOpen ? (
        <div className="animate-overlayIn fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 backdrop-blur-[2px]">
          <div className="animate-scaleIn w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-950 dark:text-gray-100">
                  New form
                </h2>
                <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
                  Name the form before opening the builder.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Close"
                title="Close"
                onClick={closeDialog}
                className="h-9 w-9 px-0"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-2">
                <label htmlFor="form-title" className="text-sm font-medium">
                  Title
                </label>
                <input
                  id="form-title"
                  name="title"
                  type="text"
                  required
                  minLength={1}
                  maxLength={100}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-300 dark:focus:ring-gray-200/20"
                  placeholder="Customer feedback"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="secondary"
                  disabled={isPending}
                  onClick={closeDialog}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  aria-label={isPending ? "Creating form" : undefined}
                >
                  {isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Create form"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
