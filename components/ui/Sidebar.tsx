"use client";

import {
  BadgeCheck,
  ChevronRight,
  GitFork,
  KeyRound,
  LayoutList,
  LogOut,
  Menu,
  PanelsTopLeft,
  Search,
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
import {
  type WorkspaceOption,
  WorkspaceSwitcher,
} from "@/components/ui/workspace-switcher";

interface SidebarUser {
  name: string | null | undefined;
  email: string | null | undefined;
  image: string | null | undefined;
}

interface SidebarProps {
  activeOrgId: string;
  signInProvider: string | null;
  user: SidebarUser;
  workspaces: WorkspaceOption[];
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

function getProviderDetails(provider: string | null) {
  if (provider === "github") {
    return {
      label: "GitHub",
      icon: GitFork,
    };
  }

  if (provider === "google") {
    return {
      label: "Google",
      icon: Search,
    };
  }

  return {
    label: "Secure account",
    icon: KeyRound,
  };
}

function SignOutButton({ compact = false }: { compact?: boolean }) {
  return (
    <button
      type="button"
      onClick={() => {
        void signOut({ callbackUrl: "/login" });
      }}
      className={cn(
        "group inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 ease-out active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-900",
        compact
          ? "relative h-14 flex-1 flex-col gap-1 text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
          : "h-10 w-full gap-2 border border-slate-200 bg-white px-3 text-sm text-slate-700 hover:-translate-y-px hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 hover:shadow-sm dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-100",
      )}
    >
      <LogOut
        aria-hidden="true"
        className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
      />
      <span>Sign out</span>
    </button>
  );
}

function SidebarContent({
  activeOrgId,
  signInProvider,
  user,
  workspaces,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const provider = getProviderDetails(signInProvider);
  const ProviderIcon = provider.icon;

  return (
    <>
      <div className="flex h-16 items-center border-b border-slate-200/80 px-4 dark:border-gray-800">
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="group flex items-center gap-2.5 rounded-md px-1 py-1 text-slate-950 dark:text-gray-100"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-950 text-white shadow-sm transition-transform duration-300 ease-out group-hover:-rotate-3 group-hover:scale-105 dark:bg-gray-100 dark:text-gray-950">
            <PanelsTopLeft aria-hidden="true" className="h-4 w-4" />
          </span>
          <span className="text-lg font-bold">Formly</span>
        </Link>
      </div>

      <div className="px-3 pt-3">
        <WorkspaceSwitcher
          activeOrgId={activeOrgId}
          workspaces={workspaces}
        />
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-4">
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
                "group relative flex h-11 items-center gap-3 overflow-hidden rounded-md px-3 text-sm font-medium text-slate-600 transition-all duration-200 ease-out hover:translate-x-0.5 hover:bg-slate-100 hover:text-slate-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
                isActive &&
                  "bg-slate-100 text-slate-950 shadow-sm ring-1 ring-inset ring-slate-200 hover:translate-x-0 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700",
              )}
            >
              <span
                className={cn(
                  "absolute inset-y-2 left-0 w-0.5 origin-center scale-y-0 rounded-full bg-blue-500 transition-transform duration-300",
                  isActive && "scale-y-100",
                )}
              />
              <Icon
                aria-hidden="true"
                className="h-4 w-4 transition-transform duration-200 ease-out group-hover:scale-110"
              />
              <span className="flex-1">{item.label}</span>
              <ChevronRight
                aria-hidden="true"
                className={cn(
                  "h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all duration-200",
                  isActive && "translate-x-0 opacity-60",
                )}
              />
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2.5 border-t border-slate-200/80 px-3 pb-3 pt-3 dark:border-gray-800">
        <div className="group flex items-center gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 transition-all duration-200 hover:border-slate-300 hover:bg-white hover:shadow-sm dark:border-gray-700 dark:bg-gray-800/70 dark:hover:border-gray-600 dark:hover:bg-gray-800">
          <div className="relative">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-950 text-sm font-semibold text-white ring-2 ring-white transition-transform duration-300 group-hover:scale-105 dark:bg-gray-100 dark:text-gray-950 dark:ring-gray-800">
              {getUserInitial(user)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-slate-50 dark:ring-gray-800">
              <BadgeCheck aria-hidden="true" className="h-2.5 w-2.5" />
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-950 dark:text-gray-100">
              {getUserDisplayName(user)}
            </p>
            <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-slate-500 dark:text-gray-400">
              <ProviderIcon aria-hidden="true" className="h-3 w-3 shrink-0" />
              <span className="truncate">{provider.label}</span>
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
              "group relative flex h-14 flex-1 flex-col items-center justify-center gap-1 rounded-md text-xs font-medium text-slate-600 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100",
              isActive &&
                "bg-slate-100 text-slate-950 dark:bg-gray-800 dark:text-gray-100",
            )}
          >
            <span
              className={cn(
                "absolute top-0 h-0.5 w-5 scale-x-0 rounded-full bg-blue-500 transition-transform duration-300",
                isActive && "scale-x-100",
              )}
            />
            <Icon
              aria-hidden="true"
              className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5"
            />
            <span>{item.label}</span>
          </Link>
        );
      })}
      <SignOutButton compact />
    </nav>
  );
}

