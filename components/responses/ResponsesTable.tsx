"use client";

import { ChevronLeft, Download, Inbox, Loader2 } from "lucide-react";
import Link from "next/link";
import Papa from "papaparse";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { getAllSubmissionsForExport } from "@/actions/submission";
import { FormNavTabs } from "@/components/builder/FormNavTabs";
import { ResponseDrawer } from "@/components/responses/ResponseDrawer";
import type {
  ResponseField,
  ResponseSubmission,
  ResponsesPagination,
} from "@/components/responses/types";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface ResponsesTableForm {
  id: string;
  title: string;
}

interface ResponsesTableProps {
  form: ResponsesTableForm;
  fields: ResponseField[];
  submissions: ResponseSubmission[];
  pagination: ResponsesPagination;
}

interface ExportPayload {
  fields: ResponseField[];
  submissions: ResponseSubmission[];
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

function truncateLabel(label: string) {
  return label.length > 24 ? `${label.slice(0, 21)}...` : label;
}

function getAnswerMap(submission: ResponseSubmission) {
  return new Map(
    submission.answers.map((answer) => [answer.fieldId, answer.value]),
  );
}

function getCellValue(submission: ResponseSubmission, fieldId: string) {
  const value = getAnswerMap(submission).get(fieldId) ?? "";

  if (!value) {
    return "-";
  }

  return value.length > 80 ? `${value.slice(0, 77)}...` : value;
}

function getPageHref(formId: string, page: number) {
  return `/dashboard/forms/${formId}/responses?page=${page}`;
}

function getDownloadName(formTitle: string) {
  const baseName =
    formTitle
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "responses";

  return `${baseName}-responses.csv`;
}

function buildCsvRows(payload: ExportPayload) {
  return payload.submissions.map((submission) => {
    const answerMap = getAnswerMap(submission);

    return [
      ...payload.fields.map((field) => answerMap.get(field.id) ?? ""),
      formatSubmittedAt(submission.createdAt),
    ];
  });
}

function getFieldHeader(field: ResponseField) {
  return field.archivedAt ? `${field.label} (Archived)` : field.label;
}

function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8;" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Could not export responses.";
}

export function ResponsesTable({
  form,
  fields,
  submissions,
  pagination,
}: ResponsesTableProps) {
  const [selectedSubmission, setSelectedSubmission] =
    useState<ResponseSubmission | null>(null);
  const [isExporting, startExportTransition] = useTransition();
  const fieldsById = useMemo(
    () =>
      fields.reduce<Record<string, ResponseField>>((map, field) => {
        map[field.id] = field;
        return map;
      }, {}),
    [fields],
  );
  const hasPreviousPage = pagination.currentPage > 1;
  const hasNextPage = pagination.currentPage < pagination.totalPages;

  function handleExportCsv() {
    startExportTransition(() => {
      void getAllSubmissionsForExport({ formId: form.id })
        .then((payload) => {
          const headers = [
            ...payload.fields.map(getFieldHeader),
            "Submitted at",
          ];
          const csv = Papa.unparse<string[]>({
            fields: headers,
            data: buildCsvRows(payload),
          });

          downloadCsv(getDownloadName(form.title), csv);
          toast.success("CSV downloaded");
        })
        .catch((error: unknown) => {
          toast.error(getErrorMessage(error));
        });
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Link
            href={`/dashboard/forms/${form.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors duration-150 hover:text-slate-950 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Back to builder
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
            Responses
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            {form.title} has {pagination.totalSubmissions}{" "}
            {pagination.totalSubmissions === 1 ? "response" : "responses"}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <FormNavTabs formId={form.id} />
          <Button
            variant="secondary"
            disabled={isExporting || pagination.totalSubmissions === 0}
            onClick={handleExportCsv}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <Download aria-hidden="true" className="h-4 w-4" />
                Export CSV
              </>
            )}
          </Button>
        </div>
      </div>

      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-0 border-collapse text-left md:min-w-[720px]">
            <thead className="bg-slate-50 dark:bg-gray-800">
              <tr>
                {fields.map((field, index) => (
                  <th
                    key={field.id}
                    scope="col"
                    title={getFieldHeader(field)}
                    className={cn(
                      "border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-gray-700 dark:text-gray-400",
                      index > 1 && "hidden md:table-cell",
                    )}
                  >
                    <span>{truncateLabel(field.label)}</span>
                    {field.archivedAt ? (
                      <span className="ml-2 normal-case tracking-normal text-slate-400 dark:text-gray-500">
                        Archived
                      </span>
                    ) : null}
                  </th>
                ))}
                <th
                  scope="col"
                  className="border-b border-slate-200 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-gray-700 dark:text-gray-400"
                >
                  Submitted at
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.length > 0 ? (
                submissions.map((submission) => (
                  <tr
                    key={submission.id}
                    onClick={() => setSelectedSubmission(submission)}
                    className="cursor-pointer border-b border-slate-100 transition-colors last:border-b-0 hover:bg-slate-50 dark:border-gray-800 dark:hover:bg-gray-800"
                  >
                    {fields.map((field, index) => (
                      <td
                        key={field.id}
                        className={cn(
                          "max-w-64 px-4 py-4 text-sm text-slate-700 dark:text-gray-300",
                          index > 1 && "hidden md:table-cell",
                        )}
                      >
                        <span className="block truncate">
                          {getCellValue(submission, field.id)}
                        </span>
                      </td>
                    ))}
                    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-700 dark:text-gray-300">
                      {formatSubmittedAt(submission.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={fields.length + 1}
                    className="px-4 py-16 text-center text-sm text-slate-600 dark:text-gray-300"
                  >
                    <div className="animate-fadeIn flex flex-col items-center">
                      <Inbox
                        aria-hidden="true"
                        className="h-12 w-12 text-slate-300 dark:text-gray-600"
                      />
                      <h2 className="mt-4 text-lg font-semibold text-slate-950 dark:text-gray-100">
                        No responses yet
                      </h2>
                      <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
                        Share your form link to start collecting responses.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-600 dark:text-gray-300">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            {hasPreviousPage ? (
              <Link
                href={getPageHref(form.id, pagination.currentPage - 1)}
                className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900"
              >
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
                Previous
              </span>
            )}
            {hasNextPage ? (
              <Link
                href={getPageHref(form.id, pagination.currentPage + 1)}
                className="inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900"
              >
                Next
              </Link>
            ) : (
              <span className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500">
                Next
              </span>
            )}
          </div>
        </div>
      </section>

      <ResponseDrawer
        submission={selectedSubmission}
        fields={fields}
        fieldsById={fieldsById}
        onClose={() => setSelectedSubmission(null)}
      />
    </div>
  );
}
