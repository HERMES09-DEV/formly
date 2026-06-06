import type { Prisma } from "@prisma/client";

export function getStringOptions(options: Prisma.JsonValue | null) {
  if (!Array.isArray(options)) {
    return [];
  }

  return options.filter(
    (option): option is string => typeof option === "string",
  );
}
