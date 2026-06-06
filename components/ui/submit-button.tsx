"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/Button";

interface SubmitButtonProps {
  children: string;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function SubmitButton({
  children,
  className,
  variant = "primary",
  size = "md",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className={className}
      variant={variant}
      size={size}
      disabled={pending}
      aria-label={pending ? `${children} in progress` : undefined}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );
}
