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
            Continue with your preferred account.
          </p>
        </div>

        <div className="mt-6 space-y-3">
          <form
            action={async () => {
              "use server";

              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <SubmitButton
              pendingLabel="Continuing with Google"
              className="h-11 w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
              variant="secondary"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continue with Google
            </SubmitButton>
          </form>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            <hr className="flex-1 border-gray-200 dark:border-gray-700" />
            <span>or</span>
            <hr className="flex-1 border-gray-200 dark:border-gray-700" />
          </div>

          <form
            action={async () => {
              "use server";

              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <SubmitButton
              pendingLabel="Continuing with GitHub"
              className="h-11 w-full bg-gray-900 text-white dark:border-gray-700 dark:bg-gray-700 dark:text-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current"
              >
                <path d="M12 .7a11.3 11.3 0 0 0-3.6 22c.6.1.8-.2.8-.5v-2c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1-.8.1-.8.1-.8 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.6.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.5A11.3 11.3 0 0 0 12 .7Z" />
              </svg>
              Continue with GitHub
            </SubmitButton>
          </form>
        </div>
      </section>
    </main>
  );
}
