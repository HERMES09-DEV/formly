import type { FieldType } from "@prisma/client";

export interface ResponseField {
  id: string;
  label: string;
  type: FieldType;
  archivedAt: string | null;
}

export interface ResponseAnswer {
  id: string;
  fieldId: string;
  value: string;
}

export interface ResponseSubmission {
  id: string;
  createdAt: string;
  answers: ResponseAnswer[];
}

export interface ResponsesPagination {
  currentPage: number;
  totalPages: number;
  totalSubmissions: number;
  pageSize: number;
}
