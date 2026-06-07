"use client";

import type { FieldType } from "@prisma/client";
import { AlertCircle, Loader2, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useRef, useState } from "react";
import type { FieldCondition } from "@/lib/field-condition";
import { cn } from "@/lib/utils";
import {
  NonEmptyFileSchema,
  OptionalSubmissionEmailSchema,
  OptionalSubmissionTextSchema,
  RatingValueSchema,
  RequiredSubmissionEmailSchema,
  RequiredSubmissionTextSchema,
} from "@/lib/validations/submission";

export interface PublicFormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string | null;
  required: boolean;
  options: string[];
  condition: FieldCondition | null;
}

export interface PublicForm {
  id: string;
  title: string;
  slug: string;
  successMsg: string | null;
  fields: PublicFormField[];
}

interface FormRendererProps {
  form: PublicForm;
}

type FieldErrors = Record<string, string>;

type SubmitErrorPayload = {
  error: string;
  fieldErrors?: FieldErrors;
};

const ratingValues = ["1", "2", "3", "4", "5"] as const;

function getStringEntry(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

function getFirstIssueMessage(result: {
  success: false;
  error: { issues: { message: string }[] };
}) {
  return result.error.issues[0]?.message ?? "Invalid value.";
}

function isSubmitErrorPayload(value: unknown): value is SubmitErrorPayload {
  if (!value || typeof value !== "object" || !("error" in value)) {
    return false;
  }

  const { error, fieldErrors } = value as {
    error: unknown;
    fieldErrors?: unknown;
  };

  if (typeof error !== "string") {
    return false;
  }

  if (fieldErrors === undefined) {
    return true;
  }

  return (
    typeof fieldErrors === "object" &&
    fieldErrors !== null &&
    Object.values(fieldErrors).every((message) => typeof message === "string")
  );
}

async function readJson(response: Response) {
  try {
    const payload: unknown = await response.json();
    return payload;
  } catch {
    return null;
  }
}

function validateTextField(field: PublicFormField, value: string) {
  const schema = field.required
    ? RequiredSubmissionTextSchema
    : OptionalSubmissionTextSchema;
  const result = schema.safeParse(value);

  if (!result.success) {
    return getFirstIssueMessage(result);
  }

  return null;
}

function validateEmailField(field: PublicFormField, value: string) {
  const schema = field.required
    ? RequiredSubmissionEmailSchema
    : OptionalSubmissionEmailSchema;
  const result = schema.safeParse(value);

  if (!result.success) {
    return getFirstIssueMessage(result);
  }

  return null;
}

function validateDropdownField(field: PublicFormField, value: string) {
  const textError = validateTextField(field, value);

  if (textError) {
    return textError;
  }

  if (value.trim() && !field.options.includes(value)) {
    return "Select a valid option.";
  }

  return null;
}

function validateRatingField(field: PublicFormField, value: string) {
  if (!value && field.required) {
    return "This field is required.";
  }

  if (value && !RatingValueSchema.safeParse(value).success) {
    return "Select a rating from 1 to 5.";
  }

  return null;
}

function validateFileField(
  field: PublicFormField,
  value: FormDataEntryValue | null,
) {
  if (!field.required) {
    return null;
  }

  const result = NonEmptyFileSchema.safeParse(value);

  if (!result.success) {
    return getFirstIssueMessage(result);
  }

  return null;
}

function validateForm(
  fields: PublicFormField[],
  formData: FormData,
  answers: Record<string, string>,
) {
  const errors: FieldErrors = {};

  fields.forEach((field) => {
    const entry = formData.get(field.id);
    const value =
      field.type === "RATING" ? answers[field.id] ?? "" : getStringEntry(entry);
    let error: string | null = null;

    if (field.type === "EMAIL") {
      error = validateEmailField(field, value);
    } else if (field.type === "DROPDOWN") {
      error = validateDropdownField(field, value);
    } else if (field.type === "RATING") {
      error = validateRatingField(field, value);
    } else if (field.type === "FILE") {
      error = validateFileField(field, entry);
    } else {
      error = validateTextField(field, value);
    }

    if (error) {
      errors[field.id] = error;
    }
  });

  return errors;
}

function fieldHelpId(fieldId: string) {
  return `field-${fieldId}-error`;
}

function getVisibleFieldIds(
  fields: PublicFormField[],
  answers: Record<string, string>,
) {
  const fieldsById = new Map(fields.map((field) => [field.id, field]));

  function isVisible(field: PublicFormField, visiting: Set<string>): boolean {
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

    return (
      isVisible(triggerField, nextVisiting) &&
      answers[field.condition.triggerFieldId] === field.condition.triggerValue
    );
  }

  return new Set(
    fields
      .filter((field) => isVisible(field, new Set()))
      .map((field) => field.id),
  );
}

export function FormRenderer({ form }: FormRendererProps) {
  const router = useRouter();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const visibleFieldIds = getVisibleFieldIds(form.fields, answers);
  const visibleFields = form.fields.filter((field) =>
    visibleFieldIds.has(field.id),
  );

  useEffect(() => {
    const nextVisibleFieldIds = getVisibleFieldIds(form.fields, answers);
    const hiddenFieldIds = form.fields
      .filter((field) => !nextVisibleFieldIds.has(field.id))
      .map((field) => field.id);
    const hiddenAnsweredFieldIds = hiddenFieldIds.filter(
      (fieldId) => fieldId in answers,
    );

    if (hiddenAnsweredFieldIds.length > 0) {
      setAnswers((currentAnswers) => {
        const nextAnswers = { ...currentAnswers };

        hiddenAnsweredFieldIds.forEach((fieldId) => {
          delete nextAnswers[fieldId];
        });

        return nextAnswers;
      });
    }

    if (hiddenFieldIds.length > 0) {
      setFieldErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        let changed = false;

        hiddenFieldIds.forEach((fieldId) => {
          if (fieldId in nextErrors) {
            delete nextErrors[fieldId];
            changed = true;
          }

          const fileInput = fileInputRefs.current[fieldId];

          if (fileInput?.value) {
            fileInput.value = "";
          }
        });

        return changed ? nextErrors : currentErrors;
      });
    }
  }, [answers, form.fields]);

  function clearFieldError(fieldId: string) {
    setFieldErrors((currentErrors) => {
      if (!(fieldId in currentErrors)) {
        return currentErrors;
      }

      const nextErrors = { ...currentErrors };
      delete nextErrors[fieldId];
      return nextErrors;
    });
  }

  function updateAnswer(fieldId: string, value: string) {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [fieldId]: value,
    }));
    clearFieldError(fieldId);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const formData = new FormData(event.currentTarget);

    visibleFields.forEach((field) => {
      if (field.type === "RATING") {
        formData.set(field.id, answers[field.id] ?? "");
      }
    });

    const nextErrors = validateForm(visibleFields, formData, answers);

    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/submit/${form.id}`, {
        method: "POST",
        body: formData,
      });
      const payload = await readJson(response);

      if (!response.ok) {
        if (isSubmitErrorPayload(payload)) {
          setFormError(payload.error);
          setFieldErrors(payload.fieldErrors ?? {});
        } else {
          setFormError("Submission failed. Please try again.");
        }

        return;
      }

      router.push(`/f/${form.slug}/success`);
    } catch {
      setFormError("Submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderField(field: PublicFormField, isVisible: boolean) {
    const error = fieldErrors[field.id];
    const inputClassName =
      "mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-slate-950 outline-none transition focus:border-transparent focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500";
    const describedBy = error ? fieldHelpId(field.id) : undefined;

    if (field.type === "LONG_TEXT") {
      return (
        <textarea
          id={field.id}
          name={field.id}
          rows={5}
          placeholder={field.placeholder ?? undefined}
          value={answers[field.id] ?? ""}
          disabled={!isVisible}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          onChange={(event) => updateAnswer(field.id, event.target.value)}
          className={`${inputClassName} min-h-32 py-3`}
        />
      );
    }

    if (field.type === "DROPDOWN") {
      return (
        <select
          id={field.id}
          name={field.id}
          value={answers[field.id] ?? ""}
          disabled={!isVisible}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          onChange={(event) => updateAnswer(field.id, event.target.value)}
          className={`${inputClassName} h-11`}
        >
          <option value="">Select an option</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (field.type === "RATING") {
      const selectedRating = answers[field.id] ?? "";

      return (
        <div className="mt-3">
          <input
            type="hidden"
            name={field.id}
            value={selectedRating}
            disabled={!isVisible}
          />
          <div
            role="radiogroup"
            aria-labelledby={field.id}
            aria-describedby={describedBy}
            className="flex gap-1"
          >
            {ratingValues.map((rating) => {
              const isSelected = Number(rating) <= Number(selectedRating);

              return (
                <button
                  key={rating}
                  type="button"
                  role="radio"
                  aria-checked={selectedRating === rating}
                  aria-label={`${rating} out of 5`}
                  disabled={!isVisible}
                  onClick={() => {
                    updateAnswer(field.id, rating);
                  }}
                  className={`flex h-11 w-11 items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900 ${
                    isSelected
                      ? "text-amber-400 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-gray-800"
                      : "text-slate-300 hover:bg-slate-100 hover:text-slate-500 dark:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                  }`}
                >
                  <Star
                    aria-hidden="true"
                    className="h-6 w-6"
                    fill={isSelected ? "currentColor" : "none"}
                  />
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    if (field.type === "FILE") {
      return (
        <input
          id={field.id}
          name={field.id}
          type="file"
          ref={(element) => {
            fileInputRefs.current[field.id] = element;
          }}
          disabled={!isVisible}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={describedBy}
          onChange={(event) =>
            updateAnswer(field.id, event.target.files?.[0]?.name ?? "")
          }
          className={`${inputClassName} min-h-11 py-2 file:mr-3 file:min-h-9 file:rounded-md file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white dark:file:bg-gray-100 dark:file:text-gray-950`}
        />
      );
    }

    return (
      <input
        id={field.id}
        name={field.id}
        type={field.type === "EMAIL" ? "email" : "text"}
        placeholder={field.placeholder ?? undefined}
        value={answers[field.id] ?? ""}
        disabled={!isVisible}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={describedBy}
        onChange={(event) => updateAnswer(field.id, event.target.value)}
        className={`${inputClassName} h-11`}
      />
    );
  }

  return (
    <section className="animate-fadeUp mx-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
          Formly
        </p>
        <h1 className="mb-1 mt-2 text-2xl font-bold text-slate-950 dark:text-gray-100">
          {form.title}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        {form.fields.map((field) => {
          const isVisible = visibleFieldIds.has(field.id);

          return (
            <div
              key={field.id}
              aria-hidden={!isVisible}
              className={cn(
                "overflow-hidden transition-all duration-300 ease-in-out",
                isVisible
                  ? "max-h-[500px] opacity-100"
                  : "pointer-events-none max-h-0 opacity-0",
              )}
            >
              <div className="pb-7">
                <div className="flex items-center justify-between gap-3">
                  <label
                    id={field.type === "RATING" ? field.id : undefined}
                    htmlFor={field.type === "RATING" ? undefined : field.id}
                    className="mb-1.5 text-sm font-medium text-slate-950 dark:text-gray-100"
                  >
                    {field.label}
                  </label>
                  {field.required ? (
                    <span className="shrink-0 text-xs font-medium text-slate-500 dark:text-gray-400">
                      Required
                    </span>
                  ) : null}
                </div>
                {renderField(field, isVisible)}
                {fieldErrors[field.id] ? (
                  <p
                    id={fieldHelpId(field.id)}
                    className="mt-2 flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400"
                  >
                    <AlertCircle
                      aria-hidden="true"
                      className="h-4 w-4 shrink-0"
                    />
                    {fieldErrors[field.id]}
                  </p>
                ) : null}
              </div>
            </div>
          );
        })}

        <div className="space-y-4">
          {formError ? (
            <p className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              <AlertCircle aria-hidden="true" className="h-4 w-4 shrink-0" />
              {formError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-11 w-full items-center justify-center rounded-md bg-slate-950 px-5 text-sm font-medium text-white transition-all duration-150 hover:brightness-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100 dark:bg-gray-100 dark:text-gray-950 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900 sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Submit response"
            )}
          </button>
        </div>
      </form>
    </section>
  );
}
