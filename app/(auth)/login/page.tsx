import type { Metadata } from "next";
import { signIn } from "@/lib/auth";
import { SubmitButton } from "@/components/ui/submit-button";

export const metadata: Metadata = {
  title: "Sign in | Formly",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 text-slate-950 dark:bg-gray-950 dark:text-gray-100">
      <section className="animate-fadeUp w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold">Sign in to Formly</h1>
          <p className="text-sm text-slate-600 dark:text-gray-300">
            Use GitHub or a magic link to continue.
          </p>
        </div>

        <form
          action={async () => {
            "use server";

            await signIn("github", { redirectTo: "/dashboard" });
          }}
          className="mt-6"
        >
          <SubmitButton className="h-11 w-full">
            Sign in with GitHub
          </SubmitButton>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-gray-400">
            or
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <form
          action={async (formData) => {
            "use server";

            await signIn("resend", formData);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="redirectTo" value="/dashboard" />
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors placeholder:text-slate-400 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-gray-300 dark:focus:ring-gray-200/20"
              placeholder="you@example.com"
            />
          </div>
          <SubmitButton className="h-11 w-full" variant="secondary">
            Send magic link
          </SubmitButton>
        </form>
      </section>
    </main>
  );
}