export function Sidebar({
  activeOrgId,
  signInProvider,
  user,
  workspaces,
}: SidebarProps) {
  const [isTabletOpen, setIsTabletOpen] = useState(false);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur dark:border-gray-800 dark:bg-gray-900/95 md:hidden">
        <Link
          href="/dashboard"
          aria-label="Formly dashboard"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-slate-950 text-white shadow-sm dark:bg-gray-100 dark:text-gray-950"
        >
          <PanelsTopLeft aria-hidden="true" className="h-4 w-4" />
        </Link>
        <WorkspaceSwitcher
          activeOrgId={activeOrgId}
          workspaces={workspaces}
          className="min-w-0 flex-1"
        />
      </div>

      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setIsTabletOpen(true)}
        className="fixed left-4 top-4 z-40 hidden h-11 w-11 items-center justify-center rounded-md border border-slate-200 bg-white/90 text-slate-700 shadow-sm backdrop-blur transition-all duration-200 hover:-translate-y-px hover:border-slate-300 hover:bg-white hover:text-slate-950 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900/90 dark:text-gray-200 dark:hover:border-gray-600 dark:hover:bg-gray-900 dark:hover:text-gray-100 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-950 md:flex lg:hidden"
      >
        <Menu aria-hidden="true" className="h-4 w-4" />
      </button>

      {isTabletOpen ? (
        <div className="animate-overlayIn fixed inset-0 z-50 hidden bg-slate-950/45 backdrop-blur-[2px] md:block lg:hidden">
          <aside className="animate-slideInLeft flex h-full w-72 flex-col border-r border-slate-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setIsTabletOpen(false)}
              className="absolute left-[18rem] top-4 flex h-10 w-10 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-md transition-all duration-200 hover:rotate-90 hover:bg-slate-100 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-gray-100 dark:focus:ring-gray-200 dark:focus:ring-offset-gray-950"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
            <SidebarContent
              activeOrgId={activeOrgId}
              signInProvider={signInProvider}
              user={user}
              workspaces={workspaces}
              onNavigate={() => setIsTabletOpen(false)}
            />
          </aside>
        </div>
      ) : null}

      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-slate-200/80 bg-white shadow-[8px_0_30px_-24px_rgba(15,23,42,0.35)] dark:border-gray-800 dark:bg-gray-900 lg:flex">
        <SidebarContent
          activeOrgId={activeOrgId}
          signInProvider={signInProvider}
          user={user}
          workspaces={workspaces}
        />
      </aside>

      <MobileBottomNav />
    </>
  );
}
