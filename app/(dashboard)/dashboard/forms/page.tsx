import type { Metadata } from "next";
import { FolderOpen } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { FormCard } from "@/components/forms/FormCard";
import { NewFormDialog } from "@/components/forms/NewFormDialog";

export const metadata: Metadata = {
  title: "Forms | Formly",
};

export default async function FormsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const orgId = session.user.orgId;

  if (!orgId) {
    redirect("/onboarding");
  }

  const forms = await prisma.form.findMany({
    where: { orgId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      published: true,
      _count: {
        select: {
          submissions: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
            Forms
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Create, share, and manage the forms in this workspace.
          </p>
        </div>
        <NewFormDialog />
      </div>

      {forms.length > 0 ? (
        <div className="animate-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {forms.map((form) => (
            <FormCard
              key={form.id}
              form={{
                id: form.id,
                title: form.title,
                slug: form.slug,
                published: form.published,
                submissionCount: form._count.submissions,
              }}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No forms yet"
          description="Create your first form and it will appear here."
          action={<NewFormDialog />}
          className="min-h-80"
        />
      )}
    </div>
  );
}
