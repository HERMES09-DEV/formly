import { z } from "zod";

export const CreateFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Form title is required.")
    .max(100, "Form title must be 100 characters or fewer."),
});

export const UpdateFormSchema = z
  .object({
    formId: z.string().min(1, "Form id is required."),
    title: z
      .string()
      .trim()
      .min(1, "Form title is required.")
      .max(100, "Form title must be 100 characters or fewer.")
      .optional(),
    successMsg: z
      .string()
      .trim()
      .max(500, "Success message must be 500 characters or fewer.")
      .nullable()
      .optional(),
    published: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.title !== undefined ||
      data.successMsg !== undefined ||
      data.published !== undefined,
    {
      message: "Provide at least one field to update.",
    },
  );

export const DeleteFormSchema = z.object({
  formId: z.string().min(1, "Form id is required."),
});

export const PublishFormSchema = z.object({
  formId: z.string().min(1, "Form id is required."),
  published: z.boolean(),
});

export const GetFormAnalyticsSchema = z.object({
  formId: z.string().min(1, "Form id is required."),
});
