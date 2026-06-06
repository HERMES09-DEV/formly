import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Settings | Formly",
};

export default function SettingsPage() {
  redirect("/dashboard/settings/members");
}
