"use client";

import type { CSSProperties } from "react";
import { Eye, GripVertical, Loader2, Trash2 } from "lucide-react";
import { useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { deleteField } from "@/actions/field";
import type { BuilderField } from "@/components/builder/FormBuilder";
import { Button } from "@/components/ui/Button";
import { getFieldCondition } from "@/lib/field-condition";
import { cn } from "@/lib/utils";

interface FieldItemProps {
  field: BuilderField;
  fields: BuilderField[];
  isSelected: boolean;
  onSelect: () => void;
  onDeleted: (fieldId: string) => void;
}

const fieldTypeLabels: Record<BuilderField["type"], string> = {
  TEXT: "Text",
  EMAIL: "Email",
  LONG_TEXT: "Long text",
  DROPDOWN: "Dropdown",
  RATING: "Rating",
  FILE: "File",
};

export function FieldItem({
  field,
  fields,
  isSelected,
  onSelect,
  onDeleted,
}: FieldItemProps) {
  const [isPending, startTransition] = useTransition();
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: field.id,
  });
  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  const condition = getFieldCondition(field.condition);
  const triggerField = condition
    ? fields.find(
        (candidateField) =>
          candidateField.id === condition.triggerFieldId,
      )
    : null;

  function handleDelete() {
    if (!window.confirm(`Delete "${field.label}"?`)) {
      return;
    }

    startTransition(() => {
      void deleteField({ fieldId: field.id })
        .then(() => {
          onDeleted(field.id);
        })
        .catch((deleteError: unknown) => {
          const message =
            deleteError instanceof Error
              ? deleteError.message
              : "Could not delete field.";
          toast.error(message);
        });
    });
  }

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "flex min-h-14 items-center gap-3 rounded-md border bg-white px-3 py-2 shadow-sm transition-shadow duration-150 hover:shadow-sm dark:bg-gray-900",
          isSelected
            ? "border-blue-500 ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-gray-900"
            : "border-slate-200 dark:border-gray-700",
          isDragging && "opacity-60",
        )}
      >
        <button
          type="button"
          className="flex h-10 w-10 shrink-0 cursor-grab items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700 active:cursor-grabbing dark:text-gray-500 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Drag field"
          {...attributes}
          {...listeners}
        >
          <GripVertical aria-hidden="true" className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-center justify-between gap-3 text-left"
        >
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-slate-950 dark:text-gray-100">
              {field.label}
            </span>
            {condition ? (
              triggerField ? (
                <span className="mt-0.5 flex items-center gap-1 truncate text-xs text-gray-400">
                  <Eye aria-hidden="true" className="h-3 w-3 shrink-0" />
                  Shows when {triggerField.label} = {condition.triggerValue}
                </span>
              ) : (
                <span className="mt-0.5 block truncate text-xs text-amber-500">
                  ⚠ Condition references a deleted field
                </span>
              )
            ) : null}
          </span>
          <span className="inline-flex shrink-0 items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-gray-800 dark:text-gray-300">
            {fieldTypeLabels[field.type]}
          </span>
        </button>

        <Button
          variant="ghost"
          size="sm"
          disabled={isPending}
          onClick={handleDelete}
          aria-label={`Delete ${field.label}`}
          title="Delete field"
          className="h-10 w-10 shrink-0 px-0 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 aria-hidden="true" className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
