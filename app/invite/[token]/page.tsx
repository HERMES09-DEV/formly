import type { Metadata } from "next";
import { acceptInvite } from "@/actions/invite";
import { SubmitButton } from "@/components/ui/submit-button";
import { prisma } from "@/lib/prisma";

interface InvitePageProps {
  params: Promise<{
    token: string;
  }>;
}

function ExpiredInvitePage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-gray-950 dark:text-gray-100 sm:py-16">
      <section className="animate-fadeUp mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8">
        <h1 className="text-2xl font-semibold tracking-tight dark:text-gray-100">
          This invite has expired
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-gray-300">
          Ask a workspace owner to send you a new invite.
        </p>
      </section>
    </main>
  );
}

export async function generateMetadata({
  params,
}: InvitePageProps): Promise<Metadata> {
  const { token } = await params;
  const invite = await prisma.invite.findUnique({
    where: {
      token,
    },
    select: {
      accepted: true,
      expiresAt: true,
      org: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!invite || invite.accepted || invite.expiresAt <= new Date()) {
    return {
      title: "Invite expired | Formly",
    };
  }

  return {
    title: `Join ${invite.org.name} | Formly`,
  };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;
  const invite = await prisma.invite.findUnique({
    where: {
      token,
    },
    select: {
      token: true,
      email: true,
      accepted: true,
      expiresAt: true,
      org: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!invite || invite.accepted || invite.expiresAt <= new Date()) {
    return <ExpiredInvitePage />;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-950 dark:bg-gray-950 dark:text-gray-100 sm:py-16">
      <section className="animate-fadeUp mx-auto w-full max-w-xl rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
          Formly invite
        </p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight dark:text-gray-100">
          You&apos;ve been invited to join {invite.org.name}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-gray-300">
          Accept this invite to join the workspace as {invite.email}.
        </p>
        <form action={acceptInvite} className="mt-6">
          <input type="hidden" name="token" value={invite.token} />
          <SubmitButton className="h-11">
            Accept invite
          </SubmitButton>
        </form>
      </section>
    </main>
  );
}
