import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = {
  primary:
    "border border-slate-950 bg-slate-950 text-white shadow-sm hover:-translate-y-px hover:brightness-110 hover:shadow-md dark:border-gray-100 dark:bg-gray-100 dark:text-gray-950",
  secondary:
    "border border-slate-300 bg-white text-slate-950 hover:-translate-y-px hover:border-slate-400 hover:bg-gray-50 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:border-gray-600 dark:hover:bg-gray-800",
  ghost:
    "border border-transparent bg-transparent text-slate-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800",
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
        "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-all duration-200 ease-out active:translate-y-0 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60 disabled:shadow-none disabled:active:scale-100 motion-reduce:transform-none motion-reduce:transition-none",
        "dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900",
        buttonVariants[variant],
        buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
}
