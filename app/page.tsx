import { redirect } from "next/navigation";



export const metadata: Metadata = {
  title: "Formly | A clean multi-tenant form builder",
};

export default function Home() {
  redirect("/dashboard");
};
