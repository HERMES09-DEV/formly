import type { Metadata } from "next";
import { FormRenderer } from "@/components/forms/FormRenderer";
import { getFieldCondition } from "@/lib/field-condition";
import { getStringOptions } from "@/lib/form-options";
import { prisma } from "@/lib/prisma";

interface PublicFormPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function isEmbedRequest(searchParams: Record<string, string | string[] | undefined>) {
  const embed = searchParams.embed;
  const value = Array.isArray(embed) ? embed[0] : embed;

  return value === "1";
}

function UnavailableForm({ isEmbed }: { isEmbed: boolean }) {
  if (isEmbed) {
    return (
      <section className="animate-fadeUp w-full rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h1 className="text-2xl font-semibold tracking-tight dark:text-gray-100">
          This form is not available
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-gray-300">
          The link may be inactive, unpublished, or no longer accepting
          responses.
        </p>
      </section>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-gray-950 dark:text-gray-100 sm:py-16">
      <section className="animate-fadeUp mx-auto w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight dark:text-gray-100">
          This form is not available
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-gray-300">
          The link may be inactive, unpublished, or no longer accepting
          responses.
        </p>
      </section>
    </main>
  );
}

export async function generateMetadata({
  params,
}: PublicFormPageProps): Promise<Metadata> {
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
    title: form ? `${form.title} | Formly` : "Form unavailable | Formly",
  };
}

export default async function PublicFormPage({
  params,
  searchParams,
}: PublicFormPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const isEmbed = isEmbedRequest(resolvedSearchParams);
  const form = await prisma.form.findFirst({
    where: {
      slug,
      published: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      successMsg: true,
      fields: {
        where: {
          archivedAt: null,
        },
        orderBy: {
          order: "asc",
        },
        select: {
          id: true,
          type: true,
          label: true,
          placeholder: true,
          required: true,
          options: true,
          condition: true,
        },
      },
    },
  });

  if (!form) {
    return <UnavailableForm isEmbed={isEmbed} />;
  }

  const renderedForm = (
    <FormRenderer
      form={{
        id: form.id,
        title: form.title,
        slug: form.slug,
        successMsg: form.successMsg,
        fields: form.fields.map((field) => ({
          id: field.id,
          type: field.type,
          label: field.label,
          placeholder: field.placeholder,
          required: field.required,
          options: getStringOptions(field.options),
          condition: getFieldCondition(field.condition),
        })),
      }}
    />
  );

  if (isEmbed) {
    return (
      <main className="p-4 text-slate-950 dark:text-gray-100">
        {renderedForm}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-950 dark:bg-gray-950 dark:text-gray-100 sm:py-16">
      {renderedForm}
    </main>
  );
}
