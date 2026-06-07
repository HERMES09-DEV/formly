"use client";

import { Code2, Copy, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";

interface EmbedDialogProps {
  baseUrl: string;
  slug: string;
}

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, "");
}

export function EmbedDialog({ baseUrl, slug }: EmbedDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const embedUrl = useMemo(
    () => `${normalizeBaseUrl(baseUrl)}/f/${slug}?embed=1`,
    [baseUrl, slug],
  );
  const iframeSnippet = `<iframe src="${embedUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  function closeDialog() {
    setIsOpen(false);
  }

  function copySnippet() {
    void navigator.clipboard
      .writeText(iframeSnippet)
      .then(() => {
        toast.success("Embed code copied");
      })
      .catch(() => {
        toast.error("Could not copy embed code.");
      });
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <Code2 aria-hidden="true" className="h-4 w-4" />
        Embed
      </Button>

      {isOpen ? (
        <div className="animate-overlayIn fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6 backdrop-blur-[2px]">
          <section
            aria-modal="true"
            role="dialog"
            aria-labelledby="embed-dialog-title"
            className="animate-scaleIn w-full max-w-xl rounded-lg border border-slate-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="embed-dialog-title"
                  className="text-lg font-semibold text-slate-950 dark:text-gray-100"
                >
                  Embed form
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeDialog}
                aria-label="Close embed dialog"
                title="Close"
                className="h-9 w-9 px-0"
              >
                <X aria-hidden="true" className="h-4 w-4" />
              </Button>
            </div>

            <textarea
              readOnly
              value={iframeSnippet}
              className="mt-5 min-h-32 w-full resize-none rounded-md border border-slate-300 bg-slate-50 p-3 font-mono text-sm text-slate-950 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-600 dark:text-gray-300">
                Paste this into any webpage to embed your form.
              </p>
              <div className="flex items-center gap-3">
                <Button onClick={copySnippet}>
                  <Copy aria-hidden="true" className="h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
