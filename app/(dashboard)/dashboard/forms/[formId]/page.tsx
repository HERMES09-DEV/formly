import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { FormBuilder } from "@/components/builder/FormBuilder";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface BuilderPageProps {
  params: Promise<{
    formId: string;
  }>;
}

export const metadata: Metadata = {
  title: "Form builder | Formly",
};

function getEmbedBaseUrl() {
  return process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

export default async function BuilderPage({ params }: BuilderPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const orgId = session.user.orgId;

  if (!orgId) {
    redirect("/onboarding");
  }

  const { formId } = await params;
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      orgId,
    },
    select: {
      id: true,
      orgId: true,
      title: true,
      slug: true,
      published: true,
      successMsg: true,
      fields: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          formId: true,
          type: true,
          label: true,
          placeholder: true,
          required: true,
          order: true,
          options: true,
          condition: true,
        },
      },
    },
  });

  if (!form || form.orgId !== orgId) {
    notFound();
  }

  return (
    <FormBuilder
      form={{
        id: form.id,
        title: form.title,
        slug: form.slug,
        published: form.published,
        successMsg: form.successMsg,
      }}
      initialFields={form.fields}
      embedBaseUrl={getEmbedBaseUrl()}
    />
  );
}
