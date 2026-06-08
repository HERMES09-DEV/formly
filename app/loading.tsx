import { LoadingShell } from "@/components/ui/loading-shell";

export default function Loading() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-gray-950 dark:text-gray-100">
      <LoadingShell
        title="Getting Formly ready"
        description="Loading the next view."
      />
    </main>
  );
}
