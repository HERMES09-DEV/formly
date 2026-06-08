import { LoadingShell } from "@/components/ui/loading-shell";

export default function PublicFormLoading() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-gray-950 dark:text-gray-100">
      <LoadingShell
        title="Loading form"
        description="Preparing the response fields."
      />
    </main>
  );
}
