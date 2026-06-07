import { createId } from "@paralleldrive/cuid2";

export const MAX_SUBMISSION_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_SUBMISSION_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
] as const;

export const SUBMISSION_FILE_ACCEPT =
  ALLOWED_SUBMISSION_FILE_TYPES.join(",");

export interface SubmissionFileMetadata {
  size: number;
  type: string;
}

export function getSubmissionFileError(file: SubmissionFileMetadata) {
  if (file.size <= 0) {
    return "A file is required.";
  }

  if (file.size > MAX_SUBMISSION_FILE_SIZE) {
    return "File must be 10 MB or smaller.";
  }

  if (
    !ALLOWED_SUBMISSION_FILE_TYPES.includes(
      file.type as (typeof ALLOWED_SUBMISSION_FILE_TYPES)[number],
    )
  ) {
    return "This file type is not supported.";
  }

  return null;
}

function sanitizeFileName(fileName: string) {
  const normalized = fileName
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/\.{2,}/g, ".")
    .replace(/-+/g, "-")
    .replace(/^[.-]+|[.-]+$/g, "")
    .slice(-120);

  return normalized || "upload";
}

export function createSubmissionBlobPath(
  formId: string,
  fieldId: string,
  fileName: string,
) {
  return `submissions/${formId}/${fieldId}/${createId()}-${sanitizeFileName(fileName)}`;
}

export function getSubmissionRateLimitKey(formId: string, ip: string) {
  return `${formId}:${ip}`;
}
