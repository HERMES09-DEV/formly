"use client";

import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  type FormEvent,
  useCallback,
  useRef,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { createForm } from "@/actions/form";
import { Button } from "@/components/ui/Button";
import { useModalA11y } from "@/components/ui/use-modal-a11y";

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
  const dialogRef = useRef<HTMLElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const closeDialog = useCallback(() => {
    if (isPending) {
      return;
    }

    setIsOpen(false);
    setTitle("");
  }, [isPending]);

  useModalA11y({
    isOpen,
    onClose: closeDialog,
    dialogRef,
    initialFocusRef: titleInputRef,
    preventClose: isPending,
  });

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
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="new-form-dialog-title"
            aria-describedby="new-form-dialog-description"
            tabIndex={-1}
            className="animate-scaleIn w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="relative text-center">
              <div className="px-10">
                <h2
                  id="new-form-dialog-title"
                  className="text-lg font-semibold text-slate-950 dark:text-gray-100"
                >
                  New form
                </h2>
                <p
                  id="new-form-dialog-description"
                  className="mt-1 text-sm text-slate-600 dark:text-gray-300"
                >
                  Name the form before opening the builder.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Close"
                title="Close"
                onClick={closeDialog}
                className="absolute -right-1 -top-1 h-9 w-9 px-0"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mx-auto mt-6 max-w-sm space-y-4"
            >
              <div className="space-y-2">
                <label htmlFor="form-title" className="text-sm font-medium">
                  Title
                </label>
                <input
                  id="form-title"
                  name="title"
                  type="text"
                  ref={titleInputRef}
                  required
                  minLength={1}
                  maxLength={100}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-300 dark:focus:ring-gray-200/20"
                  placeholder="Customer feedback"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
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
                  aria-busy={isPending}
                  aria-label={isPending ? "Creating form" : undefined}
                >
                  {isPending ? (
                    <>
                      <Loader2
                        aria-hidden="true"
                        className="h-4 w-4 animate-spin"
                      />
                      Creating form
                    </>
                  ) : (
                    "Create form"
                  )}
                </Button>
              </div>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}
