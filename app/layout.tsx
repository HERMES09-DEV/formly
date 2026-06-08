import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import { Toaster } from "sonner";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { SkipLink } from "@/components/ui/skip-link";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const metadataBase = new URL(
  process.env.NEXTAUTH_URL ?? "http://localhost:3000",
);

export const metadata: Metadata = {
  metadataBase,
  title: "Formly",
  description: "A workspace-focused form builder",
  manifest: "/favicons/site.webmanifest",
  icons: {
    icon: [
      {
        url: "/favicons/favicon.ico",
      },
      {
        url: "/favicons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/favicons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
};

const themeScript = `
(function () {
  try {
    var savedTheme = localStorage.getItem("formly-theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
    }
  } catch (error) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} font-sans`}
      >
        <SkipLink />
        <NavigationProgress />
        {children}
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
