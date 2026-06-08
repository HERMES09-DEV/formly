"use client";

import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

function isPlainLeftClick(event: MouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function getAnchorFromEvent(event: MouseEvent) {
  if (!(event.target instanceof Element)) {
    return null;
  }

  return event.target.closest<HTMLAnchorElement>("a[href]");
}

function shouldShowNavigation(anchor: HTMLAnchorElement) {
  if (anchor.target && anchor.target !== "_self") {
    return false;
  }

  if (anchor.hasAttribute("download")) {
    return false;
  }

  const url = new URL(anchor.href);

  if (url.origin !== window.location.origin) {
    return false;
  }

  if (url.href === window.location.href) {
    return false;
  }

  return true;
}

export function NavigationProgress() {
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    function clearPendingTimeout() {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }

    function startNavigation() {
      clearPendingTimeout();
      setIsNavigating(true);
      timeoutRef.current = setTimeout(() => setIsNavigating(false), 1800);
    }

    function handleClick(event: MouseEvent) {
      if (!isPlainLeftClick(event)) {
        return;
      }

      const anchor = getAnchorFromEvent(event);

      if (!anchor || !shouldShowNavigation(anchor)) {
        return;
      }

      startNavigation();
    }

    function handlePopState() {
      startNavigation();
    }

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      clearPendingTimeout();
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setIsNavigating(false), 180);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <>
      <div
        aria-hidden="true"
        className={cn(
          "fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-transparent transition-opacity duration-150",
          isNavigating ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <span className="animate-navSweep block h-full w-1/2 rounded-r-full bg-blue-500 shadow-[0_0_18px_rgba(59,130,246,0.65)] dark:bg-blue-400" />
      </div>

      <div
        role="status"
        aria-live="polite"
        className={cn(
          "fixed bottom-5 left-1/2 z-[100] hidden -translate-x-1/2 items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium text-slate-700 shadow-lg shadow-slate-900/10 backdrop-blur transition-all duration-200 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-200 dark:shadow-black/30 sm:flex",
          isNavigating
            ? "translate-y-0 opacity-100"
            : "pointer-events-none translate-y-2 opacity-0",
        )}
      >
        <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />
        Opening page
        <span aria-hidden="true" className="animate-loadingDots w-5" />
      </div>
    </>
  );
}
