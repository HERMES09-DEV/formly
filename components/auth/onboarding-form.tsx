"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { createOrg, type CreateOrgState } from "@/actions/org";
import { Button } from "@/components/ui/Button";

const initialState: CreateOrgState = {
  error: null,
};

export function OnboardingForm() {
  const [state, formAction, isPending] = useActionState(
    createOrg,
    initialState,
  );

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    }
  }, [state.error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-950 dark:bg-gray-950 dark:text-gray-100">
      <section className="animate-fadeUp w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Create your workspace</h1>
          <p className="text-sm text-slate-600 dark:text-gray-300">
            Choose a workspace name to finish setting up Formly.
          </p>
        </div>

        <form action={formAction} className="mt-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Workspace name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="organization"
              required
              minLength={2}
              maxLength={50}
              aria-invalid={state.error ? "true" : "false"}
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-300 dark:focus:ring-gray-200/20"
              placeholder="Acme Studio"
            />
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="h-11 w-full"
            aria-label={isPending ? "Creating workspace" : undefined}
          >
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Create workspace"
            )}
          </Button>
        </form>
      </section>
    </main>
  );
}
