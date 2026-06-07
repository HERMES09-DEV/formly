"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GetAllSubmissionsForExportSchema } from "@/lib/validations/submission";

export async function getAllSubmissionsForExport(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = GetAllSubmissionsForExportSchema.parse(input);
  const orgId = session.user.orgId;
  if (!orgId) throw new Error("Unauthorized");

  const form = await prisma.form.findFirst({
    where: {
      id: data.formId,
      orgId,
    },
    select: {
      id: true,
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

  if (!form) {
    throw new Error("Form not found.");
  }

  const submissions = await prisma.submission.findMany({
    where: {
      formId: data.formId,
      form: {
        orgId,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
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

  return {
    fields: form.fields.map((field) => ({
      ...field,
      archivedAt: field.archivedAt?.toISOString() ?? null,
    })),
    submissions: submissions.map((submission) => ({
      id: submission.id,
      createdAt: submission.createdAt.toISOString(),
      answers: submission.answers,
    })),
  };
}
