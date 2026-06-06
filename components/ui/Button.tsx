import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "border border-slate-950 bg-slate-950 text-white hover:brightness-110 dark:border-gray-100 dark:bg-gray-100 dark:text-gray-950",
  secondary:
    "border border-slate-300 bg-white text-slate-950 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800",
  ghost:
    "border border-transparent bg-transparent text-slate-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900",
};

const buttonSizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-base",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
        "dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}
