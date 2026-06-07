"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <div
      key={pathname}
      className="animate-routeIn mx-auto w-full max-w-[1600px]"
    >
      {children}
    </div>
  );
}
