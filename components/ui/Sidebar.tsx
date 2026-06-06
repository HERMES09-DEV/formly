"use client";

import {
  LayoutList,
  LogOut,
  Menu,
  Settings,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface SidebarUser {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
}

interface SidebarProps {
  orgId: string;
  user: SidebarUser;
}

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  {
    href: "/dashboard/forms",
    label: "Forms",
    icon: LayoutList,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

function getUserInitial(user: SidebarUser) {
  const displayName = user.name ?? user.email ?? "User";
  return displayName.trim().charAt(0).toUpperCase() || "U";
}

function getUserDisplayName(user: SidebarUser) {
  return user.name ?? user.email ?? "User";
}

function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => {
        void signOut({ callbackUrl: "/login" });
      }}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900",
        compact
          ? "h-14 flex-1 flex-col gap-1 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          : "h-9 w-full border border-slate-300 bg-white px-3 text-sm text-slate-950 hover:bg-slate-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800",
      )}
    >
      <LogOut aria-hidden="true" className="h-4 w-4" />
      <span>{compact ? "Sign out" : "Sign out"}</span>
    </button>
  );
}

function SidebarContent({
  orgId,
  user,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 items-center border-b border-slate-200 px-5 dark:border-gray-700">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="text-xl font-bold tracking-tight text-slate-950 dark:text-gray-100"
        >
          Formly
        </Link>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex h-10 items-center gap-2.5 rounded-md border-l-2 border-transparent px-3 text-sm font-medium text-slate-600 transition-colors duration-150 hover:bg-slate-100 hover:text-slate-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                isActive &&
                  "border-blue-500 bg-slate-950 text-white hover:bg-slate-950 hover:text-white dark:bg-gray-100 dark:text-gray-950 dark:hover:bg-gray-100 dark:hover:text-gray-950",
              )}
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-slate-200 px-4 pb-4 pt-3 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white dark:bg-gray-100 dark:text-gray-950">
            {getUserInitial(user)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-950 dark:text-gray-100">
              {getUserDisplayName(user)}
            </p>
            <p className="truncate text-xs text-slate-500 dark:text-gray-400">
              {orgId}
            </p>
          </div>
        </div>
        <ThemeToggle />
        <SignOutButton />
      </div>
    </>
  );
}

function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t border-slate-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] dark:border-gray-700 dark:bg-gray-900 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex h-14 flex-1 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
              isActive && "text-slate-950 dark:text-gray-100",
            )}
          >
            <Icon aria-hidden="true" className="h-4 w-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <SignOutButton compact />
    </nav>
  );
}

export function Sidebar({ orgId, user }: SidebarProps) {
  const [isTabletOpen, setIsTabletOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setIsTabletOpen(true)}
        className="fixed left-4 top-4 z-40 hidden h-11 w-11 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-950 md:flex lg:hidden"
      >
        <Menu aria-hidden="true" className="h-4 w-4" />
      </button>

      {isTabletOpen ? (
        <div className="fixed inset-0 z-50 hidden bg-slate-950/40 md:block lg:hidden">
          <aside className="flex h-full w-72 flex-col border-r border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsTabletOpen(false)}
              className="absolute left-[18rem] top-4 flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-950"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
            <SidebarContent
              orgId={orgId}
              user={user}
              onNavigate={() => setIsTabletOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-900 lg:flex">
        <SidebarContent orgId={orgId} user={user} />
      </aside>

      <MobileBottomNav />
    </>
  );
}
