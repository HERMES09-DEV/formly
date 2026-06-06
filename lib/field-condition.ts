import type { Prisma } from "@prisma/client";

export interface FieldCondition {
  [key: string]: string;
  triggerFieldId: string;
  triggerValue: string;
}

export function getFieldCondition(
  condition: Prisma.JsonValue | null,
): FieldCondition | null {
  if (!condition || Array.isArray(condition) || typeof condition !== "object") {
    return null;
  }

  const conditionRecord = condition as Record<string, unknown>;
  const { triggerFieldId, triggerValue } = conditionRecord;

  if (typeof triggerFieldId !== "string" || typeof triggerValue !== "string") {
    return null;
  }

  if (!triggerFieldId.trim()) {
    return null;
  }

  return {
    triggerFieldId,
    triggerValue,
  };
}
