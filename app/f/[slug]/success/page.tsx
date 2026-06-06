import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

interface PublicFormSuccessPageProps {
  params: Promise<{
    slug: string;
  }>;
}

function UnavailableFormSuccess() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-gray-950 dark:text-gray-100 sm:py-16">
      <section className="animate-fadeUp mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight dark:text-gray-100">
          This form is not available
        </h1>
      </section>
    </main>
  );
}

export async function generateMetadata({
  params,
}: PublicFormSuccessPageProps): Promise<Metadata> {
  const { slug } = await params;
  const form = await prisma.form.findFirst({
    where: {
      slug,
      published: true,
    },
    select: {
      title: true,
    },
  });

  return {
    title: form
      ? `Thanks - ${form.title} | Formly`
      : "Form unavailable | Formly",
  };
}

export default async function PublicFormSuccessPage({
  params,
}: PublicFormSuccessPageProps) {
  const { slug } = await params;
  const form = await prisma.form.findFirst({
    where: {
      slug,
      published: true,
    },
    select: {
      title: true,
      slug: true,
      successMsg: true,
    },
  });

  if (!form) {
    return <UnavailableFormSuccess />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-gray-950 dark:text-gray-100 sm:py-16">
      <section className="animate-fadeUp mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          <CheckCircle2 aria-hidden="true" className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight dark:text-gray-100">
          {form.title}
        </h1>
        <p className="mt-3 text-base leading-7 text-slate-600 dark:text-gray-300">
          {form.successMsg ?? "Thanks for your response!"}
        </p>
        <Link
          href={`/f/${form.slug}`}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-950 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900"
        >
          Submit another response
        </Link>
      </section>
    </main>
  );
}
