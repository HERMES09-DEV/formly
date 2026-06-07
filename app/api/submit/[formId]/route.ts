import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { put } from "@vercel/blob";
import type { FieldType } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import {
  type FieldCondition,
  getFieldCondition,
} from "@/lib/field-condition";
import { getStringOptions } from "@/lib/form-options";
import { prisma } from "@/lib/prisma";
import {
  NonEmptyFileSchema,
  OptionalSubmissionEmailSchema,
  OptionalSubmissionTextSchema,
  RatingValueSchema,
  RequiredSubmissionEmailSchema,
  RequiredSubmissionTextSchema,
  SubmitFormParamsSchema,
} from "@/lib/validations/submission";

export const runtime = "nodejs";

interface SubmitRouteContext {
  params: Promise<{
    formId: string;
  }>;
}

interface SubmitField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options: string[];
  condition: FieldCondition | null;
}

type FieldErrors = Record<string, string>;

type PendingAnswer =
  | {
      kind: "value";
      fieldId: string;
      value: string;
    }
  | {
      kind: "file";
      fieldId: string;
      file: File;
    };

let cachedRateLimit: Ratelimit | null | undefined;

function getRateLimit() {
  if (cachedRateLimit !== undefined) {
    return cachedRateLimit;
  }

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const hasUpstash = url?.startsWith("https://") && token;

  if (!hasUpstash) {
    cachedRateLimit = null;
    return cachedRateLimit;
  }

  cachedRateLimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    prefix: "formly:submit",
  });

  return cachedRateLimit;
}

function getRequestIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const forwardedIp = forwardedFor?.split(",")[0]?.trim();

  return (
    forwardedIp ||
    request.headers.get("x-real-ip")?.trim() ||
    "anonymous"
  );
}

function getStringEntry(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function getFirstIssueMessage(result: {
  success: false;
  error: { issues: { message: string }[] };
}) {
  return result.error.issues[0]?.message ?? "Invalid value.";
}

function validateTextField(field: SubmitField, value: string) {
  const schema = field.required
    ? RequiredSubmissionTextSchema
    : OptionalSubmissionTextSchema;
  const result = schema.safeParse(value);

  if (!result.success) {
    return {
      error: getFirstIssueMessage(result),
      value: null,
    };
  }

  return {
    error: null,
    value: result.data,
  };
}

function validateEmailField(field: SubmitField, value: string) {
  const schema = field.required
    ? RequiredSubmissionEmailSchema
    : OptionalSubmissionEmailSchema;
  const result = schema.safeParse(value);

  if (!result.success) {
    return {
      error: getFirstIssueMessage(result),
      value: null,
    };
  }

  return {
    error: null,
    value: result.data,
  };
}

function validateDropdownField(field: SubmitField, value: string) {
  const textResult = validateTextField(field, value);

  if (textResult.error || !textResult.value) {
    return textResult;
  }

  if (!field.options.includes(textResult.value)) {
    return {
      error: "Select a valid option.",
      value: null,
    };
  }

  return textResult;
}

function validateRatingField(field: SubmitField, value: string) {
  if (!value && field.required) {
    return {
      error: "This field is required.",
      value: null,
    };
  }

  if (!value) {
    return {
      error: null,
      value: "",
    };
  }

  const result = RatingValueSchema.safeParse(value);

  if (!result.success) {
    return {
      error: "Select a rating from 1 to 5.",
      value: null,
    };
  }

  return {
    error: null,
    value: result.data,
  };
}

function validateFileField(
  field: SubmitField,
  value: FormDataEntryValue | null,
) {
  const result = NonEmptyFileSchema.safeParse(value);

  if (!result.success && field.required) {
    return {
      error: getFirstIssueMessage(result),
      file: null,
    };
  }

  if (!result.success) {
    return {
      error: null,
      file: null,
    };
  }

  return {
    error: null,
    file: result.data,
  };
}

function getVisibleFields(fields: SubmitField[], formData: FormData) {
  const fieldsById = new Map(fields.map((field) => [field.id, field]));

  function isVisible(field: SubmitField, visiting: Set<string>): boolean {
    if (!field.condition) {
      return true;
    }

    if (visiting.has(field.id)) {
      return false;
    }

    const triggerField = fieldsById.get(field.condition.triggerFieldId);

    if (!triggerField) {
      return false;
    }

    const nextVisiting = new Set(visiting);
    nextVisiting.add(field.id);

    if (!isVisible(triggerField, nextVisiting)) {
      return false;
    }

    const triggerValue = getStringEntry(
      formData.get(field.condition.triggerFieldId),
    );

    return triggerValue === field.condition.triggerValue;
  }

  return fields.filter((field) => isVisible(field, new Set()));
}

function validateSubmission(fields: SubmitField[], formData: FormData) {
  const fieldErrors: FieldErrors = {};
  const pendingAnswers: PendingAnswer[] = [];

  fields.forEach((field) => {
    const entry = formData.get(field.id);
    const value = getStringEntry(entry);

    if (field.type === "FILE") {
      const fileResult = validateFileField(field, entry);

      if (fileResult.error) {
        fieldErrors[field.id] = fileResult.error;
      } else if (fileResult.file) {
        pendingAnswers.push({
          kind: "file",
          fieldId: field.id,
          file: fileResult.file,
        });
      }

      return;
    }

    const result =
      field.type === "EMAIL"
        ? validateEmailField(field, value)
        : field.type === "DROPDOWN"
          ? validateDropdownField(field, value)
          : field.type === "RATING"
            ? validateRatingField(field, value)
            : validateTextField(field, value);

    if (result.error) {
      fieldErrors[field.id] = result.error;
      return;
    }

    if (result.value) {
      pendingAnswers.push({
        kind: "value",
        fieldId: field.id,
        value: result.value,
      });
    }
  });

  return {
    fieldErrors,
    pendingAnswers,
  };
}

async function uploadFileAnswer(file: File) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return file.name;
  }

  let answerValue = "";

  try {
    const blob = await put(file.name, file, {
      access: "public",
      token,
    });
    answerValue = blob.url;
  } catch (blobError) {
    console.error("Blob upload failed:", blobError);
    answerValue = `[File: ${file.name}]`;
  }

  return answerValue;
}

