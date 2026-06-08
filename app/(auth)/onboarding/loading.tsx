import { LoadingShell } from "@/components/ui/loading-shell";

export default function OnboardingLoading() {
  return (
    <main
      id="main-content"
      className="min-h-screen bg-slate-50 text-slate-950 dark:bg-gray-950 dark:text-gray-100"
    >
      <LoadingShell
        title="Preparing workspace setup"
        description="Getting your first workspace ready."
      />
    </main>
  );
}
