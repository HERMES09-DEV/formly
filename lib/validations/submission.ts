import { z } from "zod";
import { getSubmissionFileError } from "@/lib/submission-file";

const emailFormatSchema = z.string().email();

export const SubmitFormParamsSchema = z.object({
  formId: z.string().min(1, "Form id is required."),
});

export const GetAllSubmissionsForExportSchema = z.object({
  formId: z.string().min(1, "Form id is required."),
});

export const OptionalSubmissionTextSchema = z
  .string()
  .trim()
  .max(10000, "Use 10000 characters or fewer.");

export const RequiredSubmissionTextSchema = OptionalSubmissionTextSchema.min(
  1,
  "This field is required.",
);

export const OptionalSubmissionEmailSchema = z
  .string()
  .trim()
  .max(320, "Use 320 characters or fewer.")
  .refine(
    (value) => value.length === 0 || emailFormatSchema.safeParse(value).success,
    "Enter a valid email address.",
  );

export const RequiredSubmissionEmailSchema = z
  .string()
  .trim()
  .min(1, "This field is required.")
  .email("Enter a valid email address.")
  .max(320, "Use 320 characters or fewer.");

export const RatingValueSchema = z.enum(["1", "2", "3", "4", "5"]);

export const NonEmptyFileSchema = z.custom<File>(
  (value) =>
    typeof File !== "undefined" && value instanceof File && value.size > 0,
  "A file is required.",
).superRefine((file, context) => {
  if (typeof File === "undefined" || !(file instanceof File)) {
    return;
  }

  const error = getSubmissionFileError(file);

  if (error) {
    context.addIssue({
      code: "custom",
      message: error,
    });
  }
});
