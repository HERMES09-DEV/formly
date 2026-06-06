"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CreateFieldSchema,
  DeleteFieldSchema,
  ReorderFieldsSchema,
  UpdateFieldSchema,
} from "@/lib/validations/field";

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

async function getOwnedField(fieldId: string, orgId: string) {
  const field = await prisma.field.findFirst({
    where: {
      id: fieldId,
      form: {
        orgId,
      },
    },
    select: {
      id: true,
      formId: true,
    },
  });

  if (!field) {
    throw new Error("Field not found.");
  }

  return field;
}

async function verifyConditionTrigger(
  fieldId: string,
  formId: string,
  orgId: string,
  condition: { triggerFieldId: string; triggerValue: string },
) {
  if (condition.triggerFieldId === fieldId) {
    throw new Error("A field cannot depend on itself.");
  }

  const triggerField = await prisma.field.findFirst({
    where: {
      id: condition.triggerFieldId,
      formId,
      form: {
        orgId,
      },
      type: {
        in: ["DROPDOWN", "RATING"],
      },
    },
    select: {
      type: true,
    },
  });

  if (!triggerField) {
    throw new Error("Conditional trigger field not found.");
  }

  if (
    triggerField.type === "RATING" &&
    !["1", "2", "3", "4", "5"].includes(condition.triggerValue)
  ) {
    throw new Error("Rating conditions must equal a value from 1 to 5.");
  }
}

export async function createField(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = CreateFieldSchema.parse(input);
  const orgId = session.user.orgId;
  if (!orgId) throw new Error("Unauthorized");

  await verifyFormOwnership(data.formId, orgId);

  const orderAggregate = await prisma.field.aggregate({
    where: {
      formId: data.formId,
      form: {
        orgId,
      },
    },
    _max: {
      order: true,
    },
  });

  const field = await prisma.field.create({
    data: {
      formId: data.formId,
      type: data.type,
      label: data.label,
      order: (orderAggregate._max.order ?? -1) + 1,
    },
  });

  revalidatePath(`/dashboard/forms/${data.formId}`);
  return field;
}

export async function updateField(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = UpdateFieldSchema.parse(input);
  const orgId = session.user.orgId;
  if (!orgId) throw new Error("Unauthorized");

  const field = await getOwnedField(data.fieldId, orgId);
  const updateData: Prisma.FieldUpdateManyMutationInput = {};

  if (data.label !== undefined) {
    updateData.label = data.label;
  }

  if (data.placeholder !== undefined) {
    updateData.placeholder = data.placeholder;
  }

  if (data.required !== undefined) {
    updateData.required = data.required;
  }

  if (data.options !== undefined) {
    updateData.options = data.options === null ? Prisma.JsonNull : data.options;
  }

  if (data.condition !== undefined) {
    if (data.condition) {
      await verifyConditionTrigger(data.fieldId, field.formId, orgId, data.condition);
    }

    updateData.condition =
      data.condition === null ? Prisma.JsonNull : data.condition;
  }

  await prisma.field.updateMany({
    where: {
      id: data.fieldId,
      form: {
        orgId,
      },
    },
    data: updateData,
  });

  const updatedField = await prisma.field.findFirst({
    where: {
      id: data.fieldId,
      form: {
        orgId,
      },
    },
  });

  if (!updatedField) {
    throw new Error("Field not found.");
  }

  revalidatePath(`/dashboard/forms/${field.formId}`);
  return updatedField;
}

export async function deleteField(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = DeleteFieldSchema.parse(input);
  const orgId = session.user.orgId;
  if (!orgId) throw new Error("Unauthorized");

  const field = await getOwnedField(data.fieldId, orgId);

  await prisma.field.deleteMany({
    where: {
      id: data.fieldId,
      form: {
        orgId,
      },
    },
  });

  revalidatePath(`/dashboard/forms/${field.formId}`);
  return { success: true };
}

export async function reorderFields(input: unknown) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const data = ReorderFieldsSchema.parse(input);
  const orgId = session.user.orgId;
  if (!orgId) throw new Error("Unauthorized");

  await verifyFormOwnership(data.formId, orgId);

  const fieldCount = await prisma.field.count({
    where: {
      formId: data.formId,
      form: {
        orgId,
      },
      id: {
        in: data.orderedIds,
      },
    },
  });

  if (fieldCount !== data.orderedIds.length) {
    throw new Error("Field order contains invalid fields.");
  }

  await Promise.all(
    data.orderedIds.map((fieldId, order) =>
      prisma.field.update({
        where: {
          id: fieldId,
        },
        data: {
          order,
        },
      }),
    ),
  );

  revalidatePath(`/dashboard/forms/${data.formId}`);
  return { success: true };
}
