"use client";

import type { Field } from "@prisma/client";
import {
  ChevronLeft,
  ExternalLink,
  Globe,
  Loader2,
  Lock,
  Pencil,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { publishForm, updateForm } from "@/actions/form";
import { EmbedDialog } from "@/components/builder/embed-dialog";
import { FieldEditor } from "@/components/builder/FieldEditor";
import { FieldList } from "@/components/builder/FieldList";
import { FormNavTabs } from "@/components/builder/FormNavTabs";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export interface BuilderForm {
  id: string;
  title: string;
  slug: string;
  published: boolean;
  successMsg: string | null;
}

export type BuilderField = Field;

interface FormBuilderProps {
  form: BuilderForm;
  initialFields: BuilderField[];
  embedBaseUrl: string;
}

export function FormBuilder({
  form,
  initialFields,
  embedBaseUrl,
}: FormBuilderProps) {
  const [formState, setFormState] = useState(form);
  const [fieldState, setFieldState] = useState(initialFields);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    initialFields[0]?.id ?? null,
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isMobileEditorOpen, setIsMobileEditorOpen] = useState(false);
  const [titleDraft, setTitleDraft] = useState(form.title);
  const [formStatus, setFormStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const selectedField =
    fieldState.find((field) => field.id === selectedFieldId) ?? null;

  function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Something went wrong.";
  }

  function saveTitle() {
    const nextTitle = titleDraft.trim();

    setIsEditingTitle(false);

    if (!nextTitle || nextTitle === formState.title) {
      setTitleDraft(formState.title);
      return;
    }

    const previousTitle = formState.title;
    setFormState((currentForm) => ({ ...currentForm, title: nextTitle }));
    setFormStatus("Saving...");

    startTransition(() => {
      void updateForm({ formId: formState.id, title: nextTitle })
        .then((updatedForm) => {
          setFormState((currentForm) => ({
            ...currentForm,
            title: updatedForm.title,
          }));
          setTitleDraft(updatedForm.title);
          setFormStatus("Saved");
        })
        .catch((error: unknown) => {
          setFormState((currentForm) => ({
            ...currentForm,
            title: previousTitle,
          }));
          setTitleDraft(previousTitle);
          setFormStatus("Could not save");
          toast.error(getErrorMessage(error));
        });
    });
  }

  function togglePublished() {
    const nextPublished = !formState.published;
    const previousPublished = formState.published;
    setFormState((currentForm) => ({
      ...currentForm,
      published: nextPublished,
    }));
    setFormStatus("Saving...");

    startTransition(() => {
      void publishForm({ formId: formState.id, published: nextPublished })
        .then((updatedForm) => {
          setFormState((currentForm) => ({
            ...currentForm,
            published: updatedForm.published,
          }));
          setFormStatus("Saved");
          if (updatedForm.published) {
            toast.success("Form published");
          } else {
            toast.info("Form unpublished");
          }
        })
        .catch((error: unknown) => {
          setFormState((currentForm) => ({
            ...currentForm,
            published: previousPublished,
          }));
          setFormStatus("Could not save");
          toast.error(getErrorMessage(error));
        });
    });
  }

  function updateFieldState(
    fieldId: string,
    updates: Partial<
      Pick<
        BuilderField,
        "label" | "placeholder" | "required" | "options" | "condition"
      >
    >,
  ) {
    setFieldState((currentFields) =>
      currentFields.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field,
      ),
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 pb-5 dark:border-gray-700 dark:bg-gray-950 lg:flex-row lg:items-center">
        <div className="min-w-0 max-w-full">
          <Link
            href="/dashboard/forms"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 transition-colors duration-150 hover:text-slate-950 dark:text-gray-300 dark:hover:text-gray-100"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            Back to forms
          </Link>
          <div className="mt-2 flex min-h-11 items-center gap-3">
            {isEditingTitle ? (
              <input
                autoFocus
                value={titleDraft}
                onChange={(event) => setTitleDraft(event.target.value)}
                onBlur={saveTitle}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.currentTarget.blur();
                  }

                  if (event.key === "Escape") {
                    setTitleDraft(formState.title);
                    setIsEditingTitle(false);
                  }
                }}
                className="h-11 w-full max-w-xl border-0 border-b-2 border-transparent bg-transparent px-0 text-lg font-medium text-slate-950 outline-none transition focus:border-blue-500 dark:text-gray-100"
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsEditingTitle(true)}
                className="min-w-0 text-left"
              >
                <h1 className="truncate text-lg font-medium text-slate-950 dark:text-gray-100">
                  {formState.title}
                </h1>
              </button>
            )}
            {formStatus ? (
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-slate-500 dark:text-gray-400">
                {formStatus === "Saving..." ? (
                  <Loader2
                    aria-hidden="true"
                    className="h-3.5 w-3.5 animate-spin"
                  />
                ) : null}
                {formStatus}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:shrink-0">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-gray-300">
            {formState.published ? (
              <Globe aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Lock aria-hidden="true" className="h-4 w-4" />
            )}
            <span>{formState.published ? "Published" : "Draft"}</span>
            <button
              type="button"
              role="switch"
              aria-checked={formState.published}
              disabled={isPending}
              onClick={togglePublished}
              className={cn(
                "relative h-6 w-11 rounded-full transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-70",
                formState.published
                  ? "bg-slate-950 dark:bg-gray-100"
                  : "bg-slate-300 dark:bg-gray-700",
              )}
            >
              <span
                className={cn(
                  "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform duration-200 dark:bg-gray-950",
                  formState.published && "translate-x-5",
                )}
              />
            </button>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              window.open(
                `/f/${formState.slug}`,
                "_blank",
                "noopener,noreferrer",
              );
            }}
          >
            <ExternalLink aria-hidden="true" className="h-4 w-4" />
            Preview
          </Button>
          <EmbedDialog baseUrl={embedBaseUrl} slug={formState.slug} />
          <FormNavTabs formId={formState.id} />
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-10rem)] flex-col gap-6 xl:flex-row">
        <div className="min-w-0 flex-1">
          <FieldList
            formId={formState.id}
            fields={fieldState}
            selectedFieldId={selectedFieldId}
            onSelectField={setSelectedFieldId}
            onFieldsChange={setFieldState}
          />
        </div>
        <div className="hidden md:block">
          <FieldEditor
            key={selectedField?.id ?? "empty"}
            field={selectedField}
            fields={fieldState}
            onUpdate={updateFieldState}
          />
        </div>
      </div>

      {selectedField ? (
        <Button
          className="fixed bottom-20 right-4 z-40 shadow-lg md:hidden"
          onClick={() => setIsMobileEditorOpen(true)}
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
          Edit field
        </Button>
      ) : null}

      {isMobileEditorOpen ? (
        <div className="fixed inset-0 z-50 bg-slate-950/40 md:hidden">
          <div className="absolute inset-x-0 bottom-0 max-h-[82vh] overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-900">
            <div className="mb-3 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileEditorOpen(false)}
              >
                <X aria-hidden="true" className="h-4 w-4" />
                Close
              </Button>
            </div>
            <FieldEditor
              key={selectedField?.id ?? "empty"}
              field={selectedField}
              fields={fieldState}
              onUpdate={updateFieldState}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
