"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  AlignLeft,
  ChevronDown,
  FolderOpen,
  Loader2,
  Mail,
  Paperclip,
  PlusCircle,
  Star,
  Type as TypeIcon,
  type LucideIcon,
} from "lucide-react";
import {
  type Dispatch,
  type SetStateAction,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";
import { createField, reorderFields } from "@/actions/field";
import { FieldItem } from "@/components/builder/FieldItem";
import type { BuilderField } from "@/components/builder/FormBuilder";
import { Button } from "@/components/ui/Button";

interface FieldListProps {
  formId: string;
  fields: BuilderField[];
  selectedFieldId: string | null;
  onSelectField: (fieldId: string | null) => void;
  onFieldsChange: Dispatch<SetStateAction<BuilderField[]>>;
}

interface AddFieldOption {
  type: BuilderField["type"];
  label: string;
  defaultLabel: string;
  icon: LucideIcon;
}

const addFieldOptions: AddFieldOption[] = [
  {
    type: "TEXT",
    label: "Text",
    defaultLabel: "Text question",
    icon: TypeIcon,
  },
  {
    type: "EMAIL",
    label: "Email",
    defaultLabel: "Email address",
    icon: Mail,
  },
  {
    type: "LONG_TEXT",
    label: "Long text",
    defaultLabel: "Long answer",
    icon: AlignLeft,
  },
  {
    type: "DROPDOWN",
    label: "Dropdown",
    defaultLabel: "Choose an option",
    icon: ChevronDown,
  },
  {
    type: "RATING",
    label: "Rating",
    defaultLabel: "Rate your experience",
    icon: Star,
  },
  {
    type: "FILE",
    label: "File",
    defaultLabel: "Upload a file",
    icon: Paperclip,
  },
];

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong.";
}

function toBuilderField(field: BuilderField): BuilderField {
  return {
    id: field.id,
    formId: field.formId,
    type: field.type,
    label: field.label,
    placeholder: field.placeholder,
    required: field.required,
    order: field.order,
    options: field.options,
    condition: field.condition,
  };
}

export function FieldList({
  formId,
  fields,
  selectedFieldId,
  onSelectField,
  onFieldsChange,
}: FieldListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const activeId = String(active.id);
    const overId = String(over.id);
    const oldIndex = fields.findIndex((field) => field.id === activeId);
    const newIndex = fields.findIndex((field) => field.id === overId);

    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    const previousFields = fields;
    const nextFields = arrayMove(fields, oldIndex, newIndex).map(
      (field, order) => ({
        ...field,
        order,
      }),
    );

    onFieldsChange(nextFields);
    startTransition(() => {
      void reorderFields({
        formId,
        orderedIds: nextFields.map((field) => field.id),
      }).catch((reorderError: unknown) => {
        onFieldsChange(previousFields);
        const message = getErrorMessage(reorderError);
        toast.error(message);
      });
    });
  }

  function handleAddField(option: AddFieldOption) {
    setIsAddMenuOpen(false);
    startTransition(() => {
      void createField({
        formId,
        type: option.type,
        label: option.defaultLabel,
      })
        .then((field) => {
          const nextField = toBuilderField(field);
          onFieldsChange((currentFields) => [...currentFields, nextField]);
          onSelectField(nextField.id);
        })
        .catch((createError: unknown) => {
          const message = getErrorMessage(createError);
          toast.error(message);
        });
    });
  }

  function handleFieldDeleted(fieldId: string) {
    onFieldsChange((currentFields) => {
      const nextFields = currentFields.filter((field) => field.id !== fieldId);

      if (selectedFieldId === fieldId) {
        onSelectField(nextFields[0]?.id ?? null);
      }

      return nextFields;
    });
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-gray-100">
            Fields
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
            {fields.length} {fields.length === 1 ? "field" : "fields"}
          </p>
        </div>
        {isPending ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-gray-400">
            <Loader2
              aria-hidden="true"
              className="h-3.5 w-3.5 animate-spin"
            />
            Saving...
          </span>
        ) : null}
      </div>

      {fields.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fields.map((field) => field.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {fields.map((field) => (
                <FieldItem
                  key={field.id}
                  field={field}
                  isSelected={selectedFieldId === field.id}
                  onSelect={() => onSelectField(field.id)}
                  onDeleted={handleFieldDeleted}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="flex flex-col items-center rounded-md border border-dashed border-slate-300 p-8 text-center dark:border-gray-700">
          <FolderOpen
            aria-hidden="true"
            className="mb-3 h-8 w-8 text-slate-300 dark:text-gray-600"
          />
          <p className="text-sm text-slate-600 dark:text-gray-300">
            Add a field to start building this form.
          </p>
        </div>
      )}

      <div className="relative mt-5">
        <Button
          variant="secondary"
          disabled={isPending}
          onClick={() => setIsAddMenuOpen((isOpen) => !isOpen)}
          className="h-11 w-full justify-between"
          aria-expanded={isAddMenuOpen}
          aria-haspopup="menu"
        >
          <span className="inline-flex items-center gap-2">
            <PlusCircle aria-hidden="true" className="h-4 w-4" />
            Add field
          </span>
          <ChevronDown
            aria-hidden="true"
            className={`h-4 w-4 transition-transform duration-150 ${
              isAddMenuOpen ? "rotate-180" : ""
            }`}
          />
        </Button>
        {isAddMenuOpen ? (
          <div
            role="menu"
            className="absolute inset-x-0 bottom-full z-20 mb-2 grid grid-cols-2 gap-1 rounded-md border border-slate-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900 sm:grid-cols-3"
          >
            {addFieldOptions.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  key={option.type}
                  type="button"
                  role="menuitem"
                  onClick={() => handleAddField(option)}
                  className="flex min-h-11 items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-slate-700 transition-colors duration-150 hover:bg-gray-100 hover:text-slate-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
                >
                  <Icon aria-hidden="true" className="h-4 w-4 shrink-0" />
                  {option.label}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
