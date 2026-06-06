"use client";

import type { Field } from "@prisma/client";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { updateField } from "@/actions/field";
import { Button } from "@/components/ui/Button";
import {
  type FieldCondition,
  getFieldCondition,
} from "@/lib/field-condition";

type EditableFieldUpdate = Partial<
  Pick<Field, "label" | "placeholder" | "required">
> & {
  options?: string[] | null;
  condition?: FieldCondition | null;
};

interface FieldEditorProps {
  field: Field | null;
  fields: Field[];
  onUpdate: (fieldId: string, updates: EditableFieldUpdate) => void;
}

type SaveStatus = "Saving..." | "Saved" | "Could not save";

function isTextLikeField(field: Field) {
  return (
    field.type === "TEXT" ||
    field.type === "EMAIL" ||
    field.type === "LONG_TEXT"
  );
}

function getStringOptions(field: Field) {
  if (!Array.isArray(field.options)) {
    return [];
  }

  return field.options.filter(
    (option): option is string => typeof option === "string",
  );
}

function normalizeOptions(options: string[]) {
  return options.map((option) => option.trim()).filter(Boolean);
}

function isConditionTriggerField(field: Field) {
  return field.type === "DROPDOWN" || field.type === "RATING";
}

export function FieldEditor({ field, fields, onUpdate }: FieldEditorProps) {
  const [label, setLabel] = useState(field?.label ?? "");
  const [placeholder, setPlaceholder] = useState(field?.placeholder ?? "");
  const [required, setRequired] = useState(field?.required ?? false);
  const [options, setOptions] = useState(field ? getStringOptions(field) : []);
  const [condition, setCondition] = useState<FieldCondition | null>(
    field ? getFieldCondition(field.condition) : null,
  );
  const [status, setStatus] = useState<SaveStatus>("Saved");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdateRef = useRef<EditableFieldUpdate | null>(null);
  const saveIdRef = useRef(0);

  const scheduleSave = useCallback(
    (updates: EditableFieldUpdate) => {
      if (!field) {
        return;
      }

      pendingUpdateRef.current = {
        ...pendingUpdateRef.current,
        ...updates,
      };
      setStatus("Saving...");

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        const payload = pendingUpdateRef.current;
        pendingUpdateRef.current = null;
        timerRef.current = null;

        if (!payload) {
          return;
        }

        const saveId = saveIdRef.current + 1;
        saveIdRef.current = saveId;

        void updateField({
          fieldId: field.id,
          ...payload,
        })
          .then(() => {
            if (
              saveId === saveIdRef.current &&
              !pendingUpdateRef.current &&
              !timerRef.current
            ) {
              setStatus("Saved");
            }
          })
          .catch(() => {
            if (saveId === saveIdRef.current) {
              setStatus("Could not save");
              toast.error("Could not save field changes.");
            }
          });
      }, 800);
    },
    [field],
  );

  if (!field) {
    return (
      <aside className="w-full shrink-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 xl:w-80">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-gray-100">
          Field settings
        </h2>
        <div className="mt-4 rounded-md bg-slate-50 p-4 text-sm text-slate-600 dark:bg-gray-800 dark:text-gray-300">
          Select a field to edit
        </div>
      </aside>
    );
  }

  const activeField = field;

  function updateLabel(nextLabel: string) {
    setLabel(nextLabel);
    onUpdate(activeField.id, { label: nextLabel });
    scheduleSave({ label: nextLabel });
  }

  function updateRequired(nextRequired: boolean) {
    setRequired(nextRequired);
    onUpdate(activeField.id, { required: nextRequired });
    scheduleSave({ required: nextRequired });
  }

  function updatePlaceholder(nextPlaceholder: string) {
    setPlaceholder(nextPlaceholder);
    const savedPlaceholder = nextPlaceholder.trim() || null;
    onUpdate(activeField.id, { placeholder: savedPlaceholder });
    scheduleSave({ placeholder: savedPlaceholder });
  }

  function updateOptions(nextOptions: string[]) {
    setOptions(nextOptions);
    const savedOptions = normalizeOptions(nextOptions);
    onUpdate(activeField.id, { options: savedOptions });
    scheduleSave({ options: savedOptions });
  }

  function updateCondition(nextCondition: FieldCondition | null) {
    setCondition(nextCondition);
    onUpdate(activeField.id, { condition: nextCondition });
    scheduleSave({ condition: nextCondition });
  }

  function updateConditionTrigger(triggerFieldId: string) {
    if (!triggerFieldId) {
      updateCondition(null);
      return;
    }

    updateCondition({
      triggerFieldId,
      triggerValue: condition?.triggerValue ?? "",
    });
  }

  function updateConditionValue(triggerValue: string) {
    if (!condition) {
      return;
    }

    updateCondition({
      ...condition,
      triggerValue,
    });
  }

  const conditionTriggerFields = fields.filter(
    (candidateField) =>
      candidateField.id !== activeField.id &&
      isConditionTriggerField(candidateField),
  );

  return (
    <aside className="w-full shrink-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 xl:w-80">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-950 dark:text-gray-100">
          Field settings
        </h2>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 dark:text-gray-400">
          {status === "Saving..." ? (
            <Loader2 aria-hidden="true" className="h-3.5 w-3.5 animate-spin" />
          ) : status === "Saved" ? (
            <CheckCircle2
              aria-hidden="true"
              className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
            />
          ) : (
            <AlertCircle
              aria-hidden="true"
              className="h-3.5 w-3.5 text-red-600 dark:text-red-400"
            />
          )}
          {status}
        </span>
      </div>

      <div className="mt-5 space-y-5">
        <div className="space-y-2">
          <label
            htmlFor="field-label"
            className="text-sm font-medium text-slate-950 dark:text-gray-100"
          >
            Label
          </label>
          <input
            id="field-label"
            value={label}
            onChange={(event) => updateLabel(event.target.value)}
            className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-gray-300 dark:focus:ring-gray-200/20"
          />
        </div>

        <label className="flex min-h-11 items-center gap-2 text-sm font-medium text-slate-700 dark:text-gray-300">
          <input
            type="checkbox"
            checked={required}
            onChange={(event) => updateRequired(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-slate-950 focus:ring-slate-950 dark:border-gray-700 dark:bg-gray-900 dark:focus:ring-gray-200"
          />
          Required
        </label>

        {isTextLikeField(activeField) ? (
          <div className="space-y-2">
            <label
              htmlFor="field-placeholder"
              className="text-sm font-medium text-slate-950 dark:text-gray-100"
            >
              Placeholder
            </label>
            <input
              id="field-placeholder"
              value={placeholder}
              onChange={(event) => updatePlaceholder(event.target.value)}
              className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-gray-300 dark:focus:ring-gray-200/20"
            />
          </div>
        ) : null}

        {activeField.type === "DROPDOWN" ? (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-slate-950 dark:text-gray-100">
                Options
              </h3>
            </div>
            <div className="space-y-2">
              {options.map((option, index) => (
                <div key={`${activeField.id}-${index}`} className="flex gap-2">
                  <input
                    value={option}
                    onChange={(event) => {
                      const nextOptions = [...options];
                      nextOptions[index] = event.target.value;
                      updateOptions(nextOptions);
                    }}
                    className="h-11 min-w-0 flex-1 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-gray-300 dark:focus:ring-gray-200/20"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateOptions(
                        options.filter(
                          (_, itemIndex) => itemIndex !== index,
                        ),
                      );
                    }}
                    className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                  >
                    <Trash2 aria-hidden="true" className="h-4 w-4" />
                    Remove
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                updateOptions([...options, `Option ${options.length + 1}`]);
              }}
            >
              <Plus aria-hidden="true" className="h-4 w-4" />
              Add option
            </Button>
          </div>
        ) : null}

        <div className="border-t border-slate-200 pt-5 dark:border-gray-700">
          <h3 className="text-sm font-medium text-slate-950 dark:text-gray-100">
            Conditional logic
          </h3>
          <div className="mt-3 space-y-3">
            <div className="space-y-2">
              <label
                htmlFor="field-condition-trigger"
                className="text-sm font-medium text-slate-700 dark:text-gray-300"
              >
                Show this field only if
              </label>
              <select
                id="field-condition-trigger"
                value={condition?.triggerFieldId ?? ""}
                disabled={conditionTriggerFields.length === 0}
                onChange={(event) =>
                  updateConditionTrigger(event.target.value)
                }
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800 dark:focus:border-gray-300 dark:focus:ring-gray-200/20"
              >
                <option value="">Always show</option>
                {conditionTriggerFields.map((triggerField) => (
                  <option key={triggerField.id} value={triggerField.id}>
                    {triggerField.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="field-condition-value"
                className="text-sm font-medium text-slate-700 dark:text-gray-300"
              >
                equals
              </label>
              <input
                id="field-condition-value"
                value={condition?.triggerValue ?? ""}
                disabled={!condition}
                onChange={(event) =>
                  updateConditionValue(event.target.value)
                }
                className="h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition-colors disabled:cursor-not-allowed disabled:bg-slate-100 focus:border-slate-950 focus:ring-2 focus:ring-slate-950/10 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800 dark:focus:border-gray-300 dark:focus:ring-gray-200/20"
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
