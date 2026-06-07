"use client";

import { Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

interface SubmitButtonProps {
  children: ReactNode;
  pendingLabel?: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function SubmitButton({
  children,
  pendingLabel,
  className,
  variant = "primary",
  size = "md",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const accessiblePendingLabel =
    pendingLabel ??
    (typeof children === "string" ? `${children} in progress` : "Submitting");

  return (
    <Button
      type="submit"
      className={className}
      variant={variant}
      size={size}
      disabled={pending}
      aria-label={pending ? accessiblePendingLabel : undefined}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );
}
