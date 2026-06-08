import { LoadingShell } from "@/components/ui/loading-shell";

export default function LoginLoading() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-gray-950 dark:text-gray-100">
      <LoadingShell
        title="Opening sign in"
        description="Preparing your secure sign-in options."
      />
    </main>
  );
}
