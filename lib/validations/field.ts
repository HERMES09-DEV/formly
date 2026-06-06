import { z } from "zod";

export const FieldTypeSchema = z.enum([
  "TEXT",
  "EMAIL",
  "LONG_TEXT",
  "DROPDOWN",
  "RATING",
  "FILE",
]);

export const CreateFieldSchema = z.object({
  formId: z.string().min(1, "Form id is required."),
  type: FieldTypeSchema,
  label: z
    .string()
    .trim()
    .min(1, "Field label is required.")
    .max(100, "Field label must be 100 characters or fewer."),
});

export const UpdateFieldSchema = z
  .object({
    fieldId: z.string().min(1, "Field id is required."),
    label: z
      .string()
      .trim()
      .min(1, "Field label is required.")
      .max(100, "Field label must be 100 characters or fewer.")
      .optional(),
    placeholder: z
      .string()
      .trim()
      .max(150, "Placeholder must be 150 characters or fewer.")
      .nullable()
      .optional(),
    required: z.boolean().optional(),
    options: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Options cannot be blank.")
          .max(100, "Options must be 100 characters or fewer."),
      )
      .max(50, "Use 50 options or fewer.")
      .nullable()
      .optional(),
    condition: z
      .object({
        triggerFieldId: z.string().min(1, "Trigger field is required."),
        triggerValue: z
          .string()
          .trim()
          .max(100, "Trigger value must be 100 characters or fewer."),
      })
      .nullable()
      .optional(),
  })
  .refine(
    (data) =>
      data.label !== undefined ||
      data.placeholder !== undefined ||
      data.required !== undefined ||
      data.options !== undefined ||
      data.condition !== undefined,
    {
      message: "Provide at least one field to update.",
    },
  );

export const DeleteFieldSchema = z.object({
  fieldId: z.string().min(1, "Field id is required."),
});

export const ReorderFieldsSchema = z.object({
  formId: z.string().min(1, "Form id is required."),
  orderedIds: z.array(z.string().min(1)).min(1, "Field order is required."),
});
