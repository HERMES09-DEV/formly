"use client";

import { Link2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CopyLinkButtonProps {
  slug: string;
  published: boolean;
}

export function CopyLinkButton({ slug, published }: CopyLinkButtonProps) {
  const [copied, setCopied] = useState(false);
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    },
    [],
  );

  function handleCopy() {
    if (!published) {
      return;
    }

    const publicUrl = `${window.location.origin}/f/${slug}`;

    void navigator.clipboard
      .writeText(publicUrl)
      .then(() => {
        setCopied(true);
        toast.success("Link copied to clipboard!");

        if (resetTimerRef.current) {
          clearTimeout(resetTimerRef.current);
        }

        resetTimerRef.current = setTimeout(() => {
          setCopied(false);
          resetTimerRef.current = null;
        }, 2000);
      })
      .catch(() => {
        toast.error("Could not copy link.");
      });
  }

  return (
    <button
      type="button"
      disabled={!published}
      title={
        published
          ? undefined
          : "Publish the form first to get a shareable link"
      }
      aria-label={copied ? "Link copied" : "Copy form link"}
      onClick={handleCopy}
      className={cn(
        "flex items-center justify-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors duration-150",
        published
          ? "border border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          : "cursor-not-allowed text-gray-400",
      )}
    >
      <Link2 aria-hidden="true" className="h-4 w-4" />
      <span className="hidden md:inline">
        {copied ? "Copied!" : "Copy link"}
      </span>
    </button>
  );
}
