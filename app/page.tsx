import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Formly | A clean multi-tenant form builder",
};

export default function Home() {
  redirect("/dashboard");
}