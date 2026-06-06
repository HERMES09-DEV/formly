"use client";

import { X } from "lucide-react";
import type {
  ResponseField,
  ResponseSubmission,
} from "@/components/responses/types";
import { Button } from "@/components/ui/Button";

interface ResponseDrawerProps {
  submission: ResponseSubmission | null;
  fields: ResponseField[];
  fieldsById: Record<string, ResponseField>;
  onClose: () => void;
}

function formatSubmittedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getAnswerMap(submission: ResponseSubmission) {
  return new Map(
    submission.answers.map((answer) => [answer.fieldId, answer.value]),
  );
}

function isUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://");
}

export function ResponseDrawer({
  submission,
  fields,
  fieldsById,
  onClose,
}: ResponseDrawerProps) {
  if (!submission) {
    return null;
  }

  const answerMap = getAnswerMap(submission);

  return (
    <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-gray-700">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-gray-100">
            Response
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
            {formatSubmittedAt(submission.createdAt)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          aria-label="Close response"
          title="Close"
          className="h-9 w-9 px-0"
        >
          <X aria-hidden="true" className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <dl className="space-y-5">
          {fields.map((field) => {
            const value = answerMap.get(field.id) ?? "";
            const fieldFromMap = fieldsById[field.id] ?? field;

            return (
              <div key={field.id}>
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                  {field.label}
                </dt>
                <dd className="mt-2 break-words text-sm leading-6 text-slate-950 dark:text-gray-100">
                  {fieldFromMap.type === "FILE" && value && isUrl(value) ? (
                    <a
                      href={value}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-slate-950 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-950 dark:text-gray-100 dark:decoration-gray-600 dark:hover:decoration-gray-100"
                    >
                      Open file
                    </a>
                  ) : (
                    value || "No response"
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </aside>
  );
}
