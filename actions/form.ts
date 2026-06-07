"use server";

import { revalidatePath } from "next/cache";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { deleteStoredBlobs } from "@/lib/blob";
import { prisma } from "@/lib/prisma";
import { generateSlug } from "@/lib/utils";
import {
  CreateFormSchema,
  DeleteFormSchema,
  GetFormAnalyticsSchema,
  PublishFormSchema,
  UpdateFormSchema,
} from "@/lib/validations/form";

interface DayCount {
  date: string;
  count: number;
}

async function verifyFormOwnership(formId: string, orgId: string) {
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      orgId,
    },
    select: {
      id: true,
    },
  });

  if (!form) {
    throw new Error("Form not found.");
  }
}

async function getOwnedForm(formId: string, orgId: string) {
  const form = await prisma.form.findFirst({
    where: {
      id: formId,
      orgId,
    },
  });

  if (!form) {
    throw new Error("Form not found.");
  }

  return form;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function buildLastThirtyDays() {
  const today = startOfDay(new Date());
  const firstDay = addDays(today, -29);

  return Array.from({ length: 30 }, (_, index) => {
    const date = addDays(firstDay, index);

    return {
      date,
      key: formatDateKey(date),
    };
  });
}

function getSubmissionsPerDay(submissions: { createdAt: Date }[]) {
  const days = buildLastThirtyDays();
  const countsByDate = new Map<string, number>(
    days.map((day) => [day.key, 0]),
  );

  submissions.forEach((submission) => {
    const key = formatDateKey(submission.createdAt);
    const currentCount = countsByDate.get(key);

    if (currentCount !== undefined) {
      countsByDate.set(key, currentCount + 1);
    }
  });

  return days.map<DayCount>((day) => ({
    date: day.key,
    count: countsByDate.get(day.key) ?? 0,
  }));
}

function getCompletionRate(answerCount: number, totalSubmissions: number) {
  if (totalSubmissions === 0) {
    return 0;
  }

  return Math.round((answerCount / totalSubmissions) * 100);
}

export async function createForm(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = CreateFormSchema.parse(input);
  const orgId = session.user.orgId;
  if (!orgId) throw new Error("Unauthorized");

  const form = await prisma.form.create({
    data: {
      orgId,
      title: data.title,
      slug: generateSlug(),
    },
  });

  revalidatePath("/dashboard/forms");
  return form;
}

export async function updateForm(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = UpdateFormSchema.parse(input);
  const orgId = session.user.orgId;
  if (!orgId) throw new Error("Unauthorized");

  await verifyFormOwnership(data.formId, orgId);

  const updateData: Prisma.FormUpdateManyMutationInput = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.successMsg !== undefined) {
    updateData.successMsg = data.successMsg;
  }

  if (data.published !== undefined) {
    updateData.published = data.published;
  }

  await prisma.form.updateMany({
    where: {
      id: data.formId,
      orgId,
    },
    data: updateData,
  });

  const form = await getOwnedForm(data.formId, orgId);

  revalidatePath("/dashboard/forms");
  revalidatePath(`/dashboard/forms/${data.formId}`);
  return form;
}

export async function deleteForm(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = DeleteFormSchema.parse(input);
  const orgId = session.user.orgId;
  if (!orgId) throw new Error("Unauthorized");

  const form = await prisma.form.findFirst({
    where: {
      id: data.formId,
      orgId,
    },
    select: {
      id: true,
      submissions: {
        select: {
          answers: {
            where: {
              field: {
                type: "FILE",
              },
            },
            select: {
              value: true,
            },
          },
        },
      },
    },
  });

  if (!form) {
    throw new Error("Form not found.");
  }

  await prisma.form.deleteMany({
    where: {
      id: data.formId,
      orgId,
    },
  });

  await deleteStoredBlobs(
    form.submissions.flatMap((submission) =>
      submission.answers.map((answer) => answer.value),
    ),
  );

  revalidatePath("/dashboard/forms");
  return { success: true };
}

export async function publishForm(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = PublishFormSchema.parse(input);
  const orgId = session.user.orgId;
  if (!orgId) throw new Error("Unauthorized");

  await verifyFormOwnership(data.formId, orgId);

  await prisma.form.updateMany({
    where: {
      id: data.formId,
      orgId,
    },
    data: {
      published: data.published,
    },
  });

  const form = await getOwnedForm(data.formId, orgId);

  revalidatePath("/dashboard/forms");
  revalidatePath(`/dashboard/forms/${data.formId}`);
  return form;
}

export async function getFormAnalytics(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = GetFormAnalyticsSchema.parse(input);
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
        where: {
          archivedAt: null,
        },
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          label: true,
          required: true,
        },
      },
    },
  });

  if (!form) {
    throw new Error("Form not found.");
  }

  const lastThirtyDays = buildLastThirtyDays();
  const firstDay = lastThirtyDays[0]?.date ?? startOfDay(new Date());
  const [totalSubmissions, recentSubmissions, answerCounts] =
    await Promise.all([
      prisma.submission.count({
        where: {
          formId: data.formId,
          form: {
            orgId,
          },
        },
      }),
      prisma.submission.findMany({
        where: {
          formId: data.formId,
          form: {
            orgId,
          },
          createdAt: {
            gte: firstDay,
          },
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.fieldAnswer.groupBy({
        by: ["fieldId"],
        where: {
          field: {
            formId: data.formId,
            archivedAt: null,
            form: {
              orgId,
            },
          },
          submission: {
            formId: data.formId,
            form: {
              orgId,
            },
          },
        },
        _count: {
          _all: true,
        },
      }),
    ]);
  const answerCountsByField = new Map(
    answerCounts.map((answerCount) => [
      answerCount.fieldId,
      answerCount._count._all,
    ]),
  );

  return {
    totalSubmissions,
    submissionsPerDay: getSubmissionsPerDay(recentSubmissions),
    fieldCompletionRates: form.fields
      .filter((field) => !field.required)
      .map((field) => ({
        fieldId: field.id,
        label: field.label,
        completionRate: getCompletionRate(
          answerCountsByField.get(field.id) ?? 0,
          totalSubmissions,
        ),
      })),
  };
}
