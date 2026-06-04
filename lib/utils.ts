import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { createId } from "@paralleldrive/cuid2";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSlug() {
  return createId().toLowerCase().slice(0, 12);
}
