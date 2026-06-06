import type { Metadata } from "next";
import {
  Activity,
  BarChart2,
  ChevronLeft,
  FileText,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFormAnalytics } from "@/actions/form";
import { CompletionChart } from "@/components/analytics/CompletionChart";
import { SubmissionsChart } from "@/components/analytics/SubmissionsChart";
import { FormNavTabs } from "@/components/builder/FormNavTabs";

export const metadata: Metadata = {
  title: "Analytics | Formly",
};

interface AnalyticsPageProps {
  params: Promise<{
    formId: string;
  }>;
}

function getThisWeekCount(data: { count: number }[]) {
  return data.slice(-7).reduce((total, day) => total + day.count, 0);
}

function getAveragePerDay(totalSubmissions: number) {
  return totalSubmissions / 30;
}

function formatAverage(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);
}

function ChartEmptyState() {
  return (
    <div className="animate-fadeIn flex h-72 flex-col items-center justify-center text-slate-400 dark:text-gray-500">
      <BarChart2 aria-hidden="true" className="h-10 w-10" />
      <p className="mt-3 text-sm font-medium">Not enough data yet</p>
    </div>
  );
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { formId } = await params;
  let analytics: Awaited<ReturnType<typeof getFormAnalytics>>;

  try {
    analytics = await getFormAnalytics({ formId });
  } catch (error) {
    if (error instanceof Error && error.message === "Form not found.") {
      notFound();
    }

    throw error;
  }

  const thisWeek = getThisWeekCount(analytics.submissionsPerDay);
  const averagePerDay = getAveragePerDay(analytics.totalSubmissions);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <Link
            href={`/dashboard/forms/${formId}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors duration-150 hover:text-slate-950 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Back to builder
          </Link>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
            Analytics
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            Submission trends and field completion for this form.
          </p>
        </div>
        <FormNavTabs formId={formId} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-gray-400">
            <FileText aria-hidden="true" className="h-4 w-4" />
            <p>Total submissions</p>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
            {analytics.totalSubmissions}
          </p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-gray-400">
            <TrendingUp aria-hidden="true" className="h-4 w-4" />
            <p>This week</p>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
            {thisWeek}
          </p>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-gray-400">
            <Activity aria-hidden="true" className="h-4 w-4" />
            <p>Avg per day</p>
          </div>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-gray-100">
            {formatAverage(averagePerDay)}
          </p>
        </section>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-gray-100">
            Submissions over time
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
            Last 30 days, including days without submissions.
          </p>
        </div>
        {analytics.totalSubmissions === 0 ? (
          <ChartEmptyState />
        ) : (
          <SubmissionsChart data={analytics.submissionsPerDay} />
        )}
      </section>

      {analytics.fieldCompletionRates.length > 0 ? (
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-gray-100">
              Optional field completion
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
              Percentage of submissions that included each optional field.
            </p>
          </div>
          {analytics.totalSubmissions === 0 ? (
            <ChartEmptyState />
          ) : (
            <CompletionChart data={analytics.fieldCompletionRates} />
          )}
        </section>
      ) : null}
    </div>
  );
}
