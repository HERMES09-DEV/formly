import type { Metadata } from "next";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  ClipboardList,
  FileDown,
  GitBranch,
  LayoutDashboard,
  Link2,
  LockKeyhole,
  Moon,
  MousePointer2,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Formly | A clean multi-tenant form builder",
  description:
    "Build drag-and-drop forms, share public links, collect responses, export CSVs, and understand submissions with clean analytics.",
  openGraph: {
    title: "Formly | A clean multi-tenant form builder",
    description:
      "Create polished forms for teams with drag-and-drop fields, public links, analytics, CSV export, dark mode, and secure auth.",
    siteName: "Formly",
    type: "website",
    images: [
      {
        url: "/favicons/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: "Formly logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Formly | A clean multi-tenant form builder",
    description:
      "A clean multi-tenant form builder for teams, public links, responses, analytics, and exports.",
    images: ["/favicons/android-chrome-512x512.png"],
  },
};

interface Feature {
  title: string;
  description: string;
  icon: LucideIcon;
}

const features: Feature[] = [
  {
    title: "Drag-and-drop builder",
    description:
      "Arrange text, email, dropdown, rating, long text, and file fields with a fast builder workflow.",
    icon: MousePointer2,
  },
  {
    title: "Multi-tenant workspaces",
    description:
      "Keep forms, members, invites, and responses scoped to the right organization.",
    icon: Users,
  },
  {
    title: "Public links and embeds",
    description:
      "Publish shareable forms or paste an iframe snippet into any webpage.",
    icon: Link2,
  },
  {
    title: "Conditional logic",
    description:
      "Show fields only when a dropdown or rating answer matches the rule you set.",
    icon: GitBranch,
  },
  {
    title: "Responses and CSV export",
    description:
      "Review submissions in an inbox, open the answer drawer, and export everything to CSV.",
    icon: FileDown,
  },
  {
    title: "Analytics and dark mode",
    description:
      "Track submission trends, field completion, and keep the interface comfortable in any theme.",
    icon: BarChart3,
  },
];

const trustPoints = [
  "Auth.js sign-in with OAuth and magic links",
  "Prisma tenant checks on protected data",
  "Rate-limited public submissions",
  "Accessible focus states and reduced-motion support",
];

function ProductScene() {
  return (
    <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
      <div className="absolute left-1/2 top-24 hidden w-[760px] -translate-x-1/2 opacity-45 lg:block xl:left-[58%] xl:opacity-70">
        <div className="rounded-2xl border border-white/15 bg-white/10 p-3 shadow-2xl shadow-black/30 backdrop-blur-md">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-950">
            <div className="flex h-12 items-center gap-2 border-b border-white/10 px-4">
              <span className="h-3 w-3 rounded-full bg-red-400" />
              <span className="h-3 w-3 rounded-full bg-amber-300" />
              <span className="h-3 w-3 rounded-full bg-emerald-400" />
              <span className="ml-3 h-5 w-36 rounded-full bg-white/10" />
            </div>
            <div className="grid min-h-[430px] grid-cols-[180px_1fr_220px]">
              <div className="border-r border-white/10 bg-white/[0.04] p-4">
                <div className="mb-7 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-slate-950">
                    <LayoutDashboard className="h-4 w-4" />
                  </span>
                  <span className="h-4 w-20 rounded-full bg-white/20" />
                </div>
                <div className="space-y-3">
                  <div className="h-9 rounded-lg bg-white text-slate-950" />
                  <div className="h-9 rounded-lg bg-white/10" />
                  <div className="h-9 rounded-lg bg-white/10" />
                </div>
              </div>
              <div className="p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="h-5 w-44 rounded-full bg-white/80" />
                    <div className="mt-2 h-3 w-28 rounded-full bg-white/20" />
                  </div>
                  <div className="h-9 w-24 rounded-md bg-blue-400" />
                </div>
                <div className="space-y-3">
                  {["Email", "Rating", "Comments", "Upload"].map(
                    (label, index) => (
                      <div
                        key={label}
                        className="animate-moduleIn rounded-xl border border-white/10 bg-white/[0.06] p-4"
                        style={{ animationDelay: `${index * 70}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 rounded-md bg-white/10" />
                            <div>
                              <div className="h-3 w-28 rounded-full bg-white/60" />
                              <div className="mt-2 h-2.5 w-16 rounded-full bg-white/20" />
                            </div>
                          </div>
                          <span className="h-6 w-16 rounded-full bg-emerald-300/80" />
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="border-l border-white/10 bg-white/[0.04] p-4">
                <div className="h-4 w-28 rounded-full bg-white/70" />
                <div className="mt-5 space-y-3">
                  <div className="h-10 rounded-md bg-white/10" />
                  <div className="h-10 rounded-md bg-white/10" />
                  <div className="h-20 rounded-md bg-white/10" />
                </div>
                <div className="mt-6 rounded-xl bg-emerald-300/90 p-4 text-slate-950">
                  <div className="h-4 w-24 rounded-full bg-slate-950/80" />
                  <div className="mt-3 h-2.5 w-32 rounded-full bg-slate-950/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-4 bottom-6 rounded-2xl border border-white/10 bg-white/[0.06] p-4 opacity-80 backdrop-blur md:hidden">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 w-28 rounded-full bg-white/70" />
            <div className="mt-2 h-2.5 w-20 rounded-full bg-white/25" />
          </div>
          <div className="h-9 w-20 rounded-md bg-blue-400" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-12 rounded-lg bg-white/10" />
          <div className="h-12 rounded-lg bg-white/10" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main id="main-content" className="bg-white text-slate-950 dark:bg-gray-950">
      <section className="relative min-h-[78svh] overflow-hidden bg-slate-950 text-white">
        <ProductScene />
        <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <Link
            href="/"
            aria-label="Formly home"
            className="inline-flex items-center gap-2 rounded-md text-white"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-white text-slate-950">
              <ClipboardList aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="font-display text-lg font-bold">Formly</span>
          </Link>
          <nav aria-label="Public navigation" className="flex items-center gap-2">
            <Link
              href="/privacy"
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white sm:inline-flex"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:text-white sm:inline-flex"
            >
              Terms
            </Link>
            <Link
              href="/login"
              className="inline-flex h-10 items-center justify-center rounded-md bg-white px-4 text-sm font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-px hover:bg-slate-100"
            >
              Sign in
            </Link>
          </nav>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(78svh-5rem)] max-w-6xl flex-col justify-center px-4 pb-32 pt-10 sm:px-6 md:pb-20">
          <p className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-white/80 backdrop-blur">
            <Sparkles aria-hidden="true" className="h-4 w-4 text-blue-300" />
            Multi-tenant forms for focused teams
          </p>
          <h1 className="mt-6 max-w-3xl text-6xl font-semibold tracking-normal text-white sm:text-7xl lg:text-8xl">
            Formly
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/78 sm:text-lg">
            A clean multi-tenant form builder with drag-and-drop fields,
            public share links, embedded forms, responses, analytics, exports,
            dark mode, and secure team access.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-md bg-white px-5 text-sm font-semibold text-slate-950 shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-px hover:bg-slate-100"
            >
              Start building
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="#features"
              className="inline-flex h-12 items-center justify-center rounded-md border border-white/20 bg-white/10 px-5 text-sm font-semibold text-white backdrop-blur transition-all duration-200 hover:-translate-y-px hover:bg-white/15"
            >
              See features
            </Link>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-b border-slate-200 bg-white px-4 py-16 dark:border-gray-800 dark:bg-gray-950 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-300">
              Built for v1 teams
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-gray-100 sm:text-4xl">
              Everything needed to ship forms that feel finished.
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="animate-moduleIn rounded-lg border border-slate-200 bg-slate-50 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:bg-white hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700 dark:hover:bg-gray-900"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white text-blue-600 shadow-sm dark:bg-gray-800 dark:text-blue-300">
                    <Icon aria-hidden="true" className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-slate-950 dark:text-gray-100">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 px-4 py-16 dark:bg-gray-900 sm:px-6">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
              Confidence pass
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-gray-100 sm:text-4xl">
              Built with trust, accessibility, and operator speed in mind.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-gray-300">
              Formly keeps the public respondent experience calm while giving
              workspace owners the controls they expect: auth, org membership,
              deletion controls, privacy pages, and reliable submission
              handling.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-950">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                <ShieldCheck aria-hidden="true" className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-semibold text-slate-950 dark:text-gray-100">
                  Production-minded defaults
                </h3>
                <p className="text-sm text-slate-500 dark:text-gray-400">
                  Small details that make the product easier to trust.
                </p>
              </div>
            </div>
            <ul className="mt-5 space-y-3">
              {trustPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-sm text-slate-700 dark:text-gray-300"
                >
                  <CheckCircle2
                    aria-hidden="true"
                    className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-300"
                  />
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-xs font-medium text-slate-600 dark:text-gray-300">
              <div className="rounded-md bg-slate-50 p-3 dark:bg-gray-900">
                <LockKeyhole
                  aria-hidden="true"
                  className="mx-auto mb-2 h-4 w-4"
                />
                Secure
              </div>
              <div className="rounded-md bg-slate-50 p-3 dark:bg-gray-900">
                <Moon aria-hidden="true" className="mx-auto mb-2 h-4 w-4" />
                Dark
              </div>
              <div className="rounded-md bg-slate-50 p-3 dark:bg-gray-900">
                <Sparkles
                  aria-hidden="true"
                  className="mx-auto mb-2 h-4 w-4"
                />
                Polished
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white px-4 py-8 dark:border-gray-800 dark:bg-gray-950 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 text-sm text-slate-500 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
          <p>Formly. A clean multi-tenant form builder.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:text-slate-950 dark:hover:text-gray-100">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-950 dark:hover:text-gray-100">
              Terms
            </Link>
            <Link href="/login" className="hover:text-slate-950 dark:hover:text-gray-100">
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
