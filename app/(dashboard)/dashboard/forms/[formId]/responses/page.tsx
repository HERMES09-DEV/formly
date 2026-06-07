import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { ResponsesTable } from "@/components/responses/ResponsesTable";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Responses | Formly",
};

const pageSize = 20;

const ResponsesSearchParamsSchema = z.object({
  page: z
    .preprocess(
      (value) => (Array.isArray(value) ? value[0] : value),
      z.coerce.number().int().min(1).catch(1),
    )
    .optional(),
});

interface ResponsesPageProps {
  params: Promise<{
    formId: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResponsesPage({
  params,
  searchParams,
}: ResponsesPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const orgId = session.user.orgId;

  if (!orgId) {
    redirect("/onboarding");
  }

  const { formId } = await params;
  const { page } = ResponsesSearchParamsSchema.parse(await searchParams);
  const requestedPage = page ?? 1;
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      orgId,
    },
    select: {
      id: true,
      orgId: true,
      title: true,
      fields: {
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          label: true,
          type: true,
          archivedAt: true,
        },
      },
    },
  });

  if (!form || form.orgId !== orgId) {
    notFound();
  }

  const totalSubmissions = await prisma.submission.count({
    where: {
      formId,
      form: {
        orgId,
      },
    },
  });
  const totalPages = Math.max(1, Math.ceil(totalSubmissions / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const submissions = await prisma.submission.findMany({
    where: {
      formId,
      form: {
        orgId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    skip: (currentPage - 1) * pageSize,
    take: pageSize,
    select: {
      id: true,
      createdAt: true,
      answers: {
        where: {
          field: {
            form: {
              orgId,
            },
          },
        },
        select: {
          id: true,
          fieldId: true,
          value: true,
        },
      },
    },
  });

  return (
    <ResponsesTable
      form={{
        id: form.id,
        title: form.title,
      }}
      fields={form.fields.map((field) => ({
        ...field,
        archivedAt: field.archivedAt?.toISOString() ?? null,
      }))}
      submissions={submissions.map((submission) => ({
        id: submission.id,
        createdAt: submission.createdAt.toISOString(),
        answers: submission.answers,
      }))}
      pagination={{
        currentPage,
        totalPages,
        totalSubmissions,
        pageSize,
      }}
    />
  );
}