async function resolveAnswerValues(pendingAnswers: PendingAnswer[]) {
  const answers: { fieldId: string; value: string }[] = [];

  for (const answer of pendingAnswers) {
    if (answer.kind === "value") {
      answers.push({
        fieldId: answer.fieldId,
        value: answer.value,
      });
    } else {
      answers.push({
        fieldId: answer.fieldId,
        value: await uploadFileAnswer(answer.file),
      });
    }
  }

  return answers;
}

async function enforceRateLimit(request: NextRequest) {
  const rateLimit = getRateLimit();

  if (!rateLimit) {
    return null;
  }

  const ip = getRequestIp(request);
  const result = await rateLimit.limit(ip, {
    ip,
    userAgent: request.headers.get("user-agent") ?? undefined,
  });

  if (result.success) {
    return null;
  }

  const retryAfter = Math.max(
    1,
    Math.ceil((result.reset - Date.now()) / 1000),
  );

  return NextResponse.json(
    { error: "Too many submissions. Try again shortly." },
    {
      status: 429,
      headers: {
        "Retry-After": String(retryAfter),
      },
    },
  );
}

export async function POST(request: NextRequest, context: SubmitRouteContext) {
  try {
    const params = SubmitFormParamsSchema.parse(await context.params);
    const form = await prisma.form.findUnique({
      where: {
        id: params.formId,
      },
      select: {
        id: true,
        published: true,
        fields: {
          orderBy: {
            order: "asc",
          },
          select: {
            id: true,
            type: true,
            label: true,
            required: true,
            options: true,
            condition: true,
          },
        },
      },
    });

    if (!form) {
      return NextResponse.json(
        { error: "Form not found." },
        { status: 404 },
      );
    }

    if (!form.published) {
      return NextResponse.json(
        { error: "This form is not accepting submissions." },
        { status: 403 },
      );
    }

    const rateLimitResponse = await enforceRateLimit(request);

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    const formData = await request.formData();
    const fields = form.fields.map((field) => ({
      id: field.id,
      type: field.type,
      label: field.label,
      required: field.required,
      options: getStringOptions(field.options),
      condition: getFieldCondition(field.condition),
    }));
    const visibleFields = getVisibleFields(fields, formData);
    const { fieldErrors, pendingAnswers } = validateSubmission(
      visibleFields,
      formData,
    );

    if (Object.keys(fieldErrors).length > 0) {
      return NextResponse.json(
        {
          error: "Please fix the highlighted fields.",
          fieldErrors,
        },
        { status: 400 },
      );
    }

    const answers = await resolveAnswerValues(pendingAnswers);

    await prisma.$transaction(async (tx) => {
      await tx.submission.create({
        data: {
          formId: form.id,
          answers:
            answers.length > 0
              ? {
                  create: answers,
                }
              : undefined,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Submission failed. Please try again." },
      { status: 500 },
    );
  }
}
