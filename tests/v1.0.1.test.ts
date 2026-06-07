import assert from "node:assert/strict";
import test from "node:test";
import { hasExactFieldOrder } from "../lib/field-order";
import { inviteEmailMatches, normalizeEmail } from "../lib/invite-email";
import {
  createSubmissionBlobPath,
  getSubmissionFileError,
  getSubmissionRateLimitKey,
  MAX_SUBMISSION_FILE_SIZE,
} from "../lib/submission-file";
import { ReorderFieldsSchema } from "../lib/validations/field";

test("invite emails are normalized before comparison", () => {
  assert.equal(normalizeEmail(" Demo@Formly.dev "), "demo@formly.dev");
  assert.equal(inviteEmailMatches("demo@formly.dev", "DEMO@FORMLY.DEV"), true);
  assert.equal(inviteEmailMatches("owner@formly.dev", "member@formly.dev"), false);
});

test("field ordering requires the complete active field set", () => {
  assert.equal(hasExactFieldOrder(["a", "b", "c"], ["c", "a", "b"]), true);
  assert.equal(hasExactFieldOrder(["a", "b", "c"], ["a", "b"]), false);
  assert.equal(hasExactFieldOrder(["a", "b"], ["a", "a"]), false);
  assert.equal(hasExactFieldOrder(["a", "b"], ["a", "c"]), false);
});

test("reorder validation rejects duplicate field ids", () => {
  const result = ReorderFieldsSchema.safeParse({
    formId: "form-1",
    orderedIds: ["field-1", "field-1"],
  });

  assert.equal(result.success, false);
});

test("submission file policy rejects unsafe or oversized files", () => {
  assert.equal(
    getSubmissionFileError({ size: 1024, type: "application/pdf" }),
    null,
  );
  assert.equal(
    getSubmissionFileError({
      size: MAX_SUBMISSION_FILE_SIZE + 1,
      type: "application/pdf",
    }),
    "File must be 10 MB or smaller.",
  );
  assert.equal(
    getSubmissionFileError({ size: 1024, type: "image/svg+xml" }),
    "This file type is not supported.",
  );
});

test("blob paths and rate-limit keys are scoped to a form", () => {
  const firstPath = createSubmissionBlobPath(
    "form-1",
    "field-1",
    "../../Quarterly report.pdf",
  );
  const secondPath = createSubmissionBlobPath(
    "form-1",
    "field-1",
    "../../Quarterly report.pdf",
  );

  assert.match(
    firstPath,
    /^submissions\/form-1\/field-1\/[a-z0-9]+-Quarterly-report\.pdf$/,
  );
  assert.notEqual(firstPath, secondPath);
  assert.equal(
    getSubmissionRateLimitKey("form-1", "203.0.113.10"),
    "form-1:203.0.113.10",
  );
});
